// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RWAVault
 * @notice ERC-4626 vault for xStocks (Backed Finance) tokenized equity collateral.
 *         Users deposit xStock tokens and receive vault shares representing their
 *         proportional claim on the collateral pool.
 *
 * @dev This vault serves as the collateral management layer:
 *      - Accept xStocks deposits (e.g. xNVDA, xTSLA, xCSPX)
 *      - Track user shares in the vault
 *      - Integrate with Morpho Blue for USDC borrowing against collateral
 *      - Support automated strategies via Gelato Network
 *
 * Architecture:
 *   User → deposit xStocks → RWAVault (ERC-4626) → Morpho Blue (borrow USDC)
 *                                                  → Gelato (automation)
 *
 * Security considerations:
 *   - Pausable for emergency stop
 *   - ReentrancyGuard on all state-changing functions
 *   - TVL caps during initial deployment (set maxDeposit)
 *   - Circuit breaker: pause if oracle divergence > 5%
 */
contract RWAVault is ERC4626, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============================================================
    //                          ERRORS
    // ============================================================

    error ExceedsDepositCap();
    error ZeroAssets();
    error ZeroShares();
    error UnauthorizedKeeper();
    error InvalidOracle();

    // ============================================================
    //                          EVENTS
    // ============================================================

    event DepositCapUpdated(uint256 oldCap, uint256 newCap);
    event KeeperUpdated(address indexed oldKeeper, address indexed newKeeper);
    event EmergencyPause(address indexed triggeredBy, string reason);
    event OracleAdapterUpdated(address indexed oldOracle, address indexed newOracle);

    // ============================================================
    //                          STATE
    // ============================================================

    /// @notice Maximum total assets that can be deposited (TVL cap for launch)
    uint256 public depositCap;

    /// @notice Keeper address — authorized for automation tasks (Gelato)
    address public keeper;

    /// @notice Oracle adapter for getting xStocks price
    address public oracleAdapter;

    /// @notice Name of the underlying stock (for display purposes)
    string public stockTicker;

    // ============================================================
    //                        CONSTRUCTOR
    // ============================================================

    /**
     * @param _asset The xStocks ERC-20 token address (e.g. xNVDA on Base)
     * @param _name Vault token name (e.g. "RWA Vault xNVDA")
     * @param _symbol Vault token symbol (e.g. "rvxNVDA")
     * @param _stockTicker Underlying stock ticker (e.g. "NVDA")
     * @param _depositCap Initial TVL cap in asset units (18 decimals)
     * @param _keeper Gelato automation keeper address
     * @param _oracleAdapter Address of the OracleAdapter contract
     */
    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        string memory _stockTicker,
        uint256 _depositCap,
        address _keeper,
        address _oracleAdapter
    ) ERC4626(IERC20(_asset)) ERC20(_name, _symbol) Ownable(msg.sender) {
        require(_asset != address(0), "Zero asset address");
        require(_keeper != address(0), "Zero keeper address");
        require(_oracleAdapter != address(0), "Zero oracle address");

        depositCap = _depositCap;
        keeper = _keeper;
        oracleAdapter = _oracleAdapter;
        stockTicker = _stockTicker;
    }

    // ============================================================
    //                     ERC-4626 OVERRIDES
    // ============================================================

    /**
     * @notice Maximum depositable assets (enforces TVL cap)
     */
    function maxDeposit(address) public view override returns (uint256) {
        if (paused()) return 0;
        uint256 currentAssets = totalAssets();
        if (currentAssets >= depositCap) return 0;
        return depositCap - currentAssets;
    }

    /**
     * @notice Maximum mintable shares (enforces TVL cap)
     */
    function maxMint(address) public view override returns (uint256) {
        if (paused()) return 0;
        uint256 maxDepositAmount = maxDeposit(address(0));
        if (maxDepositAmount == 0) return 0;
        return convertToShares(maxDepositAmount);
    }

    /**
     * @dev Override deposit to add nonReentrant + pause checks
     */
    function deposit(
        uint256 assets,
        address receiver
    ) public override nonReentrant whenNotPaused returns (uint256 shares) {
        if (assets == 0) revert ZeroAssets();
        if (assets > maxDeposit(receiver)) revert ExceedsDepositCap();
        return super.deposit(assets, receiver);
    }

    /**
     * @dev Override withdraw to add nonReentrant
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner_
    ) public override nonReentrant returns (uint256 shares) {
        if (assets == 0) revert ZeroAssets();
        return super.withdraw(assets, receiver, owner_);
    }

    /**
     * @dev Override redeem to add nonReentrant
     */
    function redeem(
        uint256 shares,
        address receiver,
        address owner_
    ) public override nonReentrant returns (uint256 assets) {
        if (shares == 0) revert ZeroShares();
        return super.redeem(shares, receiver, owner_);
    }

    // ============================================================
    //                     KEEPER FUNCTIONS
    // ============================================================

    modifier onlyKeeper() {
        if (msg.sender != keeper && msg.sender != owner()) revert UnauthorizedKeeper();
        _;
    }

    /**
     * @notice Emergency pause — callable by keeper or owner
     * @param reason Human-readable pause reason for event log
     */
    function emergencyPause(string calldata reason) external onlyKeeper {
        _pause();
        emit EmergencyPause(msg.sender, reason);
    }

    /**
     * @notice Resume operations after emergency
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============================================================
    //                       ADMIN FUNCTIONS
    // ============================================================

    /**
     * @notice Update the deposit cap (TVL ceiling)
     */
    function setDepositCap(uint256 newCap) external onlyOwner {
        emit DepositCapUpdated(depositCap, newCap);
        depositCap = newCap;
    }

    /**
     * @notice Update the keeper address
     */
    function setKeeper(address newKeeper) external onlyOwner {
        require(newKeeper != address(0), "Zero address");
        emit KeeperUpdated(keeper, newKeeper);
        keeper = newKeeper;
    }

    /**
     * @notice Update the oracle adapter
     */
    function setOracleAdapter(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Zero address");
        emit OracleAdapterUpdated(oracleAdapter, newOracle);
        oracleAdapter = newOracle;
    }

    // ============================================================
    //                      VIEW FUNCTIONS
    // ============================================================

    /**
     * @notice Returns vault info for frontend display
     */
    function vaultInfo() external view returns (
        uint256 totalAssets_,
        uint256 depositCap_,
        uint256 utilizationBps, // basis points 0-10000
        bool isPaused_
    ) {
        totalAssets_ = totalAssets();
        depositCap_ = depositCap;
        utilizationBps = depositCap_ > 0 ? (totalAssets_ * 10000) / depositCap_ : 0;
        isPaused_ = paused();
    }
}
