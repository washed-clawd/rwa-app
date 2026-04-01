'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { TrendingUp, ShoppingCart, Landmark, Layers, BarChart3, Wallet } from 'lucide-react'

const NAV_LINKS = [
  { href: '/markets', label: 'Markets', icon: TrendingUp },
  { href: '/buy', label: 'Buy', icon: ShoppingCart },
  { href: '/borrow', label: 'Borrow', icon: Landmark },
  { href: '/vaults', label: 'Vaults', icon: Layers },
  { href: '/portfolio', label: 'Portfolio', icon: BarChart3 },
]

export function Nav() {
  const pathname = usePathname()
  const isLanding = pathname === '/'

  if (isLanding) return null

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0d0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">SC</span>
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">StockChain</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-white/[0.08] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* Connect wallet */}
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium transition-colors">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect Wallet</span>
        </button>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-white/[0.06] px-4 pb-2 pt-1 flex items-center gap-1 overflow-x-auto">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
              pathname === href
                ? 'bg-white/[0.08] text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
