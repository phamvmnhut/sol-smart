// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EthereumAccountManager {
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }

    function sub(uint256 a, uint256 b) public pure returns (uint256) {
        if (a <= b) {
            revert("Sub not allow");
        }
        return a - b;
    }

    function divide(
        uint256 _numerator,
        uint256 _denominator
    ) public pure returns (uint256) {
        require(_denominator != 0, "Denominator cannot be zero");
        return _numerator / _denominator;
    }
}
