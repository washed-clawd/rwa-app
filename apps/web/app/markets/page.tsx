'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Search, ArrowUpDown, ShoppingCart } from 'lucide-react'
import { XSTOCKS, MOCK_MARKET_DATA, formatUSD, formatPercent } from '@/lib/tokens'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'tech', label: 'Tech' },
  { id: 'etf', label: 'ETFs' },
  { id: 'finance', label: 'Finance' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'consumer', label: 'Consumer' },
]

export default function MarketsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume' | 'borrowRate'>('volume')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = XSTOCKS.filter((t) => {
    const matchSearch =
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'all' || t.category === category
    return matchSearch && matchCat
  })

  const sorted = [...filtered].sort((a, b) => {
    const aData = MOCK_MARKET_DATA[a.symbol]
    const bData = MOCK_MARKET_DATA[b.symbol]
    if (!aData || !bData) return 0
    let av: number, bv: number
    switch (sortBy) {
      case 'price':
        av = aData.price; bv = bData.price; break
      case 'change':
        av = aData.change24h; bv = bData.change24h; break
      case 'volume':
        av = aData.volume24h; bv = bData.volume24h; break
      case 'borrowRate':
        av = aData.borrowRate; bv = bData.borrowRate; break
      default:
        return 0
    }
    return sortDir === 'desc' ? bv - av : av - bv
  })

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const totalLiquidity = Object.values(MOCK_MARKET_DATA).reduce((s, d) => s + d.availableToBorrow, 0)
  const avgBorrowRate = Object.values(MOCK_MARKET_DATA).reduce((s, d) => s + d.borrowRate, 0) / Object.keys(MOCK_MARKET_DATA).length

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Markets</h1>
        <p className="text-gray-400">Buy and borrow against 100+ tokenized stocks on Base</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total assets', value: '100+' },
          { label: 'Total borrow liquidity', value: formatUSD(totalLiquidity, true) },
          { label: 'Avg borrow rate', value: `${avgBorrowRate.toFixed(1)}%` },
          { label: 'Max LTV', value: '65%' },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="text-xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-teal-500/50 focus:bg-white/[0.07] transition-all"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                category === cat.id
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.07]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
        {/* Table header */}
        <div className="bg-white/[0.03] px-4 py-3 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center text-xs font-medium text-gray-500">
          <div>Asset</div>
          <SortHeader label="Price" col="price" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
          <SortHeader label="24h Change" col="change" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
          <SortHeader label="Volume" col="volume" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
          <SortHeader label="Borrow Rate" col="borrowRate" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
          <div>Available</div>
          <div />
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04]">
          {sorted.map((token) => {
            const data = MOCK_MARKET_DATA[token.symbol]
            if (!data) return null
            const isUp = data.change24h >= 0

            return (
              <div
                key={token.symbol}
                className="px-4 py-3.5 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center hover:bg-white/[0.02] transition-colors"
              >
                {/* Asset */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: token.logoColor + '22', color: token.logoColor }}
                  >
                    {token.symbol.slice(1, 3)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm">{token.symbol}</div>
                    <div className="text-xs text-gray-500 truncate">{token.name}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-sm font-medium text-white tabular-nums">
                  {formatUSD(data.price)}
                </div>

                {/* Change */}
                <div className={cn('flex items-center gap-1 text-sm font-medium tabular-nums', isUp ? 'text-teal-400' : 'text-red-400')}>
                  {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {formatPercent(data.change24h)}
                </div>

                {/* Volume */}
                <div className="text-sm text-gray-300 tabular-nums">
                  {formatUSD(data.volume24h, true)}
                </div>

                {/* Borrow rate */}
                <div className="text-sm text-gray-300 tabular-nums">
                  {data.borrowRate.toFixed(1)}%
                  <span className="text-xs text-gray-600 ml-1">APY</span>
                </div>

                {/* Available */}
                <div className="text-sm text-gray-300 tabular-nums">
                  {formatUSD(data.availableToBorrow, true)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/buy?asset=${token.symbol}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 text-xs font-medium transition-colors"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Buy
                  </Link>
                  <Link
                    href={`/borrow?collateral=${token.symbol}`}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-gray-300 text-xs font-medium transition-colors"
                  >
                    Borrow
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {sorted.length === 0 && (
          <div className="py-16 text-center text-gray-500">
            No assets match your search
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-600 text-center">
        Prices are indicative. xStocks are tokenized securities — not available to US persons.
      </p>
    </div>
  )
}

function SortHeader({
  label, col, sortBy, sortDir, onSort,
}: {
  label: string
  col: 'price' | 'change' | 'volume' | 'borrowRate'
  sortBy: string
  sortDir: 'asc' | 'desc'
  onSort: (col: 'price' | 'change' | 'volume' | 'borrowRate') => void
}) {
  return (
    <button
      onClick={() => onSort(col)}
      className="flex items-center gap-1 hover:text-white transition-colors text-xs font-medium"
    >
      {label}
      <ArrowUpDown className={cn('h-3 w-3', sortBy === col ? 'text-teal-400' : 'opacity-50')} />
    </button>
  )
}
