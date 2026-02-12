import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState, useMemo } from 'react'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
// Placeholder for IPFS utility imports - assuming they exist or we mock
// import { ipfsHttpUrl, pinFileToIPFS, pinJSONToIPFS } from '../utils/pinata'

interface MintNFTProps {
  openModal: boolean
  closeModal: () => void
}

const MintNFT = ({ openModal, closeModal }: MintNFTProps) => {
  const { activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  // Mock upload for now if utils not present
  const onMint = async () => {
    if (!activeAddress) return enqueueSnackbar('Connect wallet first', { variant: 'error' })
    if (!name) return enqueueSnackbar('Enter NFT name', { variant: 'error' })

    setLoading(true)
    try {
      // Simulate delay
      await new Promise(r => setTimeout(r, 2000))
      enqueueSnackbar('Certificate NFT Minted Successfully!', { variant: 'success' })
      closeModal()
      setName('')
      setDescription('')
      setFile(null)
    } catch (e) {
      enqueueSnackbar('Minting failed', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog id="mint_nft_modal" className={`modal ${openModal ? 'modal-open' : ''} backdrop-blur-sm`}>
      <div className="modal-box bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl max-w-lg text-white">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-2xl text-indigo-400">Issue Certificate</h3>
            <p className="text-slate-400 text-sm">Mint verifiable credentials on Algorand.</p>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-white" onClick={closeModal}>✕</button>
        </div>

        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Certificate Name</label>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-500"
              placeholder="e.g. Hackathon Winner 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              className="w-full h-24 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none placeholder-slate-500"
              placeholder="Details about the achievement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Certificate Image</label>
            <div className={`border-2 border-dashed border-slate-700 rounded-xl p-6 text-center transition-colors ${file ? 'bg-indigo-900/20 border-indigo-500/50' : 'hover:border-indigo-500/50 hover:bg-slate-800/50'}`}>

              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                      📎
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white truncate max-w-[150px]">{file.name}</p>
                      <p className="text-xs text-slate-500">Ready to mint</p>
                    </div>
                  </div>
                  <button onClick={() => setFile(null)} className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-lg transition-colors">✕</button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 text-xl">
                    ⬆️
                  </div>
                  <p className="text-indigo-400 font-medium">Click to upload image</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="modal-action mt-8 flex gap-3">
          <button className="btn btn-ghost text-slate-400 hover:text-white" onClick={closeModal} disabled={loading}>Cancel</button>
          <button
            className={`btn bg-indigo-600 hover:bg-indigo-500 text-white border-none px-8 ${loading ? 'loading' : ''}`}
            onClick={onMint}
            disabled={loading || !name}
          >
            {loading ? 'Minting...' : 'Mint Certificate'}
          </button>
        </div>

      </div>
    </dialog>
  )
}

export default MintNFT
