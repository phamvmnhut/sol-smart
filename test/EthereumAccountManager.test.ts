import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { EthereumAccountManager as AccountManager } from '../typechain-types';

describe('EthereumAccountManager', function () {
  let accountManager: AccountManager;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const accountManagerFactory = await ethers.getContractFactory('EthereumAccountManager', owner);
    accountManager = (await accountManagerFactory.deploy()) as AccountManager;
    // await accountManager.deployed();
  });

  describe("Account", () => {
    it("should allow to register an account", async () => {

      await expect(
        accountManager.connect(owner).login()
      ).to.be.rejectedWith("Account does not exist");

      await expect(
        accountManager.connect(user1).getAccountBalance()
      ).to.be.revertedWith("Account does not exist");

      // Register account
      await accountManager.connect(owner).registerAccount();

      // Check account balance
      const balance = await accountManager.connect(owner).getAccountBalance();
      expect(balance).to.equal(10);

      await expect(
        accountManager.connect(owner).login()
      ).not.to.be.reverted;

      // Check account repeat register
      await expect(accountManager.connect(owner).registerAccount()
      ).to.be.rejectedWith("Account already exists");
    });
  });

  describe("Tranfer", () => {
    it("should tranfer to another account", async () => {
      await accountManager.connect(user1).registerAccount();
      await accountManager.connect(user2).registerAccount();

      await (await accountManager.connect(user1).transfer(user2.address, 2)).wait();

      const user1Balance = await accountManager.connect(user1).getAccountBalance();
      const user2Balance = await accountManager.connect(user2).getAccountBalance();

      expect(user1Balance).to.equal(10 - 2);
      expect(user2Balance).to.equal(10 + 2);
    });

    it("not should tranfer to account not exist", async () => {
      await accountManager.connect(user1).registerAccount();
      await expect(
        accountManager.connect(user1).transfer(user2.address, 2)
      ).to.be.rejectedWith("Invalid recipient address");
    });

    it("balance not enough", async () => {
      await accountManager.connect(user1).registerAccount();
      await expect(
        accountManager.connect(user1).transfer(user2.address, 10 + 2)
      ).to.be.rejectedWith("Insufficient balance");
    });
  });

  describe("Events", function () {
    it("should emit event Register", async function () {
      await expect(
        accountManager.connect(user1).registerAccount()
      ).to.emit(accountManager, "AccountRegistered").withArgs(anyValue, 10);
    });

    it("should emit Login event", async function () {
      await accountManager.connect(user1).registerAccount();
      await expect(
        accountManager.connect(user1).login()
      ).to.emit(accountManager, "AccountLoggedIn").withArgs(user1.address);
    });

    it("should emit event AccountBalanceChanged", async function() {
      await accountManager.connect(user1).registerAccount();
      await accountManager.connect(user2).registerAccount();
      const tx = await accountManager.connect(user1).transfer(user2.address, 2);
      const receipt = await tx.wait();
      const events = receipt.events;
      if (events !== undefined) {
        expect(events.length).to.equal(2);
        expect(events[0].event).to.equal("AccountBalanceChanged");
        expect(events[0].args?.accountOwner).to.equal(user1.address);
        expect(events[0].args?.newBalance).to.equal(10 - 2);
      }
    });
  })

});

describe('Another', function () {
  // it("should return the correct block timestamp", async function () {
  //   const currentBlockNumber = await ethers.provider.getBlockNumber();
  //   const currentBlock = await ethers.provider.getBlock(currentBlockNumber);
  //   const currentTimestamp = currentBlock.timestamp;

  //   expect(currentTimestamp).to.be.closeTo(Math.floor(Date.now() / 1000), 20);
  // });

  it("should receive ETH when sent from another account", async function () {
    const [user1, user2] = await ethers.getSigners();
    const initialBalance = await ethers.provider.getBalance(user1.address);
    const gasPrice = await ethers.provider.getGasPrice();
  
    const tx = await user2.sendTransaction({
      to: user1.address,
      value: ethers.utils.parseEther("1.0"),
      gasPrice: gasPrice,
    });
  
    const receipt = await tx.wait();
  
    const finalBalance = await ethers.provider.getBalance(user1.address);
    const expectedBalance = initialBalance.add(ethers.utils.parseEther("1.0"));
  
    expect(finalBalance).to.equal(expectedBalance);
  });

})  