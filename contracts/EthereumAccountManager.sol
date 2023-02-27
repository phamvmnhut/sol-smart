// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// version 1: call function

contract MyContract {
    address public otherContract;

    function setOtherContract(address _address) public {
        otherContract = _address;
    }

    function callOtherContract() public returns (uint) {
        // Call the "getNumber" function of the other contract and return the result
        (bool success, bytes memory result) = otherContract.call(
            abi.encodeWithSignature("getNumber()")
        );
        require(success, "Call failed");
        return abi.decode(result, (uint));
    }
}

contract OtherContract {
    uint public number;

    function setNumber(uint _number) public {
        number = _number;
    }

    function getNumber() public view returns (uint) {
        return number;
    }
}

// version v2: interface

interface IToken {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract MyContractV2 {
    address public tokenAddress;

    function setTokenAddress(address _tokenAddress) public {
        tokenAddress = _tokenAddress;
    }

    function transferToken(address _recipient, uint256 _amount) public {
        IToken(tokenAddress).transfer(_recipient, _amount);
    }

    function getTokenBalance(address _account) public view returns (uint256) {
        return IToken(tokenAddress).balanceOf(_account);
    }
}

contract Token is IToken {
    mapping(address => uint256) balances;

    function setBalance(uint256 amount) public returns (uint256) {
        balances[msg.sender] += amount;
        return balances[msg.sender];
    }

    function transfer(
        address _recipient,
        uint256 _amount
    ) public override returns (bool) {
        balances[msg.sender] -= _amount;
        balances[_recipient] += _amount;
        return true;
    }

    function balanceOf(
        address _account
    ) public view override returns (uint256) {
        return balances[_account];
    }
}

// version v2.1

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyContractV21 {
    address public erc20ContractAddress;
    IERC20 public erc20Contract;

    constructor(address _erc20ContractAddress) {
        erc20ContractAddress = _erc20ContractAddress;
        erc20Contract = IERC20(_erc20ContractAddress);
    }

    function transferERC20(address _recipient, uint _amount) public {
        // Transfer tokens from this contract to the recipient
        erc20Contract.transfer(_recipient, _amount);
    }

    function getERC20Balance() public view returns (uint) {
        // Get the balance of this contract's address in the ERC20 contract
        return erc20Contract.balanceOf(address(this));
    }
}

contract MyToken is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _totalSupply = _initialSupply;
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, _allowances[sender][msg.sender] - amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender] + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender] - subtractedValue);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "transfer from the zero address");
        require(recipient != address(0), "transfer to the zero address");
        require(_balances[sender] >= amount, "transfer amount exceeds balance");
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "approve from the zero address");
        require(spender != address(0), "approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}

// version 3
// Proxy contract
contract MyContractProxy {
    address private _implementation;

    constructor(address implementation) {
        _implementation = implementation;
    }

    fallback() external payable {
        address implementation = _implementation;
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(
                gas(),
                implementation,
                ptr,
                calldatasize(),
                0,
                0
            )
            let size := returndatasize()
            returndatacopy(ptr, 0, size)

            switch result
            case 0 {
                revert(ptr, size)
            }
            default {
                return(ptr, size)
            }
        }
    }
}

// Real contract
contract MyContractV3 {
    uint public myNumber;

    function setNumber(uint number) public {
        myNumber = number;
    }
}
