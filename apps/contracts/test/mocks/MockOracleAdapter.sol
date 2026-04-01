// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Mock oracle for testing — returns a fixed price
contract MockOracleAdapter {
    uint256 public mockPrice = 900e24; // $900 in Morpho scale (10^24)

    function price() external view returns (uint256) {
        return mockPrice;
    }

    function setPrice(uint256 newPrice) external {
        mockPrice = newPrice;
    }
}
