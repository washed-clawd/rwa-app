'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Wallet, ArrowUpRight, Info } from 'lucide-react'
import { XSTOCKS, MOCK_MARKET_DATA, formatUSD, formatPercent } from '@/lib/tokens'
import { cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Mock portfolio data
const HOLDINGS = [
  { symbol: 'xNVDA', shares: 2.5, avgBuyPrice: 812.40, currentPrice: 876.34 },
  { symbol: 'xAAPL', shares: 8.0, avgBuyPrice: 218.50, currentPrice: 227.52 },
  { symbol: 'xSPY', shares: 15.0, avgBuyPrice: 554.20, currentPrice: 571.34 },
  { symbol: 'xCOIN', shares: 5.0, avgBuyPrice: 198.30, currentPrice: 234.56 },
  { symbol: 'xMSFT', shares: 3.0, avgBuyPrice: 402.10, currentPrice: 415.67 },
]

const BORROW_POSITIONS = [
  { symbol: 'xNVDA', deposited: 2, borrowed: 1140, borrowRate: 6.2, openDate: 'Mar 12, 2026' },
  { symbol: 'xSPY', deposited: 5, borrowed: 1856, borrowRate: 4.8, openDate: 'Mar 22, 2026' },
]

// Generate mock PnL chart data
function generatePnLData() {
  const data = []
  let value = 18000
  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    value += (Math.random() - 0.4) * 400
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(value),
    })
  }
  return data
}

const PNL_DATA = generatePnLData()

const CHART_COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

export default function PortfolioPage() {
  const [tab, setTab] = useState<'holdings' | 'positions' | 'activity'>('holdings')
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d')

  // Computed
  const totalHoldingsValue = HOLDINGS.reduce((s, h) => s + h.shares * h.currentPrice, 0)
  const totalCostBasis = HOLDINGS.reduce((s, h) => s + h.shares * h.avgBuyPrice, 0)
  const totalUnrealizedPnL = totalHoldingsValue - totalCostBasis
  const totalUnrealizedPnLPct = (totalUnrealizedPnL / totalCostBasis) * 100

  const totalBorrowed = BORROW_POSITIONS.reduce((s, p) => s + p.borrowed, 0)
  const netWorth = totalHoldingsValue - totalBorrowed

  const pieData = HOLDINGS.map((h) => ({
    name: h.symbol,
    value: h.shares * h.currentPrice,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
        <p className="text-gray-400">Your xStock holdings and positions at a glance</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total holdings value',
            value: formatUSD(totalHoldingsValue),
            sub: `${formatPercent(totalUnrealizedPnLPct)} all-time`,
            positive: totalUnrealizedPnL >= 0,
          },
          {
            label: 'Unrealized P&L',
            value: formatUSD(totalUnrealizedPnL),
            sub: `from ${formatUSD(totalCostBasis)} invested`,
            positive: totalUnrealizedPnL >= 0,
          },
          {
            label: 'Total borrowed',
            value: formatUSD(totalBorrowed),
            sub: `${BORROW_POSITIONS.length} open position${BORROW_POSITIONS.length !== 1 ? 's' : ''}`,
            positive: false,
          },
          {
            label: 'Net worth (on-chain)',
            value: formatUSD(netWorth),
            sub: 'holdings minus debt',
            positive: true,
          },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className={cn('text-xs mt-1', s.positive ? 'text-teal-400' : 'text-gray-500')}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 mb-8">
        {/* PnL chart */}
        <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Portfolio Value</h3>
            <div className="flex gap-1">
              {(['7d', '30d', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                    period === p ? 'bg-white/[0.10] text-white' : 'text-gray-500 hover:text-white'
                  )}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={PNL_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: '#111518',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatUSD(v), 'Value']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#14b8a6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation pie */}
        <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <h3 className="font-semibold text-white mb-4">Allocation</h3>
          <PieChart width={230} height={180} className="mx-auto">
            <Pie
              data={pieData}
              cx={110}
              cy={85}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#111518',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: 12,
              }}
              formatter={(v: number) => [formatUSD(v), 'Value']}
            />
          </PieChart>

          <div className="space-y-2 mt-2">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="text-gray-300">{((item.value / totalHoldingsValue) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] w-fit">
        {([
          { id: 'holdings', label: 'Holdings', icon: Wallet },
          { id: 'positions', label: 'Borrow Positions', icon: BarChart3 },
          { id: 'activity', label: 'Activity', icon: ArrowUpRight },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === id ? 'bg-white/[0.10] text-white' : 'text-gray-400 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Holdings tab */}
      {tab === 'holdings' && (
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-white/[0.03] text-xs text-gray-500">
            <div>Asset</div>
            <div>Shares</div>
            <div>Avg buy</div>
            <div>Current price</div>
            <div>P&L</div>
            <div></div>
          </div>
          {HOLDINGS.map((h) => {
            const tok = XSTOCKS.find((t) => t.symbol === h.symbol)
            const currentValue = h.shares * h.currentPrice
            const costBasis = h.shares * h.avgBuyPrice
            const pnl = currentValue - costBasis
            const pnlPct = (pnl / costBasis) * 100

            return (
              <div key={h.symbol} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3.5 border-t border-white/[0.04] items-center hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  {tok && (
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: tok.logoColor + '22', color: tok.logoColor }}
                    >
                      {tok.symbol.slice(1, 3)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-white text-sm">{h.symbol}</div>
                    <div className="text-xs text-gray-500">{tok?.name}</div>
                  </div>
                </div>
                <div className="text-sm text-white">
                  <div className="font-medium">{h.shares}</div>
                  <div className="text-xs text-gray-500">{formatUSD(currentValue)}</div>
                </div>
                <div className="text-sm text-gray-300">{formatUSD(h.avgBuyPrice)}</div>
                <div className="text-sm text-white font-medium">{formatUSD(h.currentPrice)}</div>
                <div className="text-sm">
                  <div className={cn('font-medium', pnl >= 0 ? 'text-teal-400' : 'text-red-400')}>
                    {pnl >= 0 ? '+' : ''}{formatUSD(pnl)}
                  </div>
                  <div className={cn('text-xs', pnl >= 0 ? 'text-teal-500' : 'text-red-500')}>
                    {formatPercent(pnlPct)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-2.5 py-1.5 rounded-lg bg-teal-500/15 text-teal-400 text-xs font-medium hover:bg-teal-500/25 transition-colors">
                    Buy more
                  </button>
                  <button className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] text-gray-300 text-xs font-medium hover:bg-white/[0.10] transition-colors">
                    Borrow
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Positions tab */}
      {tab === 'positions' && (
        <div className="space-y-4">
          {BORROW_POSITIONS.map((pos) => {
            const tok = XSTOCKS.find((t) => t.symbol === pos.symbol)
            const mkt = tok ? MOCK_MARKET_DATA[tok.symbol] : null
            if (!tok || !mkt) return null
            const collValue = pos.deposited * mkt.price
            const ltv = (pos.borrowed / collValue) * 100
            const hf = (collValue * 0.65) / pos.borrowed
            const dailyInterest = (pos.borrowed * pos.borrowRate / 100) / 365

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
                      <div className="font-semibold text-white">{tok.symbol} → USDC</div>
                      <div className="text-xs text-gray-500">Opened {pos.openDate} · Morpho Blue</div>
                    </div>
                  </div>
                  <div className={cn('text-sm font-bold', hf >= 1.5 ? 'text-teal-400' : hf >= 1.2 ? 'text-yellow-400' : 'text-red-400')}>
                    HF {hf.toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Collateral</div>
                    <div className="text-white font-medium">{pos.deposited} {pos.symbol}</div>
                    <div className="text-xs text-gray-500">{formatUSD(collValue)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Borrowed</div>
                    <div className="text-white font-medium">{formatUSD(pos.borrowed)}</div>
                    <div className="text-xs text-gray-500">LTV {ltv.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Borrow rate</div>
                    <div className="text-white font-medium">{pos.borrowRate}% APY</div>
                    <div className="text-xs text-red-400">-{formatUSD(dailyInterest)}/day</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Liq. LTV</div>
                    <div className="text-white font-medium">65%</div>
                    <div className="text-xs text-gray-500">{((65 - ltv) / ltv * 100).toFixed(0)}% buffer</div>
                  </div>
                </div>

                {/* Health bar */}
                <div className="mb-4">
                  <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', hf >= 1.5 ? 'bg-teal-500' : hf >= 1.2 ? 'bg-yellow-500' : 'bg-red-500')}
                      style={{ width: `${Math.min(ltv / 65 * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 text-sm font-medium transition-colors">
                    Add collateral
                  </button>
                  <button className="flex-1 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-gray-300 text-sm font-medium transition-colors">
                    Repay
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Activity tab */}
      {tab === 'activity' && (
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
          {[
            { type: 'buy', symbol: 'xNVDA', amount: '0.5 shares', value: '$438.17', date: 'Apr 1, 2026', status: 'confirmed' },
            { type: 'borrow', symbol: 'xSPY', amount: '5 deposited', value: '$1,856 USDC', date: 'Mar 22, 2026', status: 'confirmed' },
            { type: 'buy', symbol: 'xCOIN', amount: '2 shares', value: '$469.12', date: 'Mar 18, 2026', status: 'confirmed' },
            { type: 'repay', symbol: 'xNVDA', amount: 'Partial repay', value: '$500 USDC', date: 'Mar 15, 2026', status: 'confirmed' },
            { type: 'borrow', symbol: 'xNVDA', amount: '2 deposited', value: '$1,140 USDC', date: 'Mar 12, 2026', status: 'confirmed' },
          ].map((tx, i) => (
            <div key={i} className={cn('flex items-center justify-between px-4 py-3.5 text-sm', i > 0 && 'border-t border-white/[0.04]')}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center',
                  tx.type === 'buy' ? 'bg-teal-500/15' : tx.type === 'borrow' ? 'bg-blue-500/15' : 'bg-purple-500/15'
                )}>
                  {tx.type === 'buy' ? (
                    <TrendingUp className="h-4 w-4 text-teal-400" />
                  ) : tx.type === 'borrow' ? (
                    <ArrowUpRight className="h-4 w-4 text-blue-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-purple-400" />
                  )}
                </div>
                <div>
                  <div className="text-white font-medium capitalize">{tx.type} {tx.symbol}</div>
                  <div className="text-xs text-gray-500">{tx.amount}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{tx.value}</div>
                <div className="text-xs text-gray-500">{tx.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-600">
        <Info className="h-3.5 w-3.5" />
        Portfolio data is simulated for demonstration. Connect wallet to view real holdings.
      </div>
    </div>
  )
}
