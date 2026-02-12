import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

interface FeedbackProps {
    openModal: boolean
    closeModal: () => void
}

const Feedback = ({ openModal, closeModal }: FeedbackProps) => {
    const { activeAddress } = useWallet()
    const { enqueueSnackbar } = useSnackbar()
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState('')

    const submitFeedback = async () => {
        if (!activeAddress) return enqueueSnackbar('Connect wallet first', { variant: 'error' })
        if (!feedback.trim()) return enqueueSnackbar('Enter feedback', { variant: 'error' })

        setLoading(true)
        try {
            // 1. Sign (in reality signer)
            // await signFeedback...

            // 2. Mock AI Analysis Call (since backend might be complex for demo)
            // Or call actual endpoint
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/feedback/submit-demo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    feedbackText: feedback,
                    walletAddress: activeAddress
                })
            })

            if (!response.ok) throw new Error('Failed to submit feedback')

            enqueueSnackbar('Feedback anchored on-chain! Sentiment Analyzed.', { variant: 'success' })
            setFeedback('')
            closeModal()
        } catch (e: any) {
            enqueueSnackbar(e.message, { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <dialog id="feedback_modal" className={`modal ${openModal ? 'modal-open' : ''} backdrop-blur-sm`}>
            <form method="dialog" className="modal-box bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl max-w-2xl text-white">
                <h3 className="font-bold text-2xl mb-2 text-purple-400">Submit Feedback</h3>
                <p className="text-slate-400 text-sm mb-6">AI analyzes sentiment & anchors hash on-chain for privacy.</p>

                <div className="space-y-4">
                    <textarea
                        className="textarea textarea-bordered h-32 w-full bg-slate-800 border-slate-600 focus:border-purple-500 text-white text-lg"
                        placeholder="Tell us about your campus experience..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    ></textarea>

                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Minimum 10 characters</span>
                        <span>{feedback.length} chars</span>
                    </div>

                    <div className="alert bg-purple-900/20 border-purple-500/20 text-purple-200 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <div>
                            <span className="font-bold">Privacy Note:</span> Your text is NEVER stored on-chain. Only the AI score and SHA256 hash are recorded.
                        </div>
                    </div>
                </div>

                <div className="modal-action mt-8">
                    <button className="btn btn-ghost text-slate-400 hover:text-white" onClick={closeModal} disabled={loading}>Cancel</button>
                    <button
                        className={`btn bg-purple-600 hover:bg-purple-500 text-white border-none px-8 ${loading ? 'loading' : ''}`}
                        onClick={submitFeedback}
                        disabled={loading || feedback.length < 10}
                    >
                        {loading ? 'Analyzing...' : 'Anchor Feedback'}
                    </button>
                </div>
            </form>
        </dialog>
    )
}

export default Feedback
