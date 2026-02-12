import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useMemo, useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { ipfsHttpUrl, pinFileToIPFS, pinJSONToIPFS } from '../utils/pinata'

interface MintNFTProps {
  openModal: boolean
  closeModal: () => void
}

const MintNFT = ({ openModal, closeModal }: MintNFTProps) => {
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState('AlgoNFT')
  const [description, setDescription] = useState('My first NFT!')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const algorand = useMemo(() => {
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const client = AlgorandClient.fromConfig({ algodConfig })
    client.setDefaultSigner(transactionSigner)
    return client
  }, [transactionSigner])

  async function sha256Hex(data: Uint8Array): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(digest))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  const onMint = async () => {
    if (!activeAddress) return enqueueSnackbar('Connect a wallet first', { variant: 'error' })
    if (!file) return enqueueSnackbar('Select an image', { variant: 'error' })

    setLoading(true)
    try {
      // 1) Upload image
      const filePin = await pinFileToIPFS(file)
      const imageUrl = ipfsHttpUrl(filePin.IpfsHash)

      // 2) Create metadata
      const metadata = {
        name,
        description,
        image: imageUrl,
        image_mimetype: file.type || 'image/png',
        external_url: imageUrl,
        properties: {
          simple_property: 'Dashing Item',
        },
      }

      // 3) Upload metadata
      const jsonPin = await pinJSONToIPFS(metadata)
      const metadataUrl = `${ipfsHttpUrl(jsonPin.IpfsHash)}#arc3`

      // 4) ARC-3 metadata hash (sha256 of metadata JSON bytes)
      const metaBytes = new TextEncoder().encode(JSON.stringify(metadata))
      const metaHex = await sha256Hex(metaBytes)
      const metadataHash = new Uint8Array(metaHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)))

      // 5) Create ASA (NFT)
      const result = await algorand.send.assetCreate({
        sender: activeAddress,
        total: 1n,
        decimals: 0,
        unitName: name.slice(0, 8).replace(/\s+/g, ''),
        assetName: name,
        manager: activeAddress,
        reserve: activeAddress,
        freeze: activeAddress,
        clawback: activeAddress,
        url: metadataUrl,
        metadataHash,
        defaultFrozen: false,
      })

      enqueueSnackbar(`NFT minted. ASA ID: ${result.assetId}`, { variant: 'success' })
      closeModal()
    } catch (e) {
      enqueueSnackbar((e as Error).message, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog id="mint_nft_modal" className={`modal ${openModal ? 'modal-open' : ''} backdrop-blur-sm`}>
      <form method="dialog" className="modal-box bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl max-w-lg text-white">
        <h3 className="font-bold text-2xl mb-2 text-purple-400">Mint NFT</h3>
        <p className="text-slate-400 text-sm mb-6">Upload to IPFS and mint ARC-3 NFT.</p>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text text-slate-300">Name</span></label>
            <input className="input input-bordered bg-slate-800 border-slate-600 focus:border-purple-500 w-full text-white"
              placeholder="NFT Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-slate-300">Description</span></label>
            <textarea className="textarea textarea-bordered bg-slate-800 border-slate-600 focus:border-purple-500 w-full text-white h-24"
              placeholder="Description of your NFT..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-slate-300">Media File</span></label>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-purple-500/50 transition-colors bg-slate-800/50">
              {file ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 truncate">{file.name}</span>
                  <button className="btn btn-xs btn-ghost text-red-400" onClick={() => setFile(null)}>Remove</button>
                </div>
              ) : (
                <>
                  <input type="file" id="nft-file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <label htmlFor="nft-file" className="cursor-pointer">
                    <div className="text-purple-400 font-medium mb-1">Click to Upload</div>
                    <div className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</div>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="modal-action mt-8">
          <button className="btn btn-ghost text-slate-400 hover:text-white" onClick={closeModal} disabled={loading}>Cancel</button>
          <button className={`btn bg-purple-600 hover:bg-purple-500 text-white border-none px-8 ${loading ? 'loading' : ''}`} onClick={onMint} disabled={loading}>
            {loading ? 'Minting...' : 'Mint NFT'}
          </button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal}>close</button>
      </form>
    </dialog>
  )
}

export default MintNFT

