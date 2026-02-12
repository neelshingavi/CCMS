import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Attendance from './components/Attendance'
import Voting from './components/Voting'
import Feedback from './components/Feedback'
import MintNFT from './components/MintNFT'
import Bank from './components/Bank'
import ReputationDashboard from './components/ReputationDashboard'
import AssetOptIn from './components/AssetOptIn'
import SendAlgo from './components/SendAlgo'
import FeatureCard from './components/FeatureCard'

interface HomeProps { }

/**
 * Icons mapped to features for cleaner JSX
 */
const Icons = {
  attendance: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  voting: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
  ),
  feedback: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
  ),
  cert: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  reputation: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
  ),
  staking: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )
}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)

  // Feature Modals
  const [attendanceModal, setAttendanceModal] = useState<boolean>(false)
  const [votingModal, setVotingModal] = useState<boolean>(false)
  const [feedbackModal, setFeedbackModal] = useState<boolean>(false)
  const [certificateModal, setCertificateModal] = useState<boolean>(false)
  const [reputationModal, setReputationModal] = useState<boolean>(false)
  const [stakingModal, setStakingModal] = useState<boolean>(false)
  const [assetOptInModal, setAssetOptInModal] = useState<boolean>(false)
  const [sendAlgoModal, setSendAlgoModal] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const features = [
    {
      title: 'Mark Attendance',
      description: 'Verify presence at events via geo-fence or time-window.',
      icon: Icons.attendance,
      color: 'teal',
      btnText: activeAddress ? 'Check In Now' : 'Connect Wallet',
      action: () => setAttendanceModal(true)
    },
    {
      title: 'Cast Vote',
      description: 'Use your wallet ID to vote securely in campus elections.',
      icon: Icons.voting,
      color: 'blue',
      btnText: activeAddress ? 'View Elections' : 'Connect Wallet',
      action: () => setVotingModal(true)
    },
    {
      title: 'Submit Feedback',
      description: 'AI analyzes sentiment anonymously and anchors it on-chain.',
      icon: Icons.feedback,
      color: 'purple',
      btnText: activeAddress ? 'Start Feedback' : 'Connect Wallet',
      action: () => setFeedbackModal(true)
    },
    {
      title: 'Issue Certificate',
      description: 'Mint verifiable NFT certificates for your achievements.',
      icon: Icons.cert,
      color: 'indigo',
      btnText: activeAddress ? 'Mint NFT' : 'Connect Wallet',
      action: () => setCertificateModal(true)
    },
    {
      title: 'Reputation & Rewards',
      description: 'Check your on-chain score and accumulated CCT tokens.',
      icon: Icons.reputation,
      color: 'cyan',
      btnText: activeAddress ? 'View Dashboard' : 'Connect Wallet',
      action: () => setReputationModal(true)
    },
    {
      title: 'Staking & DeFi',
      description: 'Stake tokens to increase your governance voting weight.',
      icon: Icons.staking,
      color: 'amber',
      btnText: activeAddress ? 'Manage Stake' : 'Connect Wallet',
      action: () => setStakingModal(true)
    }
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white relative font-sans flex flex-col">
      {/* Navbar / Connect Wallet */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg"></div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">CCMS</span>
        </div>

        <button
          data-test-id="connect-wallet"
          className={`px-5 py-2 rounded-full font-bold transition-all duration-300 shadow-lg border text-sm
            ${activeAddress
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20'
              : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 hover:scale-105'
            }`}
          onClick={toggleWalletModal}
        >
          {activeAddress ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              {activeAddress.slice(0, 4)}...{activeAddress.slice(-4)}
            </span>
          ) : 'Connect Wallet'}
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 px-6 sm:px-12 lg:px-24 flex-grow-0">
        {/* Background Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-mono mb-8 backdrop-blur-md">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Hackspiration'26 · Track 2: AI & Automation
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Governance, <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500">Automated.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A fully trustless campus management system.
            Automated attendance, verifiable voting, and AI-powered feedback—anchored on Algorand.
          </p>

          {!activeAddress && (
            <button
              onClick={toggleWalletModal}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all"
            >
              Connect Wallet to Start
            </button>
          )}
        </div>
      </div>

      {/* Primary Features Grid */}
      <div id="features" className="max-w-7xl mx-auto px-6 pb-24 w-full">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-white">Core Modules</h2>
          <div className="h-px bg-slate-800 flex-grow"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard
              key={idx}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              colorClass={feature.color}
              buttonText={feature.btnText}
              onClick={feature.action}
              disabled={!activeAddress}
            />
          ))}
        </div>

        {/* Utilities Section */}
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-400">Utilities</h2>
            <div className="h-px bg-slate-800 flex-grow"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setAssetOptInModal(true)}
              disabled={!activeAddress}
              className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 text-left group"
            >
              <div>
                <h4 className="font-bold text-slate-300 group-hover:text-white">Asset Opt-In</h4>
                <p className="text-xs text-slate-500">Enable ASAs</p>
              </div>
              <div className="text-slate-500 group-hover:text-emerald-400">→</div>
            </button>

            <button
              onClick={() => setSendAlgoModal(true)}
              disabled={!activeAddress}
              className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 text-left group"
            >
              <div>
                <h4 className="font-bold text-slate-300 group-hover:text-white">Send Payments</h4>
                <p className="text-xs text-slate-500">Transfer ALGO</p>
              </div>
              <div className="text-slate-500 group-hover:text-emerald-400">→</div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-auto min-h-[100px]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© 2026 CCMS Protocol. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <Attendance openModal={attendanceModal} closeModal={() => setAttendanceModal(false)} />
      <Voting openModal={votingModal} closeModal={() => setVotingModal(false)} />
      <Feedback openModal={feedbackModal} closeModal={() => setFeedbackModal(false)} />
      <MintNFT openModal={certificateModal} closeModal={() => setCertificateModal(false)} />
      <ReputationDashboard openModal={reputationModal} closeModal={() => setReputationModal(false)} />
      <Bank openModal={stakingModal} closeModal={() => setStakingModal(false)} />
      <AssetOptIn openModal={assetOptInModal} closeModal={() => setAssetOptInModal(false)} />
      <SendAlgo openModal={sendAlgoModal} closeModal={() => setSendAlgoModal(false)} />

    </div>
  )
}

export default Home
