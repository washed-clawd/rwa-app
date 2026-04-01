import Link from 'next/link'
import { ArrowRight, Shield, Zap, TrendingUp, Lock, Globe, CheckCircle } from 'lucide-react'
import { XSTOCKS } from '@/lib/tokens'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0d0f] text-gray-100">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0d0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">SC</span>
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">StockChain</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/markets" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              Markets
            </Link>
            <Link
              href="/markets"
              className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium transition-colors"
            >
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-teal-500/5 blur-3xl" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              Built on Base · Powered by xStocks
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white mb-6">
              Own stocks onchain.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                Borrow against them.
              </span>
              <br />
              Automate everything.
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl">
              The first vertically integrated RWA platform. Buy tokenized stocks 24/7,
              use them as DeFi collateral, and let smart automation handle the rest.
              No Robinhood account. No broker fees. No borders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/buy"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Start buying stocks
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/markets"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white font-semibold transition-colors"
              >
                View markets
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-white/[0.08]">
              {[
                { label: 'Supported assets', value: '100+' },
                { label: 'Max LTV', value: '65%' },
                { label: 'Settlement time', value: 'T+0' },
                { label: 'Trading hours', value: '24/7' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How it works</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Three steps to owning real-world assets onchain and putting them to work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Globe,
                title: 'Buy tokenized stocks',
                description:
                  'Use your card, bank account, or crypto to buy tokenized stocks. Each xStock is 1:1 backed by real shares held by a regulated custodian.',
                color: 'text-teal-400',
                bg: 'bg-teal-500/10',
              },
              {
                step: '02',
                icon: Landmark,
                title: 'Borrow against your holdings',
                description:
                  'Deposit xStocks as collateral on Morpho Blue and borrow USDC. Up to 65% LTV. Keep equity exposure, unlock liquidity.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
              },
              {
                step: '03',
                icon: Zap,
                title: 'Automate your strategy',
                description:
                  'Set up DCA, covered calls, or delta-neutral vaults. Gelato Network handles execution automatically while you sleep.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-colors"
              >
                <div className="absolute top-6 right-6 text-6xl font-bold text-white/[0.04] select-none">
                  {item.step}
                </div>
                <div className={`inline-flex p-3 rounded-xl ${item.bg} mb-4`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported assets grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              100+ stocks & ETFs available
            </h2>
            <p className="text-gray-400 text-lg">
              Every xStock is 1:1 backed by real shares. Trade 24/7, settle instantly.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
            {XSTOCKS.map((token) => (
              <Link
                key={token.symbol}
                href="/markets"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all group"
              >
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: token.logoColor + '33' }}
                >
                  <span style={{ color: token.logoColor }}>{token.symbol.slice(1, 3)}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{token.symbol}</div>
                  <div className="text-xs text-gray-500 truncate">{token.name.split(' ')[0]}</div>
                </div>
              </Link>
            ))}
            <div className="flex items-center justify-center p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] border-dashed text-gray-500 text-sm">
              +85 more
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/markets"
              className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
            >
              View all markets <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Built for the TradFi crossover generation
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-10">
                You have a Coinbase account. You understand stocks. You're frustrated by siloed
                systems that can't talk to each other. StockChain is the layer that connects them.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Shield,
                    title: '1:1 Custodied. Bankruptcy-remote.',
                    desc: 'xStocks are held by regulated Swiss custodians in bankruptcy-remote SPVs.',
                  },
                  {
                    icon: Lock,
                    title: 'Non-custodial. Your keys, your stocks.',
                    desc: 'We never hold your assets. Smart contracts and your wallet do.',
                  },
                  {
                    icon: TrendingUp,
                    title: 'KYC-lite. Non-US first.',
                    desc: 'Fractal ID verification for non-US users. Simple, private, on-chain.',
                  },
                  {
                    icon: CheckCircle,
                    title: 'Audited contracts.',
                    desc: 'Spearbit / Sherlock audit before mainnet. TVL caps at launch.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <item.icon className="h-5 w-5 text-teal-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium mb-0.5">{item.title}</div>
                      <div className="text-gray-400 text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual card stack */}
            <div className="relative lg:pl-8">
              <div className="relative">
                {/* Background cards */}
                <div className="absolute -top-3 left-6 right-0 h-full rounded-2xl bg-white/[0.02] border border-white/[0.05] rotate-2" />
                <div className="absolute -top-1.5 left-3 right-0 h-full rounded-2xl bg-white/[0.03] border border-white/[0.06] rotate-1" />

                {/* Main card */}
                <div className="relative p-6 rounded-2xl bg-[#111518] border border-white/[0.10]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Portfolio Value</div>
                      <div className="text-3xl font-bold text-white">$24,831.40</div>
                      <div className="text-sm text-teal-400 font-medium mt-1">+$1,234.56 (5.2%)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Available to borrow</div>
                      <div className="text-xl font-bold text-white">$16,140</div>
                      <div className="text-xs text-gray-500 mt-1">at 65% LTV</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { symbol: 'xNVDA', name: 'NVIDIA', amount: '2.0', value: '$1,752.68', change: '+3.47%', color: '#76b900' },
                      { symbol: 'xAAPL', name: 'Apple', amount: '10.0', value: '$2,275.20', change: '+1.23%', color: '#6b7280' },
                      { symbol: 'xSPY', name: 'S&P 500', amount: '30.0', value: '$17,140.20', change: '+0.34%', color: '#1a56db' },
                    ].map((pos) => (
                      <div
                        key={pos.symbol}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: pos.color + '33', color: pos.color }}
                          >
                            {pos.symbol.slice(1, 3)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{pos.symbol}</div>
                            <div className="text-xs text-gray-500">{pos.amount} shares</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">{pos.value}</div>
                          <div className="text-xs text-teal-400">{pos.change}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-8">
            Non-US users · Base network · No account needed
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to put your stocks to work?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Connect your wallet. No KYC required to browse markets. Start borrowing in minutes.
          </p>
          <Link
            href="/buy"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">SC</span>
            </div>
            <span className="text-sm text-gray-400">StockChain</span>
          </div>
          <div className="text-xs text-gray-600">
            Not available to US persons. Not financial advice. Smart contracts are experimental.
          </div>
        </div>
      </footer>
    </div>
  )
}
