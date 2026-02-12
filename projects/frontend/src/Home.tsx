// src/components/Home.tsx
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

interface HomeProps { }

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)

  // Feature Modals
  const [attendanceModal, setAttendanceModal] = useState<boolean>(false)
  const [votingModal, setVotingModal] = useState<boolean>(false)
  const [feedbackModal, setFeedbackModal] = useState<boolean>(false)
  const [certificateModal, setCertificateModal] = useState<boolean>(false)
  const [reputationModal, setReputationModal] = useState<boolean>(false)
  const [stakingModal, setStakingModal] = useState<boolean>(false)

  // Utils Modals
  const [assetOptInModal, setAssetOptInModal] = useState<boolean>(false)
  const [sendAlgoModal, setSendAlgoModal] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative font-sans">
      {/* Navbar / Connect Wallet */}
      <div className="absolute top-6 right-8 z-50">
        <button
          data-test-id="connect-wallet"
          className={`px-6 py-2.5 rounded-full font-bold transition-all duration-300 shadow-lg border 
            ${activeAddress
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20'
              : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500'
            }`}
          onClick={toggleWalletModal}
        >
          {activeAddress ? 'Wallet Connected' : 'Connect Wallet'}
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 px-6 sm:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-sm font-mono mb-6">
            Hackspiration'26 · Track 2: AI & Automation
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 mb-6 tracking-tight drop-shadow-lg">
            CCMS Governance Protocol
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience the future of campus coordination.
            Automated attendance, verifiable voting, and AI-powered feedback—all anchored on Algorand.
          </p>

          {!activeAddress && (
            <button
              onClick={toggleWalletModal}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all"
            >
              Get Started
            </button>
          )}
        </div>
      </div>

      {/* Primary Features Grid */}
      <div id="features" className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-200 mb-8 border-l-4 border-emerald-500 pl-4">Campus Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Attendance Card */}
          <div className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 hover:border-teal-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="h-12 w-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4 text-teal-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Mark Attendance</h3>
            <p className="text-slate-400 mb-6 text-sm h-10">Verify presence at events via geo-fence or time-window.</p>
            <button
              className="w-full py-2.5 bg-slate-700 hover:bg-teal-600 hover:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={!activeAddress}
              onClick={() => setAttendanceModal(true)}
            >
              {activeAddress ? 'Check In Now' : 'Connect Wallet'}
            </button>
          </div>

          {/* Voting Card */}
          <div className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Cast Vote</h3>
            <p className="text-slate-400 mb-6 text-sm h-10">Use your wallet ID to vote securely in campus elections.</p>
            <button
              className="w-full py-2.5 bg-slate-700 hover:bg-blue-600 hover:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={!activeAddress}
              onClick={() => setVotingModal(true)}
            >
              {activeAddress ? 'View Elections' : 'Connect Wallet'}
            </button>
          </div>

          {/* Feedback Card */}
          <div className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Submit Feedback</h3>
            <p className="text-slate-400 mb-6 text-sm h-10">AI analyzes sentiment anonymously and anchors it on-chain.</p>
            <button
              className="w-full py-2.5 bg-slate-700 hover:bg-purple-600 hover:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={!activeAddress}
              onClick={() => setFeedbackModal(true)}
            >
              {activeAddress ? 'Start Feedback' : 'Connect Wallet'}
            </button>
          </div>

          {/* Certification Card */}
          <div className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="h-12 w-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Issue Certificate</h3>
            <p className="text-slate-400 mb-6 text-sm h-10">Mint verifiable NFT certificates for your achievements.</p>
            <button
              className="w-full py-2.5 bg-slate-700 hover:bg-indigo-600 hover:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={!activeAddress}
              onClick={() => setCertificateModal(true)}
            >
              {activeAddress ? 'Mint NFT' : 'Connect Wallet'}
            </button>
          </div>

          {/* Reputation Card */}
          <div className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="h-12 w-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 text-cyan-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Reputation & Rewards</h3>
            <p className="text-slate-400 mb-6 text-sm h-10">Check your on-chain score and accumulated CCT tokens.</p>
            <button
              className="w-full py-2.5 bg-slate-700 hover:bg-cyan-600 hover:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={!activeAddress}
              onClick={() => setReputationModal(true)}
            >
              {activeAddress ? 'View Dashboard' : 'Connect Wallet'}
            </button>
          </div>

          {/* Staking Card */}
          <div className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 hover:border-amber-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="h-12 w-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 text-amber-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Staking & DeFi</h3>
            <p className="text-slate-400 mb-6 text-sm h-10">Stake tokens to increase your governance voting weight.</p>
            <button
              className="w-full py-2.5 bg-slate-700 hover:bg-amber-600 hover:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={!activeAddress}
              onClick={() => setStakingModal(true)}
            >
              {activeAddress ? 'Manage Stake' : 'Connect Wallet'}
            </button>
          </div>

        </div>

        {/* Utilities Section */}
        <h2 className="text-lg font-bold text-slate-400 mt-16 mb-6 pl-4 border-l-2 border-slate-600">Wallet Utilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800 transition-colors">
            <div>
              <h4 className="font-bold text-slate-300">Asset Opt-In</h4>
              <p className="text-xs text-slate-500">Enable ASAs</p>
            </div>
            <button onClick={() => setAssetOptInModal(true)} className="btn btn-sm btn-ghost text-slate-400">Open</button>
          </div>

          <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800 transition-colors">
            <div>
              <h4 className="font-bold text-slate-300">Send Payments</h4>
              <p className="text-xs text-slate-500">Transfer Funds</p>
            </div>
            <button onClick={() => setSendAlgoModal(true)} className="btn btn-sm btn-ghost text-slate-400">Open</button>
          </div>

        </div>
      </div>

      {/* Modals */}
      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <Attendance openModal={attendanceModal} closeModal={() => setAttendanceModal(false)} />
      <Voting openModal={votingModal} closeModal={() => setVotingModal(false)} />
      <Feedback openModal={feedbackModal} closeModal={() => setFeedbackModal(false)} />
      <MintNFT openModal={certificateModal} closeModal={() => setCertificateModal(false)} />
      <ReputationDashboard openModal={reputationModal} closeModal={() => setReputationModal(false)} />
      <Bank openModal={stakingModal} closeModal={() => setStakingModal(false)} />

      {/* Utility Modals */}
      <AssetOptIn openModal={assetOptInModal} closeModal={() => setAssetOptInModal(false)} />
      <SendAlgo openModal={sendAlgoModal} closeModal={() => setSendAlgoModal(false)} />

    </div>
  )
}

export default Home
