// Chain configuration

export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// Contract addresses on Base mainnet
// TODO: Replace with actual deployed addresses after deployment
export const CONTRACTS = {
  base: {
    // Our contracts
    RWAVault: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    MorphoMarketFactory: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    OracleAdapter: "0x0000000000000000000000000000000000000000" as `0x${string}`,

    // External protocol addresses on Base
    MORPHO_BLUE: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb" as `0x${string}`,
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
    UNISWAP_V3_ROUTER: "0x2626664c2603336E57B271c5C0b26F421741e481" as `0x${string}`,
    AERODROME_ROUTER: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43" as `0x${string}`,
    GELATO_AUTOMATE: "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0" as `0x${string}`,
    TRANSAK_API_KEY: "", // Fill via env var
  },
} as const;
