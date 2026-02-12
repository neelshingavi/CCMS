import { useEffect, useMemo, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import algosdk, { getApplicationAddress, makePaymentTxnWithSuggestedParamsFromObject } from 'algosdk'
import { AlgorandClient, microAlgos } from '@algorandfoundation/algokit-utils'
import { BankClient, BankFactory } from '../contracts/Bank'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface BankProps {
  openModal: boolean
  closeModal: () => void
}

type Statement = {
  id: string
  round: number
  amount: number
  type: 'deposit' | 'withdrawal'
  sender: string
  receiver: string
  timestamp?: number
}

const Bank = ({ openModal, closeModal }: BankProps) => {
  const { enqueueSnackbar } = useSnackbar()
  const { activeAddress, transactionSigner } = useWallet()
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = useMemo(() => AlgorandClient.fromConfig({ algodConfig, indexerConfig }), [algodConfig, indexerConfig])
  const [appId, setAppId] = useState<number | ''>(0)
  const [deploying, setDeploying] = useState<boolean>(false)
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [memo, setMemo] = useState<string>('')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [statements, setStatements] = useState<Statement[]>([])
  const [depositors, setDepositors] = useState<Array<{ address: string; amount: string }>>([])

  useEffect(() => {
    algorand.setDefaultSigner(transactionSigner)
  }, [algorand, transactionSigner])

  const appAddress = useMemo(() => (appId && appId > 0 ? String(getApplicationAddress(appId)) : ''), [appId])

  const refreshStatements = async () => {
    try {
      if (!appId || !activeAddress) return
      const idx = algorand.client.indexer
      const appAddr = String(getApplicationAddress(appId))
      const allTransactions: Statement[] = []

      console.log('Searching for app transactions with app ID:', appId)

      // Search for application call transactions from user
      const appTxRes = await idx
        .searchForTransactions()
        .address(activeAddress)
        .txType('appl')
        .do()

      console.log('App call transactions found:', appTxRes.transactions?.length || 0)

      // Process application call transactions (deposits/withdrawals)
      const appTransactions = (appTxRes.transactions || [])
        .filter((t: any) => {
          // Filter for transactions calling our specific app
          const isOurApp = t.applicationTransaction &&
            Number(t.applicationTransaction.applicationId) === Number(appId)
          console.log('Checking transaction:', t.id, {
            hasAppTxn: !!t.applicationTransaction,
            appId: t.applicationTransaction?.applicationId,
            targetAppId: Number(appId),
            isOurApp,
            sender: t.sender,
            activeAddress
          })
          return isOurApp
        })
        .map((t: any) => {
          // Determine transaction type from logs or method name
          let amount = 1 // Default amount
          let type: 'deposit' | 'withdrawal' = 'deposit'

          // Check logs for method name
          if (t.logs && t.logs.length > 0) {
            const logStr = t.logs.join(' ')
            if (logStr.includes('withdraw') || logStr.includes('Withdraw')) {
              type = 'withdrawal'
            }
          }

          // Check inner transactions for actual payment amounts
          if (t.innerTxns && t.innerTxns.length > 0) {
            console.log('Inner transactions for', t.id, ':', t.innerTxns)
            for (const innerTxn of t.innerTxns) {
              if (innerTxn.paymentTransaction) {
                amount = Number(innerTxn.paymentTransaction.amount) / 1000000
                // If there's an inner payment from app to user, it's definitely a withdrawal
                if (innerTxn.sender === appAddr && innerTxn.paymentTransaction.receiver === activeAddress) {
                  type = 'withdrawal'
                }
                console.log('Found payment in inner txn:', { amount, type, sender: innerTxn.sender, receiver: innerTxn.paymentTransaction.receiver })
                break
              }
            }
          }

          // If no inner transactions found but it's a withdraw call, still show it
          console.log('Transaction', t.id, 'type:', type, 'amount:', amount)

          return {
            id: t.id,
            round: Number(t.confirmedRound || t['confirmed-round']),
            amount,
            type,
            sender: t.sender,
            receiver: appAddr,
            timestamp: Number(t.roundTime || t['round-time']),
          }
        })

      allTransactions.push(...appTransactions)

      // Also search for direct payment transactions to/from app address
      const payTxRes = await idx
        .searchForTransactions()
        .address(appAddr)
        .txType('pay')
        .do()

      console.log('Payment transactions found:', payTxRes.transactions?.length || 0)

      const paymentTransactions = (payTxRes.transactions || [])
        .filter((t: any) => {
          // Only include withdrawals (app to user) and exclude deposits (user to app) 
          // since deposits are already captured in app transactions
          return (t.sender === appAddr && t.paymentTransaction?.receiver === activeAddress)
        })
        .map((t: any) => ({
          id: t.id,
          round: Number(t.confirmedRound || t['confirmed-round']),
          amount: Number(t.paymentTransaction.amount) / 1000000,
          type: t.sender === activeAddress ? 'deposit' as const : 'withdrawal' as const,
          sender: t.sender,
          receiver: t.paymentTransaction.receiver,
          timestamp: Number(t.roundTime || t['round-time']),
        }))

      allTransactions.push(...paymentTransactions)

      console.log('Total relevant transactions:', allTransactions.length)
      setStatements(allTransactions.sort((a, b) => b.round - a.round))
    } catch (e) {
      console.error('Error in refreshStatements:', e)
      enqueueSnackbar(`Error loading statements: ${(e as Error).message}`, { variant: 'error' })
    }
  }

  const refreshDepositors = async () => {
    try {
      if (!appId) return
      const algod = algorand.client.algod
      const boxes = await algod.getApplicationBoxes(appId).do()
      const list = [] as Array<{ address: string; amount: string }>
      for (const b of boxes.boxes as Array<{ name: Uint8Array }>) {
        // Skip empty or non-account keys if any
        const nameBytes: Uint8Array = b.name
        if (nameBytes.length !== 32) continue
        const box = await algod.getApplicationBoxByName(appId, nameBytes).do()
        const addr = algosdk.encodeAddress(nameBytes)
        const valueBuf: Uint8Array = box.value
        // UInt64 big-endian
        const amountMicroAlgos = BigInt(new DataView(Buffer.from(valueBuf).buffer).getBigUint64(0, false))
        const amountAlgos = (Number(amountMicroAlgos) / 1000000).toString()
        list.push({ address: addr, amount: amountAlgos })
      }
      setDepositors(list)
    } catch (e) {
      enqueueSnackbar(`Error loading depositors: ${(e as Error).message}`, { variant: 'error' })
    }
  }

  useEffect(() => {
    void refreshStatements()
    void refreshDepositors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, activeAddress])

  const deposit = async () => {
    try {
      if (!activeAddress || activeAddress.trim() === '') throw new Error('Please connect your wallet first')
      if (!transactionSigner) throw new Error('Wallet signer unavailable')
      if (!appId || appId <= 0) throw new Error('Enter valid App ID')
      const amountAlgos = Number(depositAmount)
      if (!amountAlgos || amountAlgos <= 0) throw new Error('Enter amount in Algos')
      const amountMicroAlgos = Math.round(amountAlgos * 1000000) // Convert to microAlgos
      setLoading(true)

      const sp = await algorand.client.algod.getTransactionParams().do()
      const appAddr = getApplicationAddress(appId)

      if (!algosdk.isValidAddress(activeAddress)) throw new Error('Invalid wallet address')
      if (!algosdk.isValidAddress(String(appAddr))) throw new Error('Invalid app address; check App ID')

      const payTxn = makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: appAddr,
        amount: amountMicroAlgos,
        suggestedParams: sp,
      })

      const client = new BankClient({
        appId: BigInt(appId),
        algorand,
        defaultSigner: transactionSigner
      })

      const res = await client.send.deposit({
        args: {
          memo: memo || '',
          payTxn: { txn: payTxn, signer: transactionSigner }
        },
        sender: activeAddress
      })

      const confirmedRound = (res.confirmation as any)?.['confirmed-round']
      enqueueSnackbar(`Deposited successfully in round ${confirmedRound}`, { variant: 'success' })
      setDepositAmount('')
      setMemo('')
      void refreshStatements()
      void refreshDepositors()
    } catch (e) {
      enqueueSnackbar(`Deposit failed: ${(e as Error).message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const withdraw = async () => {
    try {
      if (!activeAddress || activeAddress.trim() === '') throw new Error('Please connect your wallet first')
      if (!transactionSigner) throw new Error('Wallet signer unavailable')
      if (!appId || appId <= 0) throw new Error('Enter valid App ID')
      const amount = Number(withdrawAmount)
      if (!amount || amount <= 0) throw new Error('Enter amount in Algos')
      const amountMicroAlgos = Math.round(amount * 1000000) // Convert to microAlgos
      setLoading(true)

      const client = new BankClient({
        appId: BigInt(appId),
        algorand,
        defaultSigner: transactionSigner
      })

      const res = await client.send.withdraw({
        args: { amount: amountMicroAlgos },
        sender: activeAddress,
        extraFee: microAlgos(2000)
      })

      const confirmedRound = (res.confirmation as any)?.['confirmed-round']
      enqueueSnackbar(`Withdraw executed in round ${confirmedRound}`, { variant: 'success' })
      setWithdrawAmount('')
      void refreshStatements()
      void refreshDepositors()
    } catch (e) {
      enqueueSnackbar(`Withdraw failed: ${(e as Error).message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const deployContract = async () => {
    try {
      if (!activeAddress) throw new Error('Connect wallet')
      setDeploying(true)
      const factory = new BankFactory({ defaultSender: activeAddress, algorand })
      const result = await factory.send.create.bare()
      const newId = Number(result.appClient.appId)
      setAppId(newId)
      enqueueSnackbar(`Bank deployed. App ID: ${newId}`, { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(`Deploy failed: ${(e as Error).message}`, { variant: 'error' })
    } finally {
      setDeploying(false)
    }
  }

  return (
    <dialog id="bank_modal" className={`modal ${openModal ? 'modal-open' : ''} backdrop-blur-sm`}>
      <form method="dialog" className="modal-box w-11/12 max-w-5xl bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl text-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-3xl text-emerald-400">Staking & DeFi Dashboard</h3>
          <button className="btn btn-sm btn-circle btn-ghost text-slate-400" onClick={closeModal}>✕</button>
        </div>

        {/* App Configuration */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="form-control w-full">
              <label className="label"><span className="label-text text-slate-300 font-medium">Bank Application ID</span></label>
              <div className="join w-full">
                <input className="input input-bordered join-item w-full bg-slate-900 border-slate-600 focus:border-emerald-500 text-white"
                  type="number" value={appId} onChange={(e) => setAppId(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Enter App ID" />
                <button className={`btn btn-accent join-item ${deploying ? 'loading' : ''}`}
                  disabled={deploying || !activeAddress}
                  onClick={(e) => { e.preventDefault(); void deployContract() }}>
                  {deploying ? 'Deploying' : 'Deploy New'}
                </button>
              </div>
              {appAddress && (
                <label className="label">
                  <span className="label-text-alt text-slate-500 break-all font-mono">Contract Address: {appAddress}</span>
                </label>
              )}
            </div>
            <div className="flex justify-end pb-2">
              <button className="btn btn-outline text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 gap-2"
                onClick={(e) => { e.preventDefault(); void refreshStatements(); void refreshDepositors() }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Deposit Card */}
          <div className="card bg-slate-800 border border-slate-700 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-emerald-400 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18" /></svg>
                Deposit Funds
              </h2>
              <input className="input input-bordered bg-slate-900 border-slate-600 text-white mb-3"
                placeholder="Memo (Optional)" value={memo} onChange={(e) => setMemo(e.target.value)} />
              <div className="join w-full">
                <input className="input input-bordered join-item w-full bg-slate-900 border-slate-600 text-white"
                  placeholder="Amount" type="number" step="0.000001" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                <span className="btn btn-static join-item bg-slate-700 border-slate-600 text-slate-300">ALGO</span>
              </div>
              <div className="card-actions justify-end mt-4">
                <button className={`btn bg-emerald-600 hover:bg-emerald-500 text-white border-none w-full ${loading ? 'loading' : ''}`}
                  disabled={loading || !activeAddress || !appId}
                  onClick={(e) => { e.preventDefault(); void deposit() }}>
                  Confirm Deposit
                </button>
              </div>
            </div>
          </div>

          {/* Withdraw Card */}
          <div className="card bg-slate-800 border border-slate-700 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-amber-400 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17l-4 4m0 0l-4-4m4 4V3" /></svg>
                Withdraw Funds
              </h2>
              <div className="join w-full mt-[3.25rem]"> {/* Spacer align with deposit */}
                <input className="input input-bordered join-item w-full bg-slate-900 border-slate-600 text-white"
                  placeholder="Amount" type="number" step="0.000001" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                <span className="btn btn-static join-item bg-slate-700 border-slate-600 text-slate-300">ALGO</span>
              </div>
              <div className="card-actions justify-end mt-4">
                <button className={`btn bg-amber-600 hover:bg-amber-500 text-white border-none w-full ${loading ? 'loading' : ''}`}
                  disabled={loading || !activeAddress || !appId}
                  onClick={(e) => { e.preventDefault(); void withdraw() }}>
                  Confirm Withdrawal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Statements */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-96">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 font-bold text-slate-300 flex justify-between items-center">
              <span>Recent Activity</span>
              <span className="text-xs font-normal text-slate-500">{statements.length} Transactions</span>
            </div>
            <div className="overflow-auto flex-1 p-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              <table className="table w-full text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 sticky top-0 z-10">
                  <tr>
                    <th>Type</th>
                    <th>Round</th>
                    {/* <th>Amount</th> */}
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {statements.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-slate-500">No transactions found</td></tr>
                  ) : (
                    statements.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-700/30 transition-colors border-slate-700">
                        <td>
                          <span className={`badge ${s.type === 'deposit' ? 'badge-success bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'badge-warning bg-amber-500/10 text-amber-400 border-amber-500/20'} gap-2`}>
                            {s.type === 'deposit' ? 'IN' : 'OUT'}
                            {s.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="font-mono text-xs">{s.round}</td>
                        {/* <td>{s.amount.toFixed(6)} <span className="text-xs opacity-50">ALGO</span></td> */}
                        <td className="text-right">
                          <a
                            href={`https://lora.algokit.io/testnet/transaction/${s.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-ghost text-blue-400 hover:text-blue-300"
                          >
                            View ↗
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Depositors */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-96">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 font-bold text-slate-300">
              Depositors
            </div>
            <div className="overflow-auto flex-1 p-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              <table className="table w-full text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 sticky top-0 z-10">
                  <tr>
                    <th>Account</th>
                    <th className="text-right">Bal (ALGO)</th>
                  </tr>
                </thead>
                <tbody>
                  {depositors.length === 0 ? (
                    <tr><td colSpan={2} className="text-center py-8 text-slate-500">No depositors yet</td></tr>
                  ) : (
                    depositors.map((d) => (
                      <tr key={d.address} className="hover:bg-slate-700/30 border-slate-700">
                        <td className="max-w-[100px] truncate" title={d.address}>
                          <span className="font-mono text-xs text-slate-400">{d.address.slice(0, 8)}...</span>
                        </td>
                        <td className="text-right font-mono text-emerald-400 font-bold">
                          {Number(d.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </form>
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal}>close</button>
      </form>
    </dialog>
  )
}

export default Bank


