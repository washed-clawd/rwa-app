// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {RWAVault} from "../src/RWAVault.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockOracleAdapter} from "./mocks/MockOracleAdapter.sol";

/**
 * @title RWAVaultTest
 * @notice Tests for the RWAVault ERC-4626 contract
 */
contract RWAVaultTest is Test {
    RWAVault vault;
    MockERC20 xStock;
    MockOracleAdapter oracle;

    address owner = address(this);
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address keeper = makeAddr("keeper");

    uint256 constant DEPOSIT_CAP = 1_000_000e18; // 1M tokens
    uint256 constant INITIAL_BALANCE = 10_000e18;

    function setUp() public {
        // Deploy mock xStock token
        xStock = new MockERC20("xNVDA Mock", "xNVDA", 18);
        oracle = new MockOracleAdapter();

        // Deploy vault
        vault = new RWAVault(
            address(xStock),
            "RWA Vault xNVDA",
            "rvxNVDA",
            "NVDA",
            DEPOSIT_CAP,
            keeper,
            address(oracle)
        );

        // Fund test users
        xStock.mint(alice, INITIAL_BALANCE);
        xStock.mint(bob, INITIAL_BALANCE);
    }

    // ─── Deposit Tests ──────────────────────────────────────────

    function test_DepositBasic() public {
        uint256 depositAmount = 100e18;

        vm.startPrank(alice);
        xStock.approve(address(vault), depositAmount);
        uint256 shares = vault.deposit(depositAmount, alice);
        vm.stopPrank();

        assertEq(vault.balanceOf(alice), shares);
        assertEq(vault.totalAssets(), depositAmount);
        assertEq(xStock.balanceOf(address(vault)), depositAmount);
    }

    function test_DepositRevertsOnZero() public {
        vm.startPrank(alice);
        xStock.approve(address(vault), 100e18);
        vm.expectRevert(RWAVault.ZeroAssets.selector);
        vault.deposit(0, alice);
        vm.stopPrank();
    }

    function test_DepositRevertsExceedsCap() public {
        uint256 overCap = DEPOSIT_CAP + 1;
        xStock.mint(alice, overCap);

        vm.startPrank(alice);
        xStock.approve(address(vault), overCap);
        vm.expectRevert(RWAVault.ExceedsDepositCap.selector);
        vault.deposit(overCap, alice);
        vm.stopPrank();
    }

    // ─── Withdraw Tests ─────────────────────────────────────────

    function test_WithdrawBasic() public {
        uint256 depositAmount = 100e18;

        vm.startPrank(alice);
        xStock.approve(address(vault), depositAmount);
        vault.deposit(depositAmount, alice);

        uint256 balanceBefore = xStock.balanceOf(alice);
        vault.withdraw(depositAmount, alice, alice);
        vm.stopPrank();

        assertEq(xStock.balanceOf(alice), balanceBefore + depositAmount);
        assertEq(vault.totalAssets(), 0);
    }

    function test_WithdrawRevertsOnZero() public {
        vm.prank(alice);
        vm.expectRevert(RWAVault.ZeroAssets.selector);
        vault.withdraw(0, alice, alice);
    }

    // ─── Pause Tests ─────────────────────────────────────────────

    function test_PauseBlocksDeposit() public {
        vm.prank(keeper);
        vault.emergencyPause("Test pause");

        vm.startPrank(alice);
        xStock.approve(address(vault), 100e18);
        vm.expectRevert(); // Pausable: paused
        vault.deposit(100e18, alice);
        vm.stopPrank();
    }

    function test_OnlyKeeperCanPause() public {
        vm.prank(alice);
        vm.expectRevert(RWAVault.UnauthorizedKeeper.selector);
        vault.emergencyPause("Unauthorized");
    }

    function test_UnpauseResumesDeposit() public {
        vm.prank(keeper);
        vault.emergencyPause("Test");

        vm.prank(owner);
        vault.unpause();

        vm.startPrank(alice);
        xStock.approve(address(vault), 100e18);
        uint256 shares = vault.deposit(100e18, alice);
        vm.stopPrank();

        assertGt(shares, 0);
    }

    // ─── Admin Tests ──────────────────────────────────────────────

    function test_SetDepositCap() public {
        uint256 newCap = 2_000_000e18;
        vault.setDepositCap(newCap);
        assertEq(vault.depositCap(), newCap);
    }

    function test_SetKeeperUpdates() public {
        address newKeeper = makeAddr("newKeeper");
        vault.setKeeper(newKeeper);
        assertEq(vault.keeper(), newKeeper);
    }

    function test_VaultInfoView() public {
        vm.startPrank(alice);
        xStock.approve(address(vault), 100e18);
        vault.deposit(100e18, alice);
        vm.stopPrank();

        (uint256 assets, uint256 cap, uint256 utilBps, bool isPaused) = vault.vaultInfo();

        assertEq(assets, 100e18);
        assertEq(cap, DEPOSIT_CAP);
        assertEq(utilBps, 1); // 100e18 / 1_000_000e18 * 10000 rounds down to 1 bps
        assertFalse(isPaused);
    }

    // ─── Fuzz Tests ───────────────────────────────────────────────

    function testFuzz_DepositWithdraw(uint256 amount) public {
        amount = bound(amount, 1e18, 100_000e18);

        xStock.mint(alice, amount);

        vm.startPrank(alice);
        xStock.approve(address(vault), amount);
        uint256 shares = vault.deposit(amount, alice);
        uint256 withdrawn = vault.redeem(shares, alice, alice);
        vm.stopPrank();

        // Allow for 1 wei rounding
        assertApproxEqAbs(withdrawn, amount, 1);
    }
}
