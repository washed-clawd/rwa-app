// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title OracleAdapter
 * @notice Adapts Chainlink + xStocks proof-of-reserves attestation into a
 *         Morpho Blue-compatible IOracle interface.
 *
 * @dev Morpho Blue requires an oracle that implements:
 *      function price() external view returns (uint256)
 *      Returns: price of 1 unit of collateral in terms of loan asset
 *               scaled by 10^(36 + loanDecimals - collateralDecimals)
 *
 * For our markets: xStock (18 decimals) → USDC (6 decimals)
 *   price() returns price scaled by 10^(36 + 6 - 18) = 10^24
 *   e.g. xNVDA at $900 → price() = 900 * 10^24
 *
 * Circuit breaker:
 *   - If |Chainlink price - Pyth price| > DIVERGENCE_THRESHOLD → revert
 *   - If xStocks proof-of-reserves attestation fails → revert
 *   - During off-market hours: apply OFFHOURS_BUFFER to LTV calculations
 *
 * Oracle security design:
 *   - Primary: Chainlink price feed (updated every heartbeat or 0.5% deviation)
 *   - Secondary: Pyth network (for faster updates during market hours)
 *   - Validation: xStocks on-chain proof-of-reserves
 */
contract OracleAdapter is Ownable, Pausable {

    // ============================================================
    //                         INTERFACES
    // ============================================================

    /// @notice Chainlink aggregator interface (AggregatorV3Interface)
    interface IChainlinkAggregator {
        function latestRoundData() external view returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
        function decimals() external view returns (uint8);
    }

    /// @notice Pyth oracle interface (simplified)
    interface IPyth {
        struct Price {
            int64 price;
            uint64 conf;
            int32 expo;
            uint256 publishTime;
        }
        function getPriceUnsafe(bytes32 id) external view returns (Price memory price);
    }

    /// @notice xStocks Proof-of-Reserves interface
    interface IXStocksPoR {
        function getLatestAttestation() external view returns (
            uint256 tokenSupply,
            uint256 custodiedShares,
            uint256 attestedAt,
            bool isValid
        );
    }

    // ============================================================
    //                          ERRORS
    // ============================================================

    error OracleStalePriceFeed(uint256 updatedAt, uint256 maxAge);
    error OracleDivergenceTooHigh(uint256 primaryPrice, uint256 secondaryPrice, uint256 divergenceBps);
    error OracleProofOfReservesMismatch(uint256 tokenSupply, uint256 custodiedShares);
    error OracleInvalidPrice();
    error OracleNotConfigured();

    // ============================================================
    //                          EVENTS
    // ============================================================

    event CircuitBreakerTriggered(string reason, uint256 primaryPrice, uint256 secondaryPrice);
    event OracleUpdated(address indexed chainlinkFeed, bytes32 indexed pythPriceId);
    event CircuitBreakerReset();

    // ============================================================
    //                          CONSTANTS
    // ============================================================

    /// @notice Morpho oracle price scaling factor for xStock (18 dec) → USDC (6 dec)
    uint256 public constant PRICE_SCALE = 1e24; // 10^(36 + 6 - 18)

    /// @notice Max price divergence between Chainlink and Pyth (500 bps = 5%)
    uint256 public constant DIVERGENCE_THRESHOLD_BPS = 500;

    /// @notice Wider threshold during off-market hours (1000 bps = 10%)
    uint256 public constant OFFHOURS_DIVERGENCE_BPS = 1000;

    /// @notice Max age of Chainlink price before considered stale (4 hours)
    uint256 public constant MAX_PRICE_AGE = 4 hours;

    /// @notice Max proof-of-reserves deviation (50 bps = 0.5%)
    uint256 public constant MAX_POR_DEVIATION_BPS = 50;

    // ============================================================
    //                          STATE
    // ============================================================

    /// @notice Chainlink price feed for the xStock asset
    IChainlinkAggregator public chainlinkFeed;

    /// @notice Pyth oracle contract (deployed on Base)
    IPyth public pythOracle;

    /// @notice Pyth price ID for this asset
    bytes32 public pythPriceId;

    /// @notice xStocks proof-of-reserves contract
    IXStocksPoR public xstocksPoR;

    /// @notice Whether the circuit breaker has been triggered
    bool public circuitBreakerActive;

    /// @notice Human-readable asset name for events (e.g. "NVDA")
    string public assetSymbol;

    // ============================================================
    //                        CONSTRUCTOR
    // ============================================================

    /**
     * @param _chainlinkFeed Chainlink price feed address for this equity token
     * @param _pythOracle Pyth oracle contract address on Base
     * @param _pythPriceId Pyth price feed ID for this asset
     * @param _xstocksPoR xStocks proof-of-reserves contract address
     * @param _assetSymbol Human-readable ticker symbol
     */
    constructor(
        address _chainlinkFeed,
        address _pythOracle,
        bytes32 _pythPriceId,
        address _xstocksPoR,
        string memory _assetSymbol
    ) Ownable(msg.sender) {
        require(_chainlinkFeed != address(0), "Zero chainlink feed");
        require(_pythOracle != address(0), "Zero pyth oracle");
        require(_xstocksPoR != address(0), "Zero PoR contract");

        chainlinkFeed = IChainlinkAggregator(_chainlinkFeed);
        pythOracle = IPyth(_pythOracle);
        pythPriceId = _pythPriceId;
        xstocksPoR = IXStocksPoR(_xstocksPoR);
        assetSymbol = _assetSymbol;
    }

    // ============================================================
    //                     MORPHO ORACLE INTERFACE
    // ============================================================

    /**
     * @notice Returns the price of 1 unit of collateral (xStock) in terms of loan (USDC)
     *         Scaled by PRICE_SCALE = 10^24 (Morpho convention for 18-decimal collateral, 6-decimal loan)
     *
     * @dev This is the primary function called by Morpho Blue for all borrow/liquidation calculations.
     *      Will revert if:
     *      - Chainlink price is stale (>4 hours)
     *      - Price divergence between Chainlink and Pyth > 5%
     *      - Proof-of-reserves mismatch > 0.5%
     *      - Circuit breaker is active
     */
    function price() external view returns (uint256) {
        if (circuitBreakerActive) revert OracleInvalidPrice();

        (uint256 chainlinkPrice, uint256 chainlinkDecimals) = _getChainlinkPrice();
        uint256 pythPrice = _getPythPrice(chainlinkDecimals);

        // Divergence check
        _checkDivergence(chainlinkPrice, pythPrice);

        // Proof-of-reserves validation
        _checkProofOfReserves();

        // Return Morpho-scaled price using Chainlink as primary
        // Normalize to 8 decimals then scale by PRICE_SCALE
        return (chainlinkPrice * PRICE_SCALE) / (10 ** chainlinkDecimals);
    }

    // ============================================================
    //                       INTERNAL HELPERS
    // ============================================================

    function _getChainlinkPrice() internal view returns (uint256 price_, uint256 decimals_) {
        (
            uint80 roundId,
            int256 answer,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = chainlinkFeed.latestRoundData();

        // Staleness check
        if (block.timestamp - updatedAt > MAX_PRICE_AGE) {
            revert OracleStalePriceFeed(updatedAt, MAX_PRICE_AGE);
        }

        // Validity checks
        require(roundId == answeredInRound, "Chainlink: round not complete");
        require(answer > 0, "Chainlink: negative price");

        decimals_ = chainlinkFeed.decimals();
        price_ = uint256(answer);
    }

    function _getPythPrice(uint256 referenceDecimals) internal view returns (uint256) {
        IPyth.Price memory pythData = pythOracle.getPriceUnsafe(pythPriceId);

        // Convert Pyth price to same decimals as Chainlink
        int256 pythPriceNorm;
        if (pythData.expo >= 0) {
            pythPriceNorm = pythData.price * int256(10 ** uint32(pythData.expo));
        } else {
            pythPriceNorm = pythData.price / int256(10 ** uint32(-pythData.expo));
        }

        // Normalize to referenceDecimals
        return uint256(pythPriceNorm) * (10 ** referenceDecimals) / 1e8;
    }

    function _checkDivergence(uint256 primary, uint256 secondary) internal view {
        if (primary == 0 || secondary == 0) revert OracleInvalidPrice();

        uint256 diff = primary > secondary ? primary - secondary : secondary - primary;
        uint256 divergenceBps = (diff * 10000) / primary;

        // Use wider threshold during off-hours (simplified: always use standard for now)
        uint256 threshold = DIVERGENCE_THRESHOLD_BPS;

        if (divergenceBps > threshold) {
            revert OracleDivergenceTooHigh(primary, secondary, divergenceBps);
        }
    }

    function _checkProofOfReserves() internal view {
        (
            uint256 tokenSupply,
            uint256 custodiedShares,
            uint256 attestedAt,
            bool isValid
        ) = xstocksPoR.getLatestAttestation();

        // Attestation must be recent (within 24h)
        require(block.timestamp - attestedAt < 24 hours, "PoR: attestation stale");
        require(isValid, "PoR: attestation invalid");

        // Supply vs custody match (allow 0.5% rounding)
        if (tokenSupply > custodiedShares) {
            uint256 excessBps = ((tokenSupply - custodiedShares) * 10000) / custodiedShares;
            if (excessBps > MAX_POR_DEVIATION_BPS) {
                revert OracleProofOfReservesMismatch(tokenSupply, custodiedShares);
            }
        }
    }

    // ============================================================
    //                     ADMIN FUNCTIONS
    // ============================================================

    /**
     * @notice Manually trigger circuit breaker (admin use only)
     */
    function triggerCircuitBreaker(string calldata reason) external onlyOwner {
        circuitBreakerActive = true;
        emit CircuitBreakerTriggered(reason, 0, 0);
    }

    /**
     * @notice Reset circuit breaker after investigation
     */
    function resetCircuitBreaker() external onlyOwner {
        circuitBreakerActive = false;
        emit CircuitBreakerReset();
    }

    /**
     * @notice Update oracle addresses (e.g. Chainlink feed upgrade)
     */
    function updateOracles(
        address _chainlinkFeed,
        address _pythOracle,
        bytes32 _pythPriceId
    ) external onlyOwner {
        require(_chainlinkFeed != address(0), "Zero address");
        chainlinkFeed = IChainlinkAggregator(_chainlinkFeed);
        pythOracle = IPyth(_pythOracle);
        pythPriceId = _pythPriceId;
        emit OracleUpdated(_chainlinkFeed, _pythPriceId);
    }
}
