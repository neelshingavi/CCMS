import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface TransactInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const Transact = ({ openModal, setModalState }: TransactInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [receiverAddress, setReceiverAddress] = useState<string>('')

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const { enqueueSnackbar } = useSnackbar()

  const { transactionSigner, activeAddress } = useWallet()

  const handleSubmitAlgo = async () => {
    setLoading(true)

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      return
    }

    try {
      enqueueSnackbar('Sending transaction...', { variant: 'info' })
      const result = await algorand.send.payment({
        signer: transactionSigner,
        sender: activeAddress,
        receiver: receiverAddress,
        amount: algo(1),
      })
      enqueueSnackbar(`Transaction sent: ${result.txIds[0]}`, { variant: 'success' })
      setReceiverAddress('')
    } catch (e) {
      enqueueSnackbar('Failed to send transaction', { variant: 'error' })
    }

    setLoading(false)
  }

  return (
    <dialog id="transact_modal" className={`modal ${openModal ? 'modal-open' : ''} backdrop-blur-sm`}>
      <form method="dialog" className="modal-box bg-slate-800 text-white border border-slate-700 shadow-xl rounded-2xl">
        <h3 className="font-bold text-2xl mb-6 text-teal-400">Send Payment</h3>

        <div className="flex flex-col gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-300 font-medium">To Address</span>
            </label>
            <input
              type="text"
              data-test-id="receiver-address"
              placeholder="Enter Algo wallet address"
              className="input input-bordered bg-slate-900 border-slate-600 focus:border-teal-500 text-white w-full transition-all"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
            />
            {receiverAddress && receiverAddress.length !== 58 && (
              <label className="label">
                <span className="label-text-alt text-amber-500">Invalid address length</span>
              </label>
            )}
          </div>

          <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-400">Amount</span>
              <span className="text-sm text-slate-400">Balance: --</span>
            </div>
            <div className="text-3xl font-bold text-teal-400">1.00 <span className="text-lg text-slate-500">ALGO</span></div>
          </div>
        </div>

        <div className="modal-action mt-8 flex gap-3">
          <button className="btn btn-ghost hover:bg-slate-700 text-slate-300" onClick={() => setModalState(!openModal)}>
            Cancel
          </button>
          <button
            data-test-id="send-algo"
            className={`btn btn-primary bg-teal-500 hover:bg-teal-600 border-none text-slate-900 font-bold px-8 ${receiverAddress.length === 58 ? '' : 'btn-disabled opacity-50'}`}
            onClick={handleSubmitAlgo}
          >
            {loading ? <span className="loading loading-spinner text-slate-900" /> : 'Send Transaction'}
          </button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setModalState(!openModal)}>close</button>
      </form>
    </dialog>
  )
}

export default Transact
