// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EthereumAccountManager {

    function add(uint256 x, uint256 y) public pure returns (uint256) {
        return x + y;
    }

    function sub(uint256 x, uint256 y) public pure returns (uint256) {
        return x - y;
    }

    function mul(uint256 x, uint256 y) public pure returns (uint256) {
        return x * y;
    }

    function div(uint256 x, uint256 y) public pure returns (uint256) {
        return x / y;
    }
}
