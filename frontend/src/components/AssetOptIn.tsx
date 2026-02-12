import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useMemo, useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface AssetOptInProps {
  openModal: boolean
  closeModal: () => void
}

const AssetOptIn = ({ openModal, closeModal }: AssetOptInProps) => {
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [asaId, setAsaId] = useState('')
  const [loading, setLoading] = useState(false)

  const algorand = useMemo(() => {
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const client = AlgorandClient.fromConfig({ algodConfig })
    client.setDefaultSigner(transactionSigner)
    return client
  }, [transactionSigner])

  const onOptIn = async () => {
    if (!activeAddress) return enqueueSnackbar('Connect a wallet first', { variant: 'error' })
    if (!asaId) return enqueueSnackbar('Enter a valid ASA ID', { variant: 'error' })

    setLoading(true)
    try {
      const id = BigInt(asaId)
      await algorand.send.assetOptIn({
        sender: activeAddress,
        assetId: id
      })
      enqueueSnackbar(`Successfully opted-in to Asset ID: ${id}`, { variant: 'success' })
      closeModal()
      setAsaId('')
    } catch (e: any) {
      enqueueSnackbar(e.message || 'Opt-in failed', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog id="asset_optin_modal" className={`modal ${openModal ? 'modal-open' : ''} backdrop-blur-sm`}>
      <div className="modal-box bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl max-w-md text-white">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-2xl text-emerald-400">Asset Opt-In</h3>
            <p className="text-slate-400 text-sm">Enable your wallet to receive ASAs.</p>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-white" onClick={closeModal}>✕</button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Asset ID</label>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-500 font-mono text-lg"
              placeholder="e.g. 12345678"
              value={asaId}
              onChange={(e) => setAsaId(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="alert bg-emerald-900/20 border-emerald-500/20 text-emerald-200 text-sm flex gap-3 p-4 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <span className="font-bold block mb-1">Why do this?</span>
              Algorand requires you to opt-in to an asset before anyone can send it to you. This prevents spam.
            </div>
          </div>
        </div>

        <div className="modal-action mt-8 flex gap-3">
          <button className="btn btn-ghost text-slate-400 hover:text-white" onClick={closeModal} disabled={loading}>Close</button>
          <button
            className={`btn bg-emerald-600 hover:bg-emerald-500 text-white border-none px-8 ${loading ? 'loading' : ''}`}
            onClick={onOptIn}
            disabled={loading || !asaId}
          >
            {loading ? 'Confirming...' : 'Opt-In to Asset'}
          </button>
        </div>

      </div>
    </dialog>
  )
}

export default AssetOptIn
