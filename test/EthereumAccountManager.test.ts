import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { EthereumAccountManager } from '../typechain-types';
import { BigNumber, ContractTransaction } from 'ethers';

const toWei = (num: number) => ethers.utils.parseEther(num.toString())
const fromWei = (num: BigNumber) => ethers.utils.formatEther(num);

describe('EthereumAccountManager', function () {
  let safeMathTest: EthereumAccountManager;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const EthereumAccountManagerFactory = await ethers.getContractFactory('EthereumAccountManager', owner);
    safeMathTest = (await EthereumAccountManagerFactory.deploy()) as EthereumAccountManager;
  });

  describe('add', () => {
    it('adds two numbers', async () => {
      const result = await safeMathTest.add(5, 7);
      expect(result).to.eq(12);
    });

    it('throws an error when result overflows', async () => {
      const maxUint256 = BigNumber.from('2').pow(256).sub(2);
      const result = safeMathTest.add(maxUint256, 3);
      await expect(result).to.be.revertedWithPanic("0x11");
    });
  });

  describe('sub', () => {
    it('subtracts two numbers', async () => {
      const result = await safeMathTest.sub(10, 3);
      expect(result).to.eq(7);
    });

    it('throws an error when result underflows', async () => {
      const result = safeMathTest.sub(5, 7);
      await expect(result).to.be.revertedWithPanic("0x11");
    });
  });

  describe('mul', () => {
    it('multiplies two numbers', async () => {
      const result = await safeMathTest.mul(2, 5);
      expect(result).to.eq(10);
    });

    it('throws an error when result overflows', async () => {
      const maxUint256 = BigNumber.from('2').pow(256).sub(1);
      const result = safeMathTest.mul(maxUint256, 2);
      await expect(result).to.be.revertedWithPanic("0x11");
    });
  });

  describe('div', () => {
    it('divides two numbers', async () => {
      const result = await safeMathTest.div(10, 2);
      expect(result).to.eq(5);
    });

    it('throws an error when dividing by zero', async () => {
      const result = safeMathTest.div(5, 0);
      await expect(result).to.be.revertedWithPanic("0x12");
    });
  });

});
