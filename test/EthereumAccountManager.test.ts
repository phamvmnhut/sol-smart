import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { EthereumAccountManager } from '../typechain-types';
import { BigNumber, ContractTransaction } from 'ethers';

const toWei = (num: number) => ethers.utils.parseEther(num.toString())
const fromWei = (num: BigNumber) => ethers.utils.formatEther(num);

describe('EthereumAccountManager', function () {
  let accountManager: EthereumAccountManager;

  beforeEach(async () => {
    const accountManagerFactory = await ethers.getContractFactory(
      "EthereumAccountManager"
    );
    accountManager = await accountManagerFactory.deploy();
    await accountManager.deployed();
  });

  describe("add", () => {
    it("should add two numbers correctly", async () => {
      const result = await accountManager.add(1, 2);
      expect(result).to.equal(3);
    });

    it("should revert when overflow happens", async () => {
      await expect(accountManager.add(ethers.constants.MaxUint256, 1)).to.be
        .reverted;
    });
  });

  describe("sub", () => {
    it("should subtract two numbers correctly", async () => {
      const result = await accountManager.sub(10, 2);
      expect(result).to.equal(8);
    });

    it("should revert when subtraction not allowed", async () => {
      await expect(accountManager.sub(2, 10)).to.be.revertedWith(
        "Sub not allow"
      );
    });
  });

  describe("divide", () => {
    it("should divide two numbers correctly", async () => {
      const result = await accountManager.divide(10, 2);
      expect(result).to.equal(5);
    });

    it("should revert when denominator is zero", async () => {
      await expect(accountManager.divide(10, 0)).to.be.revertedWith(
        "Denominator cannot be zero"
      );
    });
  });

});
