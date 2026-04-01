import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Nav } from '@/components/nav'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'StockChain — Own stocks onchain',
  description: 'Buy tokenized stocks, borrow against them, automate everything. Powered by xStocks on Base.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'StockChain — Own stocks onchain',
    description: 'Buy tokenized stocks, borrow against them, automate everything.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-[#0a0d0f] text-gray-100 antialiased">
        <Providers>
          <Nav />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
