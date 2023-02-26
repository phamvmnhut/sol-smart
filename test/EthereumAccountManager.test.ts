import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { EthereumAccountManager } from '../typechain-types';
import { BigNumber, ContractTransaction } from 'ethers';

const toWei = (num: number) => ethers.utils.parseEther(num.toString())
const fromWei = (num: BigNumber) => ethers.utils.formatEther(num);

describe('EthereumAccountManager', function () {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let accountManager: EthereumAccountManager;

  beforeEach(async function () {
    const accountManagerFactory = await ethers.getContractFactory('EthereumAccountManager');
    [owner, user1, user2] = await ethers.getSigners();
    accountManager = (await accountManagerFactory.connect(owner).deploy()) as EthereumAccountManager;
    await accountManager.deployed();
  });

  // describe("Account", () => {
  //   it("Should transfer ether to recipient", async function () {
  //     const value = toWei(1);
  //     const gasPrice = await ethers.provider.getGasPrice();

  //     // Check user1 balance before transfer
  //     const user1BalanceBefore = await user1.getBalance();
  //     const user2BalanceBefore = await user2.getBalance();

  //     // Transfer ether
  //     const tx = await accountManager.connect(user1).transfer(user2.address, {
  //       value,
  //     });
  //     const receipt = await tx.wait();

  //     // Check user2 balance after transfer
  //     const user2Balance = await ethers.provider.getBalance(user2.address);
  //     expect(user2Balance).to.equal(user2BalanceBefore.add(value));

  //     // Check user1 balance after transfer
  //     const user1BalanceAfter = await user1.getBalance();
  //     const expectedOwnerBalance = user1BalanceBefore.sub(value).sub(gasPrice.mul(receipt.gasUsed));
  //     expect(user1BalanceAfter).to.equal(expectedOwnerBalance);
  //   });
  // });

  describe("Role", function () {

    let addAdminTx : ContractTransaction;

    beforeEach(async function() {
      addAdminTx = await accountManager.connect(owner).addAdmin(user1.address);
    });

    it("should owner has two role", async function () {
      expect(await accountManager.hasRole(accountManager.ADMIN_ROLE(), owner.address)).to.equal(true);
      expect(await accountManager.hasRole(accountManager.USER_ROLE(), owner.address)).to.equal(true);
    });

    it("should add an admin", async function () {
      expect(await accountManager.hasRole(accountManager.ADMIN_ROLE(), owner.address)).to.equal(true);
      expect(await accountManager.hasRole(accountManager.ADMIN_ROLE(), user1.address)).to.equal(true);
    });

    it("should emit a role granted event", async function () {
      let addAdminTx = await accountManager.connect(owner).addAdmin(user1.address);
      // Kiểm tra sự kiện RoleGranted đã được phát ra hay chưa
      await expect(addAdminTx)
        .to.emit(accountManager, "AdminAdded")
        .withArgs(user1.address);
    });

    it("should revert if non-admin tries to add admin", async function () {
      // Thử thêm addr2 vào role ADMIN_ROLE với một địa chỉ khác không có quyền ADMIN_ROLE
      await expect(accountManager.connect(user2).addAdmin(user2.address))
        .to.be.reverted;
    });
  });

});
