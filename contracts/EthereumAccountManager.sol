// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract EthereumAccountManager {
    struct Account {
        address owner;
        uint256 balance;
    }

    mapping(address => Account) accounts;

    event AccountRegistered(address indexed accountOwner, uint256 balance);
    event AccountLoggedIn(address indexed accountOwner);
    event AccountBalanceChanged(
        address indexed accountOwner,
        uint256 newBalance
    );

    function registerAccount() public {
        // check account is not exists
        // address(0) is an invalid in ETH blockchain
        require(
            accounts[msg.sender].owner == address(0),
            "Account already exists"
        );
        accounts[msg.sender] = Account(msg.sender, 10);
        // emit event
        emit AccountRegistered(msg.sender, 10);
    }

    function login() public {
        require(
            accounts[msg.sender].owner != address(0),
            "Account does not exist"
        );
        emit AccountLoggedIn(msg.sender);
    }

    function getAccountBalance() public view returns (uint256) {
        require(
            accounts[msg.sender].owner != address(0),
            "Account does not exist"
        );
        return accounts[msg.sender].balance;
    }

    function transfer(address recipient, uint256 amount) public {
        require(
            accounts[msg.sender].owner != address(0),
            "Account does not exist"
        );
        require(accounts[msg.sender].balance >= amount, "Insufficient balance");
        require(accounts[recipient].owner != address(0), "Invalid recipient address");

        accounts[msg.sender].balance -= amount;
        accounts[recipient].balance += amount;

        emit AccountBalanceChanged(msg.sender, accounts[msg.sender].balance);
        emit AccountBalanceChanged(recipient, accounts[recipient].balance);
    }
}
