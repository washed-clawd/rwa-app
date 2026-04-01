'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Info, AlertTriangle, TrendingUp, Minus, Plus } from 'lucide-react'
import { XSTOCKS, MOCK_MARKET_DATA, formatUSD, formatPercent } from '@/lib/tokens'
import { cn } from '@/lib/utils'

function getHealthColor(hf: number): string {
  if (hf >= 1.5) return 'text-teal-400'
  if (hf >= 1.2) return 'text-yellow-400'
  return 'text-red-400'
}

function getHealthBg(hf: number): string {
  if (hf >= 1.5) return 'bg-teal-500'
  if (hf >= 1.2) return 'bg-yellow-500'
  return 'bg-red-500'
}

function BorrowPageInner() {
  const searchParams = useSearchParams()
  const defaultCollateral = searchParams.get('collateral') || 'xNVDA'

  const [collateralSymbol, setCollateralSymbol] = useState(defaultCollateral)
  const [collateralAmount, setCollateralAmount] = useState('1')
  const [ltv, setLtv] = useState(50) // percentage
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'borrow' | 'repay'>('deposit')

  const token = XSTOCKS.find((t) => t.symbol === collateralSymbol)
  const market = token ? MOCK_MARKET_DATA[token.symbol] : null

  const collateralValue = market ? parseFloat(collateralAmount || '0') * market.price : 0
  const maxBorrow = collateralValue * 0.65
  const borrowAmount = collateralValue * (ltv / 100)
  const healthFactor = ltv > 0 ? (collateralValue * 0.65) / borrowAmount : 999
  const liquidationPrice = token && market && ltv > 0 ? market.price * (ltv / 100) / 0.65 : 0

  // Simulated existing positions
  const positions = [
    { symbol: 'xNVDA', deposited: 2, borrowed: 1140, borrowRate: 6.2, supplyRate: 4.5 },
    { symbol: 'xSPY', deposited: 5, borrowed: 1856, borrowRate: 4.8, supplyRate: 3.4 },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Borrow</h1>
        <p className="text-gray-400">Deposit xStocks as collateral and borrow USDC at up to 65% LTV</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left: Positions overview */}
        <div className="space-y-6">
          {/* Protocol stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Protocol TVL', value: '$12.4M' },
              { label: 'Total borrowed', value: '$7.8M' },
              { label: 'Avg borrow rate', value: '6.1%' },
              { label: 'Max LTV', value: '65%' },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                <div className="text-xl font-bold text-white">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Open positions */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Your positions</h2>

            {positions.length > 0 ? (
              <div className="space-y-4">
                {positions.map((pos) => {
                  const tok = XSTOCKS.find((t) => t.symbol === pos.symbol)
                  const mkt = tok ? MOCK_MARKET_DATA[tok.symbol] : null
                  if (!tok || !mkt) return null
                  const posCollValue = pos.deposited * mkt.price
                  const posLtv = (pos.borrowed / posCollValue) * 100
                  const posHf = (posCollValue * 0.65) / pos.borrowed

                  return (
                    <div key={pos.symbol} className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: tok.logoColor + '22', color: tok.logoColor }}
                          >
                            {tok.symbol.slice(1, 3)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{tok.symbol}</div>
                            <div className="text-sm text-gray-500">Morpho Blue · Base</div>
                          </div>
                        </div>
                        <div className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold', getHealthColor(posHf), 'bg-white/[0.05]')}>
                          Health: {posHf.toFixed(2)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Collateral</div>
                          <div className="text-white font-medium">{pos.deposited} {pos.symbol}</div>
                          <div className="text-gray-500 text-xs">{formatUSD(posCollValue)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Borrowed</div>
                          <div className="text-white font-medium">{formatUSD(pos.borrowed)} USDC</div>
                          <div className="text-gray-500 text-xs">LTV: {posLtv.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Borrow rate</div>
                          <div className="text-white font-medium">{pos.borrowRate}% APY</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Accruing</div>
                          <div className="text-teal-400 font-medium">-{formatUSD((pos.borrowed * pos.borrowRate / 100) / 365)}/day</div>
                        </div>
                      </div>

                      {/* Health bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span>LTV: {posLtv.toFixed(1)}% / 65% max</span>
                          <span>Liquidation at 65%</span>
                        </div>
                        <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', getHealthBg(posHf))}
                            style={{ width: `${Math.min(posLtv / 65 * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 py-2 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 text-sm font-medium transition-colors">
                          Add collateral
                        </button>
                        <button className="flex-1 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-gray-300 text-sm font-medium transition-colors">
                          Repay
                        </button>
                        <button className="flex-1 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-gray-300 text-sm font-medium transition-colors">
                          Borrow more
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                No open positions. Create one on the right.
              </div>
            )}
          </div>

          {/* Market info */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Available markets</h2>
            <div className="rounded-xl border border-white/[0.08] overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-3 bg-white/[0.03] text-xs text-gray-500">
                <div>Asset</div>
                <div>Borrow APY</div>
                <div>Supply APY</div>
                <div>Utilization</div>
              </div>
              {XSTOCKS.slice(0, 8).map((tok) => {
                const mkt = MOCK_MARKET_DATA[tok.symbol]
                if (!mkt) return null
                return (
                  <div
                    key={tok.symbol}
                    onClick={() => setCollateralSymbol(tok.symbol)}
                    className={cn(
                      'grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-3 border-t border-white/[0.04] cursor-pointer transition-colors text-sm',
                      collateralSymbol === tok.symbol ? 'bg-teal-500/5' : 'hover:bg-white/[0.02]'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: tok.logoColor + '22', color: tok.logoColor }}
                      >
                        {tok.symbol.slice(1, 3)}
                      </div>
                      <span className="text-white font-medium">{tok.symbol}</span>
                    </div>
                    <div className="text-red-400">{mkt.borrowRate.toFixed(1)}%</div>
                    <div className="text-teal-400">{mkt.supplyRate.toFixed(1)}%</div>
                    <div>
                      <div className="text-gray-300">{mkt.utilization}%</div>
                      <div className="h-1 bg-white/[0.08] rounded-full mt-1 w-16">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${mkt.utilization}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Collateral manager */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5">
            <h3 className="font-semibold text-white mb-4">New position</h3>

            {/* Collateral selector */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">Collateral asset</label>
              <div className="relative">
                <select
                  value={collateralSymbol}
                  onChange={(e) => setCollateralSymbol(e.target.value)}
                  className="w-full appearance-none px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-teal-500/50 transition-all cursor-pointer"
                >
                  {XSTOCKS.map((t) => (
                    <option key={t.symbol} value={t.symbol} className="bg-[#1a1f24]">{t.symbol} — {t.name}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Collateral amount */}
            <div className="mb-5">
              <label className="text-xs text-gray-500 mb-2 block">Deposit amount (shares)</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCollateralAmount(a => Math.max(0, parseFloat(a || '0') - 0.1).toFixed(2))}
                  className="p-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-gray-400 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={collateralAmount}
                  onChange={(e) => setCollateralAmount(e.target.value)}
                  className="flex-1 text-center px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white font-semibold focus:outline-none focus:border-teal-500/50 transition-all"
                />
                <button
                  onClick={() => setCollateralAmount(a => (parseFloat(a || '0') + 0.1).toFixed(2))}
                  className="p-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-gray-400 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {market && (
                <div className="text-center text-xs text-gray-500 mt-1.5">
                  ≈ {formatUSD(collateralValue)}
                </div>
              )}
            </div>

            {/* LTV slider */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-500">Borrow LTV</label>
                <span className={cn('text-sm font-semibold', ltv > 55 ? 'text-yellow-400' : 'text-white')}>{ltv}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="65"
                value={ltv}
                onChange={(e) => setLtv(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-white/[0.08] cursor-pointer"
                style={{
                  backgroundImage: `linear-gradient(to right, ${ltv > 55 ? '#eab308' : '#14b8a6'} ${ltv / 65 * 100}%, rgba(255,255,255,0.08) ${ltv / 65 * 100}%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>0%</span>
                <span className="text-yellow-600">Safe: &lt;55%</span>
                <span className="text-red-600">Max: 65%</span>
              </div>
            </div>

            {/* Summary */}
            {market && collateralValue > 0 && (
              <div className="space-y-2.5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] mb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Collateral value</span>
                  <span className="text-white font-medium">{formatUSD(collateralValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">You borrow</span>
                  <span className="text-white font-medium">{formatUSD(borrowAmount)} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Borrow rate</span>
                  <span className="text-white font-medium">{market.borrowRate.toFixed(1)}% APY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Liq. price</span>
                  <span className="text-red-400 font-medium">
                    {ltv > 0 ? formatUSD(liquidationPrice) : '—'}
                  </span>
                </div>
                <div className="border-t border-white/[0.08] pt-2.5 flex justify-between">
                  <span className="text-gray-400">Health factor</span>
                  <span className={cn('font-bold', getHealthColor(healthFactor))}>
                    {ltv > 0 ? healthFactor.toFixed(2) : '∞'}
                  </span>
                </div>
              </div>
            )}

            {/* Warnings */}
            {ltv > 55 && ltv <= 65 && (
              <div className="flex gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs mb-4">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>High LTV. Any 8%+ drop in {collateralSymbol} price may trigger liquidation.</span>
              </div>
            )}

            <button
              onClick={() => alert('Connect wallet to create position')}
              disabled={!collateralValue || ltv === 0}
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              Connect Wallet
            </button>

            <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>Powered by Morpho Blue on Base. Isolated markets — your position doesn't affect other borrowers.</span>
            </div>
          </div>

          {/* Risk parameters */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Market Parameters</div>
            {[
              { label: 'Max LTV', value: '65%' },
              { label: 'Oracle', value: 'Chainlink + xStocks PoR' },
              { label: 'Liquidation bonus', value: '5–10%' },
              { label: 'Protocol', value: 'Morpho Blue' },
              { label: 'Chain', value: 'Base (Mainnet)' },
            ].map((p) => (
              <div key={p.label} className="flex justify-between">
                <span className="text-gray-500">{p.label}</span>
                <span className="text-gray-300">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function BorrowPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>}>
      <BorrowPageInner />
    </Suspense>
  )
}
