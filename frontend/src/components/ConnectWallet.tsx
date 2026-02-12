import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  return (
    <dialog id="connect_wallet_modal" className={`modal ${openModal ? 'modal-open' : ''} backdrop-blur-sm`}>
      <form method="dialog" className="modal-box bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl max-w-md text-white">

        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-2xl text-white">
            {activeAddress ? 'Wallet Details' : 'Connect Wallet'}
          </h3>
          <button className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-white" onClick={closeModal}>✕</button>
        </div>

        {activeAddress ? (
          <div className="space-y-6">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <Account />
            </div>

            <div className="alert bg-yellow-900/20 border-yellow-500/20 text-yellow-200 text-sm">
              <span>Disconnecting will clear your session.</span>
            </div>

            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost text-slate-400" onClick={closeModal}>Close</button>
              <button
                className="btn bg-rose-600 hover:bg-rose-700 text-white border-none"
                data-test-id="logout"
                onClick={async () => {
                  if (wallets) {
                    const activeWallet = wallets.find((w) => w.isActive)
                    if (activeWallet) {
                      await activeWallet.disconnect()
                    } else {
                      localStorage.removeItem('@txnlab/use-wallet:v3')
                      window.location.reload()
                    }
                  }
                }}
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm mb-4">Select a provider to connect your Algorand wallet.</p>
            <div className="grid grid-cols-1 gap-3">
              {wallets?.map((wallet) => (
                <button
                  key={wallet.id}
                  data-test-id={`${wallet.id}-connect`}
                  className="flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 rounded-xl transition-all group w-full text-left"
                  onClick={() => wallet.connect()}
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
                    <img
                      src={wallet.metadata.icon}
                      alt={wallet.metadata.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isKmd(wallet) ? 'For testing' : 'Production ready'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </dialog>
  )
}
export default ConnectWallet
