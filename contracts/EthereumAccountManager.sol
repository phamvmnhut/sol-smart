// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract EthereumAccountManager is AccessControl {
    // transfer from sender account to recipent account
    function transfer(address payable recipient) public payable {
        recipient.transfer(msg.value);
    }

    // Define roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    // Define events
    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);
    event UserAdded(address indexed account);
    event UserRemoved(address indexed account);

    // Constructor
    constructor() {
        // Assign roles to contract creator
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(USER_ROLE, msg.sender);
    }

    // Add admin role
    function addAdmin(address account) public onlyRole(ADMIN_ROLE) {
        _grantRole(ADMIN_ROLE, account);
        emit AdminAdded(account);
    }

    // Remove admin role
    function removeAdmin(address account) public onlyRole(ADMIN_ROLE) {
        _revokeRole(ADMIN_ROLE, account);
        emit AdminRemoved(account);
    }

    // Add user role
    function addUser(address account) public onlyRole(ADMIN_ROLE) {
        _grantRole(USER_ROLE, account);
        emit UserAdded(account);
    }

    // Remove user role
    function removeUser(address account) public onlyRole(ADMIN_ROLE) {
        _revokeRole(USER_ROLE, account);
        emit UserRemoved(account);
    }

    // Only allow admins to call this function
    function adminOnlyFunction()
        public
        view
        onlyRole(ADMIN_ROLE)
        returns (string memory)
    {
        return "Admin only function";
    }

    // Only allow users to call this function
    function userOnlyFunction()
        public
        view
        onlyRole(USER_ROLE)
        returns (string memory)
    {
        return "User only function";
    }

    function myFunction() public view onlyAdmin returns (string memory) {
        return "Admin only function";
    }

    // custom only Admin modifier
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Restricted to admins");
        _;
    }
}
