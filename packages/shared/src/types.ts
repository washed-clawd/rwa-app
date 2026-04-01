// Shared types across the RWA app

export interface TokenPrice {
  symbol: string;
  priceUsd: number;
  change24h: number;
  change24hPercent: number;
  lastUpdated: number; // unix timestamp
}

export interface MarketData {
  token: string;
  priceUsd: number;
  change24hPercent: number;
  availableToBorrow: number; // USDC available in Morpho market
  totalCollateral: number;   // total xStocks deposited
  borrowApy: number;
  supplyApy: number;
  utilizationRate: number;
  lltv: number; // e.g. 0.65
}

export interface Position {
  tokenSymbol: string;
  tokenAddress: `0x${string}`;
  collateralAmount: bigint;
  collateralUsd: number;
  borrowedUsdc: bigint;
  borrowedUsd: number;
  healthFactor: number;
  ltv: number;
  liquidationPriceUsd: number;
}

export interface VaultInfo {
  id: string;
  name: string;
  description: string;
  strategy: "dca" | "covered-call" | "delta-neutral" | "leveraged-long";
  apy: number;
  tvlUsd: number;
  riskLevel: "low" | "medium" | "high";
  address: `0x${string}`;
  depositToken: string;
  underlyingTokens: string[];
  minDeposit: number;
  withdrawalDelay: number; // hours
  isActive: boolean;
}

export interface Portfolio {
  totalValueUsd: number;
  totalBorrowedUsd: number;
  netValueUsd: number;
  pnlUsd: number;
  pnlPercent: number;
  positions: Position[];
  vaultPositions: VaultPosition[];
}

export interface VaultPosition {
  vaultId: string;
  vaultName: string;
  shares: bigint;
  valueUsd: number;
  pnlUsd: number;
  pnlPercent: number;
}

export interface KYCStatus {
  isVerified: boolean;
  level: "none" | "basic" | "full";
  attestationId?: string;
  expiresAt?: number;
}

export type Chain = "base" | "solana";

export interface OnrampQuote {
  provider: "transak" | "coinbase-pay";
  fiatAmount: number;
  fiatCurrency: string;
  cryptoAmount: number;
  cryptoToken: string;
  fee: number;
  estimatedTime: string; // "instant" | "1-3 min" | etc.
}
