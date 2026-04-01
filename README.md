# RWA App — Own Stocks Onchain

> **Own stocks onchain. Borrow against them. Automate everything.**

A vertically integrated consumer RWA (Real-World Asset) application built on Base, targeting crypto-native TradFi crossover users.

## What is this?

The first consumer app that lets you:
1. **Buy tokenized stocks** — 100+ real stocks as ERC-20 tokens (xStocks by Backed Finance)
2. **Borrow against them** — Use your xStocks as collateral to borrow USDC via Morpho Blue (65% LLTV)
3. **Automate strategies** — DCA vaults, covered calls, delta-neutral positions via Gelato Network
4. **Earn yield** — Fixed-rate PT/YT yield via Pendle Finance

## Architecture

- **Chain**: Base (primary), Solana Phase 2
- **RWA Tokens**: xStocks (xAAPL, xNVDA, xTSLA, xCOIN, xCSPX, +100 more)
- **Lending**: Morpho Blue (permissionless isolated markets, 65% LLTV)
- **Oracles**: Chainlink (primary) + Pyth (secondary) + xStocks PoR attestation
- **Yield**: Pendle PT/YT + ERC-4626 custom vaults
- **Automation**: Gelato Network (DCA, stop-loss, liquidation guard)
- **KYC**: Fractal ID (non-US first), US IPs geo-blocked
- **Fiat**: Transak + Coinbase Pay

## Monorepo Structure

```
rwa-app/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── contracts/    # Solidity smart contracts (Foundry)
├── packages/
│   └── shared/       # Shared TypeScript types and constants
└── README.md
```

## Quickstart

```bash
# Install dependencies
cd apps/web && npm install

# Run dev server
npm run dev

# Build
npm run build
```

## Development Roadmap

### Month 1 (Sprint 1–2)
- [ ] xStocks token integration + price feeds
- [ ] Fiat onramp (Transak embed)
- [ ] Buy flow (select stock → onramp → confirm)
- [ ] Morpho Blue market creation for xStocks collateral
- [ ] Oracle adapter (Chainlink + xStocks PoR)

### Month 2 (Sprint 3–4)
- [ ] Lending UI (deposit xStocks → borrow USDC)
- [ ] Health factor monitoring + liquidation guard
- [ ] Fractal ID KYC integration
- [ ] US geo-blocking
- [ ] Smart contract audit (Spearbit/Sherlock)

### Month 3 (Sprint 5–6)
- [ ] Automation layer (Gelato DCA, stop-loss)
- [ ] ERC-4626 vault strategies
- [ ] Portfolio dashboard
- [ ] Public launch + marketing

## Legal

Cayman Foundation + BVI subsidiary. Non-US users only at launch.

---

Built with ❤️ by the RWA App team.
