import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState, useEffect, useCallback } from 'react'

interface ReputationDashboardProps {
    openModal: boolean
    closeModal: () => void
}

interface ReputationScores {
    reputation: number
    attendance: number
    voting: number
    feedback: number
    certification: number
}

interface DashboardData {
    reputationTotal: number
    scores: ReputationScores
    cctBalance: number
    stakedBalance: number
    voteWeight: number
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const ReputationDashboard: React.FC<ReputationDashboardProps> = ({ openModal, closeModal }) => {
    const { activeAddress } = useWallet()
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchDashboard = useCallback(async () => {
        if (!activeAddress) return
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`${BACKEND_URL}/api/reputation/dashboard/${activeAddress}`)
            if (!res.ok) throw new Error('Failed to fetch reputation data')
            const json = await res.json()

            setData({
                reputationTotal: json.reputation?.total || 0,
                scores: {
                    reputation: json.reputation?.breakdown?.reputation || 0,
                    attendance: json.reputation?.breakdown?.attendance || 0,
                    voting: json.reputation?.breakdown?.voting || 0,
                    feedback: json.reputation?.breakdown?.feedback || 0,
                    certification: json.reputation?.breakdown?.certification || 0,
                },
                cctBalance: json.cct?.balance || 0,
                stakedBalance: 0, // Read from staking contract in future
                voteWeight: 1,
            })
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }, [activeAddress])

    useEffect(() => {
        if (openModal && activeAddress) {
            fetchDashboard()
        }
    }, [openModal, activeAddress, fetchDashboard])

    if (!openModal) return null

    const pillars = [
        { label: 'Attendance', value: data?.scores.attendance ?? 0, color: 'from-teal-400 to-teal-600', icon: '📋' },
        { label: 'Voting', value: data?.scores.voting ?? 0, color: 'from-blue-400 to-blue-600', icon: '🗳️' },
        { label: 'Feedback', value: data?.scores.feedback ?? 0, color: 'from-amber-400 to-amber-600', icon: '💬' },
        { label: 'Certification', value: data?.scores.certification ?? 0, color: 'from-purple-400 to-purple-600', icon: '🏆' },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl mx-4 bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-teal-500/20 via-blue-500/20 to-purple-500/20 px-8 pt-8 pb-6">
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-2xl"
                    >
                        ✕
                    </button>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-cyan-400 to-purple-400">
                        Reputation & Rewards
                    </h2>
                    <p className="text-sm text-slate-400 mt-1 font-mono">
                        {activeAddress
                            ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
                            : 'No wallet connected'}
                    </p>
                </div>

                {/* Body */}
                <div className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {!activeAddress && (
                        <div className="text-center py-8 text-slate-400">
                            Connect your wallet to view your reputation and rewards.
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-400 mt-3">Loading on-chain data...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
                            {error}
                            <button onClick={fetchDashboard} className="ml-3 underline text-red-200 hover:text-white">Retry</button>
                        </div>
                    )}

                    {activeAddress && !loading && data && (
                        <>
                            {/* Reputation Score Hero */}
                            <div className="text-center py-4">
                                <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-400">
                                    {data.reputationTotal.toLocaleString()}
                                </div>
                                <p className="text-sm text-slate-400 mt-2">Composite Reputation Score (On-Chain)</p>
                            </div>

                            {/* Pillar Breakdown */}
                            <div className="grid grid-cols-2 gap-4">
                                {pillars.map(pillar => (
                                    <div
                                        key={pillar.label}
                                        className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 hover:border-slate-600/60 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{pillar.icon}</span>
                                            <span className="text-sm text-slate-400">{pillar.label}</span>
                                        </div>
                                        <div className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${pillar.color}`}>
                                            {pillar.value.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CCT & Staking Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* CCT Balance */}
                                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">🪙</span>
                                        <span className="text-sm text-amber-300/80">CCT Balance</span>
                                    </div>
                                    <div className="text-3xl font-bold text-amber-300">
                                        {data.cctBalance.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-amber-400/50 mt-1">Campus Credit Tokens</p>
                                </div>

                                {/* Governance Weight */}
                                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">⚖️</span>
                                        <span className="text-sm text-indigo-300/80">Vote Weight</span>
                                    </div>
                                    <div className="text-3xl font-bold text-indigo-300">
                                        {data.voteWeight}x
                                    </div>
                                    <p className="text-xs text-indigo-400/50 mt-1">
                                        {data.stakedBalance > 0
                                            ? `${data.stakedBalance} CCT staked`
                                            : 'Stake CCT for 2x weight'}
                                    </p>
                                </div>
                            </div>

                            {/* Info Banner */}
                            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
                                <strong className="text-slate-400">🔗 Powered by Algorand</strong> — All reputation data is
                                read directly from the blockchain. Scores update automatically when you mark attendance,
                                cast votes, submit feedback, or earn certificates.
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ReputationDashboard
