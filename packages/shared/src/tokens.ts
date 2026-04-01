// xStocks token definitions — Backed Finance EVM tokens on Base
// Token addresses are placeholders until xStocks deploys on Base mainnet

export interface XStockToken {
  symbol: string;       // e.g. "xAAPL"
  name: string;         // e.g. "Apple Inc. (xStocks)"
  underlying: string;   // TradFi ticker, e.g. "AAPL"
  address: `0x${string}`;
  decimals: number;
  logoUrl: string;
  sector: string;
  chainlinkFeed?: `0x${string}`;  // Chainlink price feed on Base
  pythPriceId?: string;            // Pyth price feed ID
}

// Base chain (mainnet): https://docs.xstocks.fi/evm/base
// NOTE: These are placeholder addresses. Replace with live xStocks Base deployment addresses.
export const XSTOCK_TOKENS: XStockToken[] = [
  // Tech Giants
  {
    symbol: "xNVDA",
    name: "NVIDIA Corporation",
    underlying: "NVDA",
    address: "0x0000000000000000000000000000000000000001",
    decimals: 18,
    logoUrl: "/tokens/nvda.svg",
    sector: "Technology",
    pythPriceId: "0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edcf",
  },
  {
    symbol: "xTSLA",
    name: "Tesla, Inc.",
    underlying: "TSLA",
    address: "0x0000000000000000000000000000000000000002",
    decimals: 18,
    logoUrl: "/tokens/tsla.svg",
    sector: "Automotive / Tech",
    pythPriceId: "0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edce",
  },
  {
    symbol: "xCOIN",
    name: "Coinbase Global, Inc.",
    underlying: "COIN",
    address: "0x0000000000000000000000000000000000000003",
    decimals: 18,
    logoUrl: "/tokens/coin.svg",
    sector: "Crypto / Finance",
    pythPriceId: "0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edcd",
  },
  {
    symbol: "xCSPX",
    name: "iShares Core S&P 500 ETF",
    underlying: "CSPX",
    address: "0x0000000000000000000000000000000000000004",
    decimals: 18,
    logoUrl: "/tokens/cspx.svg",
    sector: "ETF / Index",
    pythPriceId: "0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edcc",
  },
  {
    symbol: "xAAPL",
    name: "Apple Inc.",
    underlying: "AAPL",
    address: "0x0000000000000000000000000000000000000005",
    decimals: 18,
    logoUrl: "/tokens/aapl.svg",
    sector: "Technology",
    pythPriceId: "0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edcb",
  },
  {
    symbol: "xMSFT",
    name: "Microsoft Corporation",
    underlying: "MSFT",
    address: "0x0000000000000000000000000000000000000006",
    decimals: 18,
    logoUrl: "/tokens/msft.svg",
    sector: "Technology",
    pythPriceId: "0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edca",
  },
  {
    symbol: "xMETA",
    name: "Meta Platforms, Inc.",
    underlying: "META",
    address: "0x0000000000000000000000000000000000000007",
    decimals: 18,
    logoUrl: "/tokens/meta.svg",
    sector: "Technology",
    pythPriceId: "0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edc9",
  },
  {
    symbol: "xAMZN",
    name: "Amazon.com, Inc.",
    underlying: "AMZN",
    address: "0x0000000000000000000000000000000000000008",
    decimals: 18,
    logoUrl: "/tokens/amzn.svg",
    sector: "E-commerce / Tech",
    pythPriceId: "0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edc8",
  },
  {
    symbol: "xGOOGL",
    name: "Alphabet Inc.",
    underlying: "GOOGL",
    address: "0x0000000000000000000000000000000000000009",
    decimals: 18,
    logoUrl: "/tokens/googl.svg",
    sector: "Technology",
    pythPriceId: "0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edc7",
  },
  {
    symbol: "xNFLX",
    name: "Netflix, Inc.",
    underlying: "NFLX",
    address: "0x0000000000000000000000000000000000000010",
    decimals: 18,
    logoUrl: "/tokens/nflx.svg",
    sector: "Streaming / Tech",
    pythPriceId: "0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edc6",
  },
  {
    symbol: "xHOOD",
    name: "Robinhood Markets, Inc.",
    underlying: "HOOD",
    address: "0x0000000000000000000000000000000000000011",
    decimals: 18,
    logoUrl: "/tokens/hood.svg",
    sector: "Fintech",
    pythPriceId: "0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edc5",
  },
  {
    symbol: "xMCD",
    name: "McDonald's Corporation",
    underlying: "MCD",
    address: "0x0000000000000000000000000000000000000012",
    decimals: 18,
    logoUrl: "/tokens/mcd.svg",
    sector: "Consumer / Food",
    pythPriceId: "0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edc4",
  },
];

// Most liquid subset for MVP focus
export const MVP_TOKENS = XSTOCK_TOKENS.filter(t =>
  ["xNVDA", "xTSLA", "xCOIN", "xCSPX", "xAAPL"].includes(t.symbol)
);

export function getTokenBySymbol(symbol: string): XStockToken | undefined {
  return XSTOCK_TOKENS.find(t => t.symbol === symbol);
}
