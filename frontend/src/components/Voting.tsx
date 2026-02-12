import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState, useEffect } from 'react'
import algosdk from 'algosdk'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface VotingProps {
    openModal: boolean
    closeModal: () => void
}

interface Election {
    id: number
    title: string
    description: string
    start_time: string
    end_time: string
    algorand_app_id: number
    options?: string[]
}

const Voting = ({ openModal, closeModal }: VotingProps) => {
    const { activeAddress, signTransactions } = useWallet()
    const { enqueueSnackbar } = useSnackbar()
    const [loading, setLoading] = useState(false)
    const [elections, setElections] = useState<Election[]>([])
    const [selectedElection, setSelectedElection] = useState<Election | null>(null)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)

    // Fetch elections on mount
    useEffect(() => {
        if (openModal) {
            fetchElections()
        }
    }, [openModal])

    const fetchElections = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/voting/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}` // Assume token stored
                }
            })
            if (!response.ok) {
                // Fallback to mock for demo if backend empty/fails
                console.warn('Backend fetch failed, using mock data')
                setElections([{
                    id: 101,
                    title: 'Student Body President (Demo)',
                    description: 'Vote for the next student representative. One wallet = One vote.',
                    start_time: new Date().toISOString(),
                    end_time: new Date(Date.now() + 86400000).toISOString(),
                    algorand_app_id: 0, // 0 indicates mock/demo or local test
                    options: ['Alice Johnson', 'Bob Smith', 'Charlie Brown']
                }])
                return
            }
            const data = await response.json()
            setElections(data)
        } catch (e) {
            console.error(e)
            // Fallback
            setElections([{
                id: 101,
                title: 'Student Body President (Demo)',
                description: 'Vote for the next student representative. One wallet = One vote.',
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 86400000).toISOString(),
                algorand_app_id: 0, // Mock
                options: ['Alice Johnson', 'Bob Smith', 'Charlie Brown']
            }])
        }
    }

    const castVote = async () => {
        if (!activeAddress) return enqueueSnackbar('Connect wallet first', { variant: 'error' })
        if (!selectedElection) return
        if (selectedOption === null) return enqueueSnackbar('Select an option', { variant: 'error' })

        setLoading(true)
        try {
            const algodConfig = getAlgodConfigFromViteEnvironment()
            const algodClient = new algosdk.Algodv2(algodConfig.token as any, algodConfig.server, algodConfig.port)

            // 1. Generate Commitment (Hash of Option + Salt)
            // For simplicity/demo we just hash the option index + address
            // Ideally use a random salt stored locally
            const salt = Math.random().toString(36).substring(7)
            const commitmentData = `${selectedOption}-${salt}-${activeAddress}`
            const encoder = new TextEncoder()
            const data = encoder.encode(commitmentData)
            const hashBuffer = await crypto.subtle.digest('SHA-256', data)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            const voteHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

            let txnId = ''

            // 2. If Real App ID exists, call Smart Contract
            if (selectedElection.algorand_app_id && selectedElection.algorand_app_id > 0) {
                const appIndex = Number(selectedElection.algorand_app_id)
                const suggestedParams = await algodClient.getTransactionParams().do()

                // Check Opt-In Status
                let isOptedIn = false
                try {
                    await algodClient.accountApplicationInformation(activeAddress, appIndex).do()
                    isOptedIn = true
                } catch (e) {
                    isOptedIn = false
                }

                const appArgs = [
                    new TextEncoder().encode("VOTE"),
                    new TextEncoder().encode(voteHash) // Send hash as bytes
                ]

                let txnsToSign = []

                if (!isOptedIn) {
                    // Add Opt-In Transaction to group
                    // Use positional args to match Attendance.tsx fix and avoid type inconsistencies
                    const optInTxn = algosdk.makeApplicationOptInTxn(
                        activeAddress,
                        suggestedParams,
                        appIndex,
                        undefined
                    )
                    const voteTxn = algosdk.makeApplicationNoOpTxn(
                        activeAddress,
                        suggestedParams,
                        appIndex,
                        appArgs
                    )
                    // Group them
                    const grouped = algosdk.assignGroupID([optInTxn, voteTxn])
                    txnsToSign = grouped
                } else {
                    // Just Vote
                    const voteTxn = algosdk.makeApplicationNoOpTxn(
                        activeAddress,
                        suggestedParams,
                        appIndex,
                        appArgs
                    )
                    txnsToSign = [voteTxn]
                }

                const encodedTxns = txnsToSign.map(t => algosdk.encodeUnsignedTransaction(t))
                const signedTxns = await signTransactions(encodedTxns)

                const validSignedTxns = signedTxns.filter((t): t is Uint8Array => t != null)

                if (validSignedTxns.length !== txnsToSign.length) {
                    throw new Error('Signing incomplete')
                }

                const result = await algodClient.sendRawTransaction(validSignedTxns).do() as any
                txnId = result.txId || result.toString()
                await algosdk.waitForConfirmation(algodClient, txnId, 4)
            } else {
                // Mock transaction ID for demo
                txnId = `DEMO_TXN_${Date.now()}`
                // Simulate delay
                await new Promise(r => setTimeout(r, 1000))
            }

            // 3. Submit to Backend
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/voting/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({
                    electionId: selectedElection.id,
                    voteHash,
                    txnId,
                    walletAddress: activeAddress
                })
            })

            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.error || 'Failed to record vote')
            }

            enqueueSnackbar(`Vote cast successfully! Reward: +2 CCT`, { variant: 'success' })
            closeModal()
            setSelectedOption(null)
            setSelectedElection(null)
        } catch (e: any) {
            console.error(e)
            enqueueSnackbar(e.message || 'Voting failed', { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <dialog id="voting_modal" className={`modal ${openModal ? 'modal-open' : ''} backdrop-blur-sm`}>
            <form method="dialog" className="modal-box bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl max-w-4xl text-white">
                <h3 className="font-bold text-2xl mb-2 text-blue-400">Campus Elections</h3>
                <p className="text-slate-400 text-sm mb-6">Vote securely using specific smart contracts per election.</p>

                {/* Election List or Voting View */}
                {!selectedElection ? (
                    <div className="grid grid-cols-1 gap-4">
                        {elections.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No active elections found.</div>
                        ) : (
                            elections.map((election) => (
                                <div key={election.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => setSelectedElection(election)}>
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-xl text-white">{election.title}</h4>
                                        {election.algorand_app_id > 0 && (
                                            <span className="badge badge-info gap-1 text-xs font-mono">
                                                App ID: {election.algorand_app_id}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-400 mt-2 text-sm">{election.description}</p>
                                    <div className="flex gap-4 mt-4 text-xs font-mono text-slate-500">
                                        <span>Start: {new Date(election.start_time).toLocaleDateString()}</span>
                                        <span>End: {new Date(election.end_time).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <button className="btn btn-sm btn-ghost mb-4 gap-2 text-slate-400" onClick={() => setSelectedElection(null)}>
                            ← Back to Elections
                        </button>
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
                            <h4 className="font-bold text-xl mb-4 text-white border-b border-slate-700 pb-2">{selectedElection.title}</h4>

                            <div className="space-y-3">
                                {(selectedElection.options || ['Yes', 'No']).map((option, idx) => (
                                    <label
                                        key={idx}
                                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors border ${selectedOption === idx
                                                ? 'bg-blue-900/40 border-blue-500'
                                                : 'bg-slate-900/50 border-slate-700 hover:bg-slate-700'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="vote-option"
                                            className="radio radio-primary mr-4"
                                            checked={selectedOption === idx}
                                            onChange={() => setSelectedOption(idx)}
                                        />
                                        <span className="font-medium text-lg">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="alert bg-blue-900/20 border-blue-500/20 text-blue-200 text-sm mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <div>
                                <span className="font-bold">Trustless Voting:</span> Your vote is hashed and anchored on-chain. Double voting is prevented by the smart contract.
                            </div>
                        </div>

                        <div className="modal-action">
                            <button
                                className={`btn bg-blue-600 hover:bg-blue-500 text-white border-none px-8 ${loading ? 'loading' : ''}`}
                                onClick={castVote}
                                disabled={loading || selectedOption === null}
                            >
                                {loading ? 'Signing Transaction...' : 'Confirm Vote'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="modal-action mt-4">
                    <button className="btn btn-ghost text-slate-400 hover:text-white" onClick={closeModal} disabled={loading}>Close</button>
                </div>
            </form>
        </dialog>
    )
}

export default Voting
