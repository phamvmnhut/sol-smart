import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { MyContract, OtherContract, MyContractV2, Token, MyContractV21, MyToken, MyContractV3, MyContractProxy } from '../typechain-types';
import { BigNumber, Contract, ContractTransaction } from 'ethers';
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const toWei = (num: number) => ethers.utils.parseEther(num.toString())
const fromWei = (num: BigNumber) => ethers.utils.formatEther(num);

describe('MyContractV1', function () {
  let myContract: Contract;
  let otherContract: Contract;
  let owner: SignerWithAddress;
  let otherContractOwner: SignerWithAddress;

  beforeEach(async function () {
    [owner, otherContractOwner] = await ethers.getSigners();

    const OtherContract = await ethers.getContractFactory("OtherContract");
    otherContract = await OtherContract.connect(otherContractOwner).deploy();

    const MyContract = await ethers.getContractFactory("MyContract");
    myContract = await MyContract.connect(owner).deploy();
    await myContract.setOtherContract(otherContract.address);
  });

  it("should call the getNumber function of the other contract and return the result", async function () {
    const valueToSet = 42;
    await otherContract.connect(otherContractOwner).setNumber(valueToSet);

    const tx = await myContract.callOtherContract();
    const receipt = await tx.wait();

    expect(receipt.status).to.equal(1);
    expect(receipt.logs.length).to.equal(0);

    const result = await myContract.callOtherContract();
    expect(result).to.equal(valueToSet);
  });

  it("should throw if the call to the other contract fails", async function () {
    await otherContract.connect(otherContractOwner).setNumber(42);

    // Remove the OtherContract address to make the call fail
    await myContract.setOtherContract("0x0000000000000000000000000000000000000000");

    await expect(myContract.callOtherContract()).to.be.revertedWith("Call failed");
  });

});

describe('MyContractV2', function () {
  let myContractV2: MyContractV2;
  let token: Token;
  let owner: SignerWithAddress;
  let recipient: SignerWithAddress;

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('Token');
    token = await Token.deploy();

    const MyContractV2 = await ethers.getContractFactory('MyContractV2');
    myContractV2 = await MyContractV2.deploy();

    await myContractV2.setTokenAddress(token.address);

    [owner, recipient] = await ethers.getSigners();

    // for testing
    await token.connect(owner).setBalance(100);
    await token.connect(recipient).setBalance(50);
  });

  it('should get balance from MyContractV2', async function () {
    expect(await myContractV2.getTokenBalance(owner.address)).to.equal(100);
    expect(await myContractV2.getTokenBalance(recipient.address)).to.equal(50);
  });

  it('should transfer token from one account to another by Token Contract', async function () {
    await token.connect(owner).transfer( recipient.address, 100);
    expect(await token.balanceOf( owner.address)).to.equal(100 - 100);
    expect(await token.balanceOf( recipient.address)).to.equal(50 + 100);
  });

  it('should transfer token from one account to another by MyContractV2 Contract', async function () {
    await myContractV2.connect(owner).transferToken( await recipient.getAddress(), 100);
    expect(await myContractV2.getTokenBalance( owner.address)).to.equal(100 - 100);
    expect(await myContractV2.getTokenBalance( recipient.address)).to.equal(50 + 100);
  });


});

describe("MyContractV2.1", function () {
  let myContract: MyContractV21;
  let erc20Contract: MyToken;
  let owner: SignerWithAddress;
  let recipient: SignerWithAddress;

  beforeEach(async function () {
    [owner, recipient] = await ethers.getSigners();

    // Deploy an instance of the ERC20 token contract
    const erc20ContractFactory = await ethers.getContractFactory("MyToken");
    erc20Contract = await erc20ContractFactory.deploy("BAC", "BAC", 18, 10500);

    // Deploy an instance of MyContractV3 and set the ERC20 contract address
    const myContractFactory = await ethers.getContractFactory("MyContractV21");
    myContract = await myContractFactory.deploy(erc20Contract.address);

    // Transfer some tokens to MyContractV3
    await erc20Contract.transfer(myContract.address, 1000);
  });

  it("should transfer tokens to recipient", async function () {
    // Transfer tokens from MyContractV3 to recipient
    await myContract.connect(owner).transferERC20(await recipient.getAddress(), 500);

    // Check the balances
    const ownerBalance = await erc20Contract.balanceOf(await owner.getAddress());
    const recipientBalance = await erc20Contract.balanceOf(await recipient.getAddress());
    const myContractBalance = await erc20Contract.balanceOf(myContract.address);

    expect(ownerBalance).to.equal(9500); // owner should have 9500 tokens left
    expect(recipientBalance).to.equal(500); // recipient should have 500 tokens
    expect(myContractBalance).to.equal(500); // MyContractV3 should have 500 tokens left
  });

  it("should return the balance of MyContractV3", async function () {
    // Get the balance of MyContractV3
    const balance = await myContract.getERC20Balance();

    // Check the balance
    expect(balance).to.equal(1000); // MyContractV3 should have 1000 tokens
  });
});

describe("MyContractProxy", function () {
  let myContractV3: MyContractV3;
  let myContractProxy : MyContractProxy;

  beforeEach(async function () {
    const MyContractV4Factory = await ethers.getContractFactory("MyContractV3");
    const MyContractProxyFactory = await ethers.getContractFactory("MyContractProxy");

    myContractV3 = await MyContractV4Factory.deploy();
    myContractProxy = await MyContractProxyFactory.deploy(myContractV3.address);
  });

  it("should set the number", async function () {
    const number = 42;

    await myContractProxy.setNumber(number);

    expect(await myContractV3.myNumber()).to.equal(number);
  });
});
