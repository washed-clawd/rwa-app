// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {RWAVault} from "../src/RWAVault.sol";
import {MorphoMarketFactory} from "../src/MorphoMarketFactory.sol";
import {OracleAdapter} from "../src/OracleAdapter.sol";

/**
 * @title Deploy
 * @notice Deployment script for Base Sepolia testnet + Base mainnet
 *
 * Usage:
 *   # Testnet
 *   forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
 *
 *   # Mainnet (use --dry-run first!)
 *   forge script script/Deploy.s.sol --rpc-url base --broadcast --verify
 *
 * Required env vars:
 *   PRIVATE_KEY, BASE_RPC_URL, BASESCAN_API_KEY
 *   CHAINLINK_NVDA_FEED, CHAINLINK_TSLA_FEED, CHAINLINK_COIN_FEED
 *   PYTH_ORACLE_BASE (Pyth contract on Base)
 *   XSTOCKS_POR_CONTRACT (xStocks PoR attestation contract)
 *   GELATO_KEEPER (Gelato automate address)
 */
contract Deploy is Script {
    // ─── Testnet Addresses (Base Sepolia) ─────────────────────────
    // TODO: Update with real addresses before deployment

    address constant PYTH_BASE = 0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a; // Pyth on Base
    address constant XNVDA_TOKEN = address(0); // TODO: xStocks Base token addresses
    address constant XTSLA_TOKEN = address(0);
    address constant XCOIN_TOKEN = address(0);
    address constant XCSPX_TOKEN = address(0);

    // Chainlink feeds on Base
    address constant CL_NVDA_BASE = address(0); // TODO: Chainlink NVDA/USD on Base
    address constant CL_TSLA_BASE = address(0); // TODO: Chainlink TSLA/USD on Base
    address constant CL_COIN_BASE = address(0); // TODO: Chainlink COIN/USD on Base

    // Pyth price IDs (from https://pyth.network/price-feeds)
    bytes32 constant PYTH_NVDA = 0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edcf; // TODO: actual Pyth ID
    bytes32 constant PYTH_TSLA = 0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edce;
    bytes32 constant PYTH_COIN = 0x16c8e28e3c3acd96c58ecd4e3c9ad4e6ab00edcd;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        address keeper = vm.envOr("GELATO_KEEPER", deployer);
        address xstocksPor = vm.envOr("XSTOCKS_POR_CONTRACT", deployer); // TODO: real PoR address

        console2.log("Deploying from:", deployer);
        console2.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerKey);

        // 1. Deploy Market Factory
        MorphoMarketFactory factory = new MorphoMarketFactory();
        console2.log("MorphoMarketFactory:", address(factory));

        // 2. Deploy Oracle Adapters (one per xStocks token)
        // NOTE: These will fail with zero addresses on mainnet — replace before deploying
        if (CL_NVDA_BASE != address(0)) {
            OracleAdapter nvdaOracle = new OracleAdapter(
                CL_NVDA_BASE,
                PYTH_BASE,
                PYTH_NVDA,
                xstocksPor,
                "NVDA"
            );
            console2.log("OracleAdapter (NVDA):", address(nvdaOracle));

            // 3. Deploy Vault for xNVDA
            if (XNVDA_TOKEN != address(0)) {
                RWAVault nvdaVault = new RWAVault(
                    XNVDA_TOKEN,
                    "RWA Vault xNVDA",
                    "rvxNVDA",
                    "NVDA",
                    100_000e18, // 100k token cap at launch
                    keeper,
                    address(nvdaOracle)
                );
                console2.log("RWAVault (xNVDA):", address(nvdaVault));

                // 4. Create Morpho Market for xNVDA
                factory.createXStockMarket(
                    XNVDA_TOKEN,
                    address(nvdaOracle),
                    "NVDA",
                    0.65e18 // 65% LLTV
                );
                console2.log("Morpho market created for NVDA");
            }
        }

        vm.stopBroadcast();

        console2.log("Deployment complete.");
        console2.log("IMPORTANT: Update packages/shared/src/chains.ts with deployed addresses!");
    }
}
