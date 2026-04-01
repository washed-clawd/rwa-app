'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, Search, ArrowRight, CreditCard, Building2, Wallet2, Info } from 'lucide-react'
import { XSTOCKS, MOCK_MARKET_DATA, formatUSD } from '@/lib/tokens'
import { cn } from '@/lib/utils'

type Step = 'select' | 'amount' | 'onramp' | 'confirm'
type PaymentMethod = 'card' | 'bank' | 'crypto'

function BuyPageInner() {
  const searchParams = useSearchParams()
  const defaultAsset = searchParams.get('asset') || 'xNVDA'

  const [step, setStep] = useState<Step>('select')
  const [selectedSymbol, setSelectedSymbol] = useState(defaultAsset)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [assetSearch, setAssetSearch] = useState('')
  const [showAssetPicker, setShowAssetPicker] = useState(false)

  const selectedToken = XSTOCKS.find((t) => t.symbol === selectedSymbol)
  const marketData = selectedToken ? MOCK_MARKET_DATA[selectedToken.symbol] : null
  const usdAmount = parseFloat(amount) || 0
  const sharesReceived = marketData ? usdAmount / marketData.price : 0

  const filteredAssets = XSTOCKS.filter(
    (t) =>
      t.symbol.toLowerCase().includes(assetSearch.toLowerCase()) ||
      t.name.toLowerCase().includes(assetSearch.toLowerCase())
  )

  function handleNext() {
    const steps: Step[] = ['select', 'amount', 'onramp', 'confirm']
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1])
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Buy xStocks</h1>
        <p className="text-gray-400">Purchase tokenized stocks with your card, bank, or crypto</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(['select', 'amount', 'onramp', 'confirm'] as Step[]).map((s, i) => {
          const steps: Step[] = ['select', 'amount', 'onramp', 'confirm']
          const labels = ['Select', 'Amount', 'Pay', 'Confirm']
          const isActive = s === step
          const isPast = steps.indexOf(s) < steps.indexOf(step)
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold transition-colors',
                isActive ? 'bg-teal-500 text-white' : isPast ? 'bg-teal-500/30 text-teal-400' : 'bg-white/[0.06] text-gray-500'
              )}>
                {isPast ? '✓' : i + 1}
              </div>
              <span className={cn('text-sm hidden sm:block', isActive ? 'text-white font-medium' : 'text-gray-500')}>{labels[i]}</span>
              {i < 3 && <div className="h-px w-6 bg-white/[0.08]" />}
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">

        {/* Step 1: Select asset */}
        {step === 'select' && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Choose a stock</h2>

            {/* Selected asset preview */}
            {selectedToken && marketData && (
              <div className="mb-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: selectedToken.logoColor + '22', color: selectedToken.logoColor }}
                    >
                      {selectedToken.symbol.slice(1, 3)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{selectedToken.symbol}</div>
                      <div className="text-sm text-gray-400">{selectedToken.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">{formatUSD(marketData.price)}</div>
                    <div className={cn('text-sm', marketData.change24h >= 0 ? 'text-teal-400' : 'text-red-400')}>
                      {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Asset search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                onClick={() => setShowAssetPicker(true)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-teal-500/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
              {filteredAssets.map((token) => {
                const data = MOCK_MARKET_DATA[token.symbol]
                return (
                  <button
                    key={token.symbol}
                    onClick={() => { setSelectedSymbol(token.symbol); setAssetSearch('') }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      selectedSymbol === token.symbol
                        ? 'bg-teal-500/10 border-teal-500/30 text-white'
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] text-gray-300'
                    )}
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: token.logoColor + '22', color: token.logoColor }}
                    >
                      {token.symbol.slice(1, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{token.symbol}</div>
                      {data && (
                        <div className="text-xs text-gray-500">{formatUSD(data.price)}</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedToken}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Amount */}
        {step === 'amount' && selectedToken && marketData && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Enter amount</h2>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-6">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: selectedToken.logoColor + '22', color: selectedToken.logoColor }}
              >
                {selectedToken.symbol.slice(1, 3)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{selectedToken.symbol}</div>
                <div className="text-xs text-gray-500">{selectedToken.name}</div>
              </div>
              <button
                onClick={() => setStep('select')}
                className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
              >
                Change
              </button>
            </div>

            {/* Amount input */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-2xl font-bold placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-all"
                />
              </div>
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 mb-6">
              {[100, 500, 1000, 5000].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v.toString())}
                  className="flex-1 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-gray-300 text-sm font-medium transition-colors"
                >
                  ${v >= 1000 ? `${v / 1000}k` : v}
                </button>
              ))}
            </div>

            {/* Estimate */}
            {usdAmount > 0 && (
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">You pay</span>
                  <span className="text-white font-medium">{formatUSD(usdAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">You receive</span>
                  <span className="text-white font-medium">
                    {sharesReceived.toFixed(4)} {selectedToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price per share</span>
                  <span className="text-white font-medium">{formatUSD(marketData.price)}</span>
                </div>
                <div className="border-t border-white/[0.08] pt-3 flex justify-between text-sm">
                  <span className="text-gray-400">Network</span>
                  <span className="text-teal-400 font-medium">Base (Mainnet)</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-gray-300 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!usdAmount || usdAmount < 10}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-600 text-center">Minimum $10 purchase</p>
          </div>
        )}

        {/* Step 3: Onramp */}
        {step === 'onramp' && selectedToken && marketData && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Choose payment method</h2>
            <p className="text-sm text-gray-400 mb-6">
              Paying {formatUSD(usdAmount)} for {sharesReceived.toFixed(4)} {selectedToken.symbol}
            </p>

            {/* Payment method selector */}
            <div className="space-y-3 mb-6">
              {[
                { id: 'card' as PaymentMethod, icon: CreditCard, label: 'Card (Visa/Mastercard)', desc: 'Via Transak · Instant · 1.99% fee', available: true },
                { id: 'bank' as PaymentMethod, icon: Building2, label: 'Bank Transfer', desc: 'Via Transak · 1-3 days · 0.5% fee', available: true },
                { id: 'crypto' as PaymentMethod, icon: Wallet2, label: 'Crypto (USDC)', desc: 'From your wallet · Instant · No fee', available: true },
              ].map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
                    paymentMethod === pm.id
                      ? 'bg-teal-500/10 border-teal-500/30'
                      : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]'
                  )}
                >
                  <div className={cn(
                    'p-2.5 rounded-lg',
                    paymentMethod === pm.id ? 'bg-teal-500/20' : 'bg-white/[0.06]'
                  )}>
                    <pm.icon className={cn('h-5 w-5', paymentMethod === pm.id ? 'text-teal-400' : 'text-gray-400')} />
                  </div>
                  <div className="flex-1">
                    <div className={cn('font-medium text-sm', paymentMethod === pm.id ? 'text-white' : 'text-gray-300')}>{pm.label}</div>
                    <div className="text-xs text-gray-500">{pm.desc}</div>
                  </div>
                  <div className={cn(
                    'h-4 w-4 rounded-full border-2 flex items-center justify-center',
                    paymentMethod === pm.id ? 'border-teal-500' : 'border-gray-600'
                  )}>
                    {paymentMethod === pm.id && <div className="h-2 w-2 rounded-full bg-teal-500" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Transak embed placeholder */}
            {(paymentMethod === 'card' || paymentMethod === 'bank') && (
              <div className="p-6 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.12] text-center mb-6">
                <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="h-6 w-6 text-teal-400" />
                </div>
                <div className="text-white font-medium mb-1">Transak Payment Widget</div>
                <div className="text-sm text-gray-500 mb-3">
                  Powered by Transak · 150+ countries supported
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs text-yellow-500/80 bg-yellow-500/10 px-3 py-1.5 rounded-full">
                  <Info className="h-3.5 w-3.5" />
                  Widget integration pending Transak API key
                </div>
              </div>
            )}

            {paymentMethod === 'crypto' && (
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-6">
                <div className="text-sm text-gray-400 mb-3">Send USDC on Base to receive {selectedToken.symbol}</div>
                <div className="text-xs text-gray-500 font-mono p-3 bg-black/20 rounded-lg break-all">
                  0x... (smart contract address — pending deployment)
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-yellow-500/80">
                  <Info className="h-3.5 w-3.5 flex-shrink-0" />
                  Contract deployment pending testnet validation
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('amount')}
                className="px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-gray-300 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold transition-colors"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && selectedToken && marketData && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-6">Confirm purchase</h2>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Asset', value: `${selectedToken.symbol} (${selectedToken.name})` },
                { label: 'Amount', value: formatUSD(usdAmount) },
                { label: 'Shares received', value: `${sharesReceived.toFixed(6)} ${selectedToken.symbol}` },
                { label: 'Price per share', value: formatUSD(marketData.price) },
                { label: 'Payment method', value: paymentMethod === 'card' ? 'Card (Transak)' : paymentMethod === 'bank' ? 'Bank (Transak)' : 'USDC Wallet' },
                { label: 'Network', value: 'Base (Mainnet)' },
                { label: 'Settlement', value: 'T+0 (instant)' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{row.label}</span>
                  <span className="text-white font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-400/80 mb-6">
              ⚠️ xStocks are tokenized securities. Not available to US persons. By proceeding you confirm you are not a US person.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('onramp')}
                className="px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-gray-300 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => alert('Connect wallet to complete purchase')}
                className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold transition-colors"
              >
                Connect Wallet & Buy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BuyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>}>
      <BuyPageInner />
    </Suspense>
  )
}
