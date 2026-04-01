export interface XStockToken {
  symbol: string
  name: string
  address: string // Base chain address (placeholder)
  decimals: number
  category: 'tech' | 'etf' | 'finance' | 'consumer' | 'crypto'
  chainlinkFeed?: string
  logoColor: string
}

export const XSTOCKS: XStockToken[] = [
  { symbol: 'xAAPL', name: 'Apple Inc.', address: '0x0000000000000000000000000000000000000001', decimals: 18, category: 'tech', logoColor: '#6b7280' },
  { symbol: 'xNVDA', name: 'NVIDIA Corp.', address: '0x0000000000000000000000000000000000000002', decimals: 18, category: 'tech', logoColor: '#76b900' },
  { symbol: 'xTSLA', name: 'Tesla Inc.', address: '0x0000000000000000000000000000000000000003', decimals: 18, category: 'tech', logoColor: '#e31937' },
  { symbol: 'xMSFT', name: 'Microsoft Corp.', address: '0x0000000000000000000000000000000000000004', decimals: 18, category: 'tech', logoColor: '#00a4ef' },
  { symbol: 'xMETA', name: 'Meta Platforms', address: '0x0000000000000000000000000000000000000005', decimals: 18, category: 'tech', logoColor: '#0081fb' },
  { symbol: 'xAMZN', name: 'Amazon.com Inc.', address: '0x0000000000000000000000000000000000000006', decimals: 18, category: 'tech', logoColor: '#ff9900' },
  { symbol: 'xGOOGL', name: 'Alphabet Inc.', address: '0x0000000000000000000000000000000000000007', decimals: 18, category: 'tech', logoColor: '#4285f4' },
  { symbol: 'xNFLX', name: 'Netflix Inc.', address: '0x0000000000000000000000000000000000000008', decimals: 18, category: 'consumer', logoColor: '#e50914' },
  { symbol: 'xCOIN', name: 'Coinbase Global', address: '0x0000000000000000000000000000000000000009', decimals: 18, category: 'crypto', logoColor: '#0052ff' },
  { symbol: 'xHOOD', name: 'Robinhood Markets', address: '0x000000000000000000000000000000000000000a', decimals: 18, category: 'finance', logoColor: '#00c805' },
  { symbol: 'xSPY', name: 'S&P 500 ETF', address: '0x000000000000000000000000000000000000000b', decimals: 18, category: 'etf', logoColor: '#1a56db' },
  { symbol: 'xQQQ', name: 'Nasdaq-100 ETF', address: '0x000000000000000000000000000000000000000c', decimals: 18, category: 'etf', logoColor: '#7e22ce' },
  { symbol: 'xMCD', name: "McDonald's Corp.", address: '0x000000000000000000000000000000000000000d', decimals: 18, category: 'consumer', logoColor: '#ffc72c' },
  { symbol: 'xJPM', name: 'JPMorgan Chase', address: '0x000000000000000000000000000000000000000e', decimals: 18, category: 'finance', logoColor: '#005eb8' },
  { symbol: 'xGS', name: 'Goldman Sachs', address: '0x000000000000000000000000000000000000000f', decimals: 18, category: 'finance', logoColor: '#6699cc' },
]

// Simulated market data (to be replaced by Chainlink + xStocks API)
export interface MarketData {
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  availableToBorrow: number // USDC
  borrowRate: number // APY %
  supplyRate: number // APY %
  utilization: number // 0-100%
}

export const MOCK_MARKET_DATA: Record<string, MarketData> = {
  xAAPL: { price: 227.52, change24h: 1.23, volume24h: 142000, marketCap: 3480000000, availableToBorrow: 892000, borrowRate: 5.8, supplyRate: 4.1, utilization: 71 },
  xNVDA: { price: 876.34, change24h: 3.47, volume24h: 298000, marketCap: 2150000000, availableToBorrow: 445000, borrowRate: 6.2, supplyRate: 4.5, utilization: 73 },
  xTSLA: { price: 312.18, change24h: -2.14, volume24h: 187000, marketCap: 998000000, availableToBorrow: 334000, borrowRate: 7.1, supplyRate: 5.0, utilization: 70 },
  xMSFT: { price: 415.67, change24h: 0.87, volume24h: 98000, marketCap: 3090000000, availableToBorrow: 621000, borrowRate: 5.5, supplyRate: 3.9, utilization: 71 },
  xMETA: { price: 567.23, change24h: 2.31, volume24h: 134000, marketCap: 1440000000, availableToBorrow: 289000, borrowRate: 6.0, supplyRate: 4.3, utilization: 72 },
  xAMZN: { price: 198.44, change24h: 1.56, volume24h: 112000, marketCap: 2100000000, availableToBorrow: 410000, borrowRate: 5.7, supplyRate: 4.0, utilization: 70 },
  xGOOGL: { price: 176.89, change24h: 0.42, volume24h: 89000, marketCap: 2210000000, availableToBorrow: 556000, borrowRate: 5.6, supplyRate: 3.9, utilization: 70 },
  xNFLX: { price: 698.12, change24h: -0.88, volume24h: 67000, marketCap: 298000000, availableToBorrow: 178000, borrowRate: 6.5, supplyRate: 4.6, utilization: 71 },
  xCOIN: { price: 234.56, change24h: 5.67, volume24h: 445000, marketCap: 587000000, availableToBorrow: 223000, borrowRate: 8.1, supplyRate: 5.8, utilization: 71 },
  xHOOD: { price: 42.18, change24h: 4.23, volume24h: 89000, marketCap: 38000000, availableToBorrow: 67000, borrowRate: 9.2, supplyRate: 6.5, utilization: 70 },
  xSPY: { price: 571.34, change24h: 0.34, volume24h: 234000, marketCap: 1234000000, availableToBorrow: 1890000, borrowRate: 4.8, supplyRate: 3.4, utilization: 71 },
  xQQQ: { price: 482.67, change24h: 0.91, volume24h: 187000, marketCap: 876000000, availableToBorrow: 1230000, borrowRate: 5.0, supplyRate: 3.5, utilization: 70 },
  xMCD: { price: 298.34, change24h: -0.23, volume24h: 34000, marketCap: 214000000, availableToBorrow: 89000, borrowRate: 5.4, supplyRate: 3.8, utilization: 70 },
  xJPM: { price: 234.78, change24h: 1.12, volume24h: 76000, marketCap: 678000000, availableToBorrow: 334000, borrowRate: 5.3, supplyRate: 3.7, utilization: 70 },
  xGS: { price: 567.89, change24h: 0.67, volume24h: 43000, marketCap: 197000000, availableToBorrow: 145000, borrowRate: 5.6, supplyRate: 3.9, utilization: 70 },
}

export function formatUSD(value: number, compact = false): string {
  if (compact && value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (compact && value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (compact && value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}
