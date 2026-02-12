import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState, useEffect } from 'react'
import algosdk from 'algosdk'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface AttendanceProps {
    openModal: boolean
    closeModal: () => void
}

interface Event {
    id: number
    eventId: string
    title: string
    startTime: string
    endTime: string
    attendanceAppId: number
}

const Attendance = ({ openModal, closeModal }: AttendanceProps) => {
    const { activeAddress, signTransactions } = useWallet()
    const { enqueueSnackbar } = useSnackbar()
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(false)
    const [processingId, setProcessingId] = useState<number | null>(null)

    useEffect(() => {
        if (openModal) {
            fetchEvents()
        }
    }, [openModal])

    const fetchEvents = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/active`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
            })
            if (!response.ok) {
                console.warn('Backend fetch failed, using mock data')
                setEvents([
                    { id: 1, eventId: 'EVT_CS101', title: 'CS101: Intro to Blockchain (Demo)', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), attendanceAppId: 0 },
                    { id: 2, eventId: 'EVT_GOV', title: 'Campus Governance Town Hall (Demo)', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), attendanceAppId: 0 }
                ])
                return
            }
            const data = await response.json()
            setEvents(data)
        } catch (e) {
            console.error(e)
            setEvents([
                { id: 1, eventId: 'EVT_CS101', title: 'CS101: Intro to Blockchain (Demo)', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), attendanceAppId: 0 },
                { id: 2, eventId: 'EVT_GOV', title: 'Campus Governance Town Hall (Demo)', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), attendanceAppId: 0 }
            ])
        }
    }

    const markAttendance = async (event: Event) => {
        if (!activeAddress) return enqueueSnackbar('Connect wallet first', { variant: 'error' })

        setProcessingId(event.id)
        setLoading(true)

        try {
            const algodConfig = getAlgodConfigFromViteEnvironment()
            const algodClient = new algosdk.Algodv2(algodConfig.token as any, algodConfig.server, algodConfig.port)
            let txnId = ''

            if (event.attendanceAppId && event.attendanceAppId > 0) {
                const appIndex = Number(event.attendanceAppId)
                const suggestedParams = await algodClient.getTransactionParams().do()

                // Check Opt-In Status
                let isOptedIn = false
                try {
                    await algodClient.accountApplicationInformation(activeAddress, appIndex).do()
                    isOptedIn = true
                } catch (e) {
                    isOptedIn = false
                }

                // CHECK_IN arg
                const appArgs = [new TextEncoder().encode("CHECK_IN")]

                let txnsToSign = []

                if (!isOptedIn) {
                    // Group OptIn + CheckIn
                    // Use positional args to avoid type/linter issues
                    const optInTxn = algosdk.makeApplicationOptInTxn(
                        activeAddress,
                        suggestedParams,
                        appIndex,
                        undefined
                    )
                    const checkInTxn = algosdk.makeApplicationNoOpTxn(
                        activeAddress,
                        suggestedParams,
                        appIndex,
                        appArgs
                    )

                    const grouped = algosdk.assignGroupID([optInTxn, checkInTxn])
                    txnsToSign = grouped
                } else {
                    const checkInTxn = algosdk.makeApplicationNoOpTxn(
                        activeAddress,
                        suggestedParams,
                        appIndex,
                        appArgs
                    )
                    txnsToSign = [checkInTxn]
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
                // Mock
                txnId = `DEMO_TXN_${Date.now()}`
                await new Promise(r => setTimeout(r, 1000))
            }

            // Call Backend to Record
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/mark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({
                    eventId: event.eventId,
                    walletAddress: activeAddress,
                    txnId
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to record attendance')
            }

            enqueueSnackbar(`Attendance marked! Reward: +1 CCT`, { variant: 'success' })
        } catch (e: any) {
            console.error(e)
            enqueueSnackbar(e.message || 'Failed to mark attendance', { variant: 'error' })
        } finally {
            setLoading(false)
            setProcessingId(null)
        }
    }

    return (
        <dialog id="attendance_modal" className={`modal ${openModal ? 'modal-open' : ''} backdrop-blur-sm`}>
            <form method="dialog" className="modal-box bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl max-w-2xl text-white">
                <h3 className="font-bold text-2xl mb-2 text-teal-400">Mark Attendance</h3>
                <p className="text-slate-400 text-sm mb-6">Check-in active events to earn CCT and Reputation.</p>

                <div className="space-y-4">
                    {events.map((evt) => (
                        <div key={evt.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-lg">{evt.title}</h4>
                                <div className="text-xs text-slate-400 font-mono mt-1">ID: {evt.eventId}</div>
                                {evt.attendanceAppId > 0 && <span className="badge badge-xs badge-info mt-1">App: {evt.attendanceAppId}</span>}
                                <div className="text-xs text-emerald-400 mt-1">Active Now</div>
                            </div>
                            <button
                                className={`btn btn-sm bg-teal-600 hover:bg-teal-500 text-white border-none ${processingId === evt.id ? 'loading' : ''}`}
                                onClick={() => markAttendance(evt)}
                                disabled={loading && processingId !== evt.id}
                            >
                                {processingId === evt.id ? 'Signing...' : 'Check In'}
                            </button>
                        </div>
                    ))}
                    {events.length === 0 && <div className="text-center text-slate-500">No active events found.</div>}
                </div>

                <div className="modal-action mt-8">
                    <button className="btn btn-ghost text-slate-400 hover:text-white" onClick={closeModal} disabled={loading}>Close</button>
                </div>
            </form>
        </dialog>
    )
}

export default Attendance
