// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MorphoMarketFactory
 * @notice Helper contract for creating and managing Morpho Blue markets
 *         for xStocks (Backed Finance) collateral tokens.
 *
 * @dev Morpho Blue is permissionless — anyone can create a new market by calling
 *      IMorpho.createMarket(MarketParams). This factory:
 *        1. Standardizes market creation for xStocks tokens
 *        2. Stores created market IDs for frontend querying
 *        3. Validates oracle adapter before market creation
 *        4. Emits events for indexing
 *
 * Market structure (Morpho Blue):
 *   - collateralToken: xStock ERC-20 (e.g. xNVDA, xTSLA)
 *   - loanToken: USDC
 *   - oracle: OracleAdapter (our Chainlink + PoR adapter)
 *   - irm: Adaptive Curve IRM (Morpho's standard)
 *   - lltv: 65% (0.65e18 in Morpho's wad representation)
 *
 * Base addresses:
 *   - Morpho Blue: 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb
 *   - Adaptive Curve IRM: 0x46415998764C29aB2a25CbeA6254146D50D22687
 *   - USDC on Base: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
 */
contract MorphoMarketFactory is Ownable {

    // ============================================================
    //                         INTERFACES
    // ============================================================

    /// @notice Morpho Blue market parameters
    struct MarketParams {
        address loanToken;
        address collateralToken;
        address oracle;
        address irm;
        uint256 lltv;
    }

    /// @notice Morpho Blue core interface (minimal)
    interface IMorpho {
        function createMarket(MarketParams memory marketParams) external;
        function idToMarketParams(bytes32 id) external view returns (MarketParams memory);
        function market(bytes32 id) external view returns (
            uint128 totalSupplyAssets,
            uint128 totalSupplyShares,
            uint128 totalBorrowAssets,
            uint128 totalBorrowShares,
            uint128 lastUpdate,
            uint128 fee
        );
    }

    // ============================================================
    //                          ERRORS
    // ============================================================

    error MarketAlreadyExists(bytes32 marketId);
    error InvalidLLTV(uint256 lltv);
    error InvalidOracleAdapter(address oracle);

    // ============================================================
    //                          EVENTS
    // ============================================================

    event MarketCreated(
        bytes32 indexed marketId,
        address indexed collateralToken,
        address indexed oracle,
        string stockSymbol,
        uint256 lltv
    );

    event MarketRegistered(bytes32 indexed marketId, string stockSymbol);

    // ============================================================
    //                          CONSTANTS
    // ============================================================

    /// @notice Morpho Blue on Base mainnet
    address public constant MORPHO_BLUE = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;

    /// @notice Adaptive Curve IRM on Base
    address public constant ADAPTIVE_CURVE_IRM = 0x46415998764C29aB2a25CbeA6254146D50D22687;

    /// @notice USDC on Base (loan token for all our markets)
    address public constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    /// @notice Default LLTV for xStocks markets: 65% (wad representation)
    uint256 public constant DEFAULT_LLTV = 0.65e18;

    /// @notice Minimum allowed LLTV: 50%
    uint256 public constant MIN_LLTV = 0.50e18;

    /// @notice Maximum allowed LLTV: 80% (for more liquid stocks)
    uint256 public constant MAX_LLTV = 0.80e18;

    // ============================================================
    //                          STATE
    // ============================================================

    /// @notice Morpho Blue instance
    IMorpho public immutable morpho;

    /// @notice Track created market IDs by collateral token address
    mapping(address => bytes32) public collateralToMarketId;

    /// @notice Track market IDs by stock ticker symbol
    mapping(string => bytes32) public symbolToMarketId;

    /// @notice All created market IDs (for enumeration)
    bytes32[] public marketIds;

    /// @notice Market metadata
    struct MarketInfo {
        bytes32 id;
        address collateralToken;
        address oracle;
        uint256 lltv;
        string stockSymbol;
        uint256 createdAt;
        bool isActive;
    }

    mapping(bytes32 => MarketInfo) public marketInfo;

    // ============================================================
    //                        CONSTRUCTOR
    // ============================================================

    constructor() Ownable(msg.sender) {
        morpho = IMorpho(MORPHO_BLUE);
    }

    // ============================================================
    //                     MARKET CREATION
    // ============================================================

    /**
     * @notice Create a new Morpho Blue market for an xStocks token
     * @param collateralToken xStocks ERC-20 token address (e.g. xNVDA)
     * @param oracle OracleAdapter address for this token
     * @param stockSymbol Human-readable ticker (e.g. "NVDA")
     * @param lltv Loan-to-value ratio in wad (e.g. 0.65e18 for 65%)
     */
    function createXStockMarket(
        address collateralToken,
        address oracle,
        string calldata stockSymbol,
        uint256 lltv
    ) external onlyOwner returns (bytes32 marketId) {
        // Validations
        if (collateralToMarketId[collateralToken] != bytes32(0)) {
            revert MarketAlreadyExists(collateralToMarketId[collateralToken]);
        }
        if (lltv < MIN_LLTV || lltv > MAX_LLTV) revert InvalidLLTV(lltv);
        if (oracle == address(0)) revert InvalidOracleAdapter(oracle);

        MarketParams memory params = MarketParams({
            loanToken: USDC,
            collateralToken: collateralToken,
            oracle: oracle,
            irm: ADAPTIVE_CURVE_IRM,
            lltv: lltv
        });

        // Compute market ID (Morpho's keccak256 of abi-encoded params)
        marketId = _computeMarketId(params);

        // Create market on Morpho Blue (permissionless — no governance needed)
        morpho.createMarket(params);

        // Store metadata
        collateralToMarketId[collateralToken] = marketId;
        symbolToMarketId[stockSymbol] = marketId;
        marketIds.push(marketId);

        marketInfo[marketId] = MarketInfo({
            id: marketId,
            collateralToken: collateralToken,
            oracle: oracle,
            lltv: lltv,
            stockSymbol: stockSymbol,
            createdAt: block.timestamp,
            isActive: true
        });

        emit MarketCreated(marketId, collateralToken, oracle, stockSymbol, lltv);
    }

    /**
     * @notice Batch create markets for multiple xStocks tokens
     */
    function batchCreateMarkets(
        address[] calldata collateralTokens,
        address[] calldata oracles,
        string[] calldata symbols,
        uint256[] calldata lltvs
    ) external onlyOwner {
        require(
            collateralTokens.length == oracles.length &&
            oracles.length == symbols.length &&
            symbols.length == lltvs.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < collateralTokens.length; i++) {
            this.createXStockMarket(collateralTokens[i], oracles[i], symbols[i], lltvs[i]);
        }
    }

    // ============================================================
    //                       VIEW FUNCTIONS
    // ============================================================

    /**
     * @notice Get all created market IDs
     */
    function getAllMarketIds() external view returns (bytes32[] memory) {
        return marketIds;
    }

    /**
     * @notice Get market count
     */
    function marketCount() external view returns (uint256) {
        return marketIds.length;
    }

    /**
     * @notice Get on-chain market state from Morpho
     */
    function getMarketState(bytes32 id) external view returns (
        uint128 totalSupplyAssets,
        uint128 totalSupplyShares,
        uint128 totalBorrowAssets,
        uint128 totalBorrowShares,
        uint128 lastUpdate,
        uint128 fee
    ) {
        return morpho.market(id);
    }

    // ============================================================
    //                       INTERNAL HELPERS
    // ============================================================

    /**
     * @dev Compute Morpho market ID from market params
     *      Matches Morpho Blue's internal ID computation
     */
    function _computeMarketId(MarketParams memory params) internal pure returns (bytes32) {
        return keccak256(abi.encode(params));
    }
}
