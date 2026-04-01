'use client'

import { useState } from 'react'
import { Zap, TrendingUp, Shield, BarChart3, Info, ChevronRight, Clock, Users } from 'lucide-react'
import { formatUSD } from '@/lib/tokens'
import { cn } from '@/lib/utils'

type RiskLevel = 'low' | 'medium' | 'high'

interface Vault {
  id: string
  name: string
  description: string
  strategy: string
  apy: number
  apyRange: [number, number]
  tvl: number
  risk: RiskLevel
  icon: React.ElementType
  color: string
  bg: string
  assets: string[]
  lockPeriod: string
  deposits: number
  tags: string[]
  details: string[]
  isLive: boolean
}

const VAULTS: Vault[] = [
  {
    id: 'dca',
    name: 'DCA Vault',
    description: 'Automatically dollar-cost average into a basket of top xStocks on a schedule you set.',
    strategy: 'Automated periodic buying via Gelato Network. Reduces timing risk by spreading purchases.',
    apy: 0,
    apyRange: [0, 0],
    tvl: 2340000,
    risk: 'low',
    icon: Clock,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    assets: ['xAAPL', 'xNVDA', 'xTSLA', 'xMSFT', 'xSPY'],
    lockPeriod: 'None (withdraw anytime)',
    deposits: 847,
    tags: ['Beginner', 'Auto-buy', 'Gelato'],
    details: [
      'Choose daily, weekly, or monthly DCA cadence',
      'Gelato triggers purchases at your set interval',
      'Auto-rebalances across your chosen basket',
      'No performance fees — only 0.1% per execution',
    ],
    isLive: true,
  },
  {
    id: 'covered-call',
    name: 'Covered Call Vault',
    description: 'Earn premium income by selling covered calls on your xStock holdings via Lyra/Stryke.',
    strategy: 'Holds xStocks collateral, sells OTM call options weekly, keeps premium as yield.',
    apy: 12.4,
    apyRange: [8, 18],
    tvl: 1870000,
    risk: 'medium',
    icon: TrendingUp,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    assets: ['xAAPL', 'xNVDA', 'xSPY'],
    lockPeriod: '7 days (weekly epoch)',
    deposits: 412,
    tags: ['Yield', 'Options', 'Weekly'],
    details: [
      'Sells 5–10% OTM calls on a weekly basis',
      'Premium is automatically compounded into vault',
      'Capped upside — you may miss large rallies',
      '2% management fee + 10% performance fee',
    ],
    isLive: true,
  },
  {
    id: 'delta-neutral',
    name: 'Delta Neutral Vault',
    description: 'Hold xStocks long, hedge with perpetual shorts. Capture yield without directional exposure.',
    strategy: 'Long xStocks + short via Synthetix/GMX perps. Earns funding rates when skewed positive.',
    apy: 8.7,
    apyRange: [5, 15],
    tvl: 890000,
    risk: 'medium',
    icon: BarChart3,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    assets: ['xNVDA', 'xTSLA', 'xCOIN'],
    lockPeriod: '3 days (rebalance buffer)',
    deposits: 234,
    tags: ['Market Neutral', 'Funding', 'Advanced'],
    details: [
      'Fully delta-hedged — performance tracks funding rates',
      'Rebalances automatically when delta drifts >2%',
      'Positive funding expected when market is bullish',
      '2% management fee + 20% performance fee',
    ],
    isLive: true,
  },
  {
    id: 'fixed-yield',
    name: 'Fixed Yield (Pendle PT)',
    description: 'Lock in a fixed APY on your xStocks by splitting yield with Pendle Finance.',
    strategy: 'Wraps yield-bearing xStocks into Pendle PT tokens. Fixed rate, no market risk on yield.',
    apy: 9.2,
    apyRange: [7, 12],
    tvl: 0,
    risk: 'low',
    icon: Shield,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    assets: ['xSPY', 'xQQQ'],
    lockPeriod: 'Maturity date (quarterly)',
    deposits: 0,
    tags: ['Fixed Rate', 'Pendle', 'Passive'],
    details: [
      'Splits xStock yield into PT (fixed) + YT (variable)',
      'PT holders get guaranteed fixed rate at maturity',
      'YT holders get all variable yield (leveraged)',
      'Launching once xStocks have live Pendle pool',
    ],
    isLive: false,
  },
  {
    id: 'leverage-long',
    name: 'Leverage Long',
    description: 'Amplify your equity exposure up to ~2x by looping xStocks collateral on Morpho.',
    strategy: 'Deposit xStocks → borrow USDC → buy more xStocks → repeat. Gelato manages collateral health.',
    apy: 0,
    apyRange: [0, 0],
    tvl: 0,
    risk: 'high',
    icon: Zap,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    assets: ['xNVDA', 'xTSLA', 'xCOIN'],
    lockPeriod: 'None (but forced exit near liquidation)',
    deposits: 0,
    tags: ['Leverage', '2x', 'High Risk'],
    details: [
      '~2x equity exposure through Morpho loop strategy',
      'Auto-deleverages when health factor drops below 1.1',
      'Borrow cost reduces effective returns in downtrends',
      'Launching after smart contract audit',
    ],
    isLive: false,
  },
]

const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'text-teal-400 bg-teal-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
  high: 'text-red-400 bg-red-500/10',
}

const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Med Risk',
  high: 'High Risk',
}

export default function VaultsPage() {
  const [selectedVault, setSelectedVault] = useState<string | null>(null)
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all')

  const filtered = VAULTS.filter((v) => riskFilter === 'all' || v.risk === riskFilter)
  const totalTVL = VAULTS.reduce((s, v) => s + v.tvl, 0)
  const liveVaults = VAULTS.filter((v) => v.isLive).length

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Yield Vaults</h1>
        <p className="text-gray-400">Automated strategies for your xStock holdings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total TVL', value: formatUSD(totalTVL, true) },
          { label: 'Live vaults', value: `${liveVaults} / ${VAULTS.length}` },
          { label: 'Best APY', value: '12.4%' },
          { label: 'Automation', value: 'Gelato' },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="text-xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'low', 'medium', 'high'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRiskFilter(r)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              riskFilter === r
                ? 'bg-white/[0.10] text-white'
                : 'bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.07]'
            )}
          >
            {r === 'all' ? 'All' : RISK_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Vault grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((vault) => (
          <VaultCard
            key={vault.id}
            vault={vault}
            isSelected={selectedVault === vault.id}
            onSelect={() => setSelectedVault(selectedVault === vault.id ? null : vault.id)}
          />
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-gray-500 flex items-start gap-3">
        <Info className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
        <span>
          Vaults are non-custodial ERC-4626 smart contracts. APYs are variable and based on historical performance.
          Not a guarantee. Smart contracts pending Spearbit/Sherlock audit. TVL caps apply at launch.
        </span>
      </div>
    </div>
  )
}

function VaultCard({ vault, isSelected, onSelect }: { vault: Vault; isSelected: boolean; onSelect: () => void }) {
  const Icon = vault.icon

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all cursor-pointer',
        isSelected
          ? 'border-teal-500/40 bg-white/[0.06]'
          : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.12]',
        !vault.isLive && 'opacity-70'
      )}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-xl', vault.bg)}>
              <Icon className={cn('h-5 w-5', vault.color)} />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">{vault.name}</div>
              {!vault.isLive && (
                <span className="text-xs text-gray-500 bg-white/[0.06] px-2 py-0.5 rounded-full">Coming soon</span>
              )}
            </div>
          </div>
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', RISK_COLORS[vault.risk])}>
            {RISK_LABELS[vault.risk]}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">{vault.description}</p>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">APY</div>
            <div className="text-lg font-bold text-white">
              {vault.apy > 0 ? `${vault.apy.toFixed(1)}%` : vault.id === 'dca' ? 'N/A' : '—'}
            </div>
            {vault.apyRange[0] > 0 && (
              <div className="text-xs text-gray-600">{vault.apyRange[0]}–{vault.apyRange[1]}%</div>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">TVL</div>
            <div className="text-lg font-bold text-white">{vault.tvl > 0 ? formatUSD(vault.tvl, true) : '—'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Depositors</div>
            <div className="text-lg font-bold text-white flex items-center gap-1">
              {vault.deposits > 0 ? vault.deposits : '—'}
              {vault.deposits > 0 && <Users className="h-3 w-3 text-gray-500" />}
            </div>
          </div>
        </div>

        {/* Assets */}
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {vault.assets.map((a) => (
            <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-400">{a}</span>
          ))}
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {vault.tags.map((tag) => (
            <span key={tag} className={cn('text-xs px-2 py-0.5 rounded-full', vault.bg, vault.color)}>
              {tag}
            </span>
          ))}
        </div>

        {/* Expanded details */}
        {isSelected && (
          <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-2">
            {vault.details.map((d, i) => (
              <div key={i} className="flex gap-2 text-sm text-gray-400">
                <span className="text-teal-500 flex-shrink-0">→</span>
                {d}
              </div>
            ))}
            <div className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Lock period: {vault.lockPeriod}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onSelect}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-gray-300 text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            {isSelected ? 'Hide details' : 'View details'}
            <ChevronRight className={cn('h-4 w-4 transition-transform', isSelected && 'rotate-90')} />
          </button>
          <button
            onClick={() => alert(vault.isLive ? 'Connect wallet to deposit' : 'Coming soon')}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors',
              vault.isLive
                ? 'bg-teal-500 hover:bg-teal-400 text-white'
                : 'bg-white/[0.04] text-gray-500 cursor-not-allowed'
            )}
          >
            {vault.isLive ? 'Deposit' : 'Soon'}
          </button>
        </div>
      </div>
    </div>
  )
}
