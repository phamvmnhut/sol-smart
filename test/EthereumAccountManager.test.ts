import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { EthereumAccountManager } from '../typechain-types';

describe('EthereumAccountManager', function () {
  let teacher: SignerWithAddress;
  let student: SignerWithAddress;
  let anotherStudent: SignerWithAddress;
  let tuitionContract: EthereumAccountManager;

  const tuitionAmount = ethers.utils.parseEther("1");
  const studentPaymentAmount = ethers.utils.parseEther("0.5");

  beforeEach(async function () {
    [teacher, student, anotherStudent] = await ethers.getSigners();

    const TuitionContract = await ethers.getContractFactory("EthereumAccountManager");
    tuitionContract = await TuitionContract.connect(teacher).deploy(teacher.address, student.address, tuitionAmount);
    await tuitionContract.deployed();
  });

  it("should allow the student to pay the tuition multiple times and teacher withdraw", async function () {
    const payment1 = ethers.utils.parseEther("0.5");
    const payment2 = ethers.utils.parseEther("0.3");
    const payment3 = ethers.utils.parseEther("0.2");

    const teacherBalanceBefore = await teacher.getBalance();

    await tuitionContract.connect(student).payTuition({ value: payment1 });
    expect(await tuitionContract.totalPaid()).to.equal(payment1);

    await tuitionContract.connect(student).payTuition({ value: payment2 });
    expect(await tuitionContract.totalPaid()).to.equal(payment1.add(payment2));

    await tuitionContract.connect(student).payTuition({ value: payment3 });
    expect(await tuitionContract.totalPaid()).to.equal(tuitionAmount);

    await tuitionContract.connect(teacher).withdrawFunds();

    const teacherBalanceAfter = await teacher.getBalance();
    expect(teacherBalanceAfter).to.be.gt(teacherBalanceBefore);
  });

  it("should not allow the teacher to withdraw the tuition if tuition not full", async function () {
    await tuitionContract.connect(student).payTuition({ value: studentPaymentAmount });
    
    await expect( tuitionContract.connect(teacher).withdrawFunds()).to.be.rejectedWith("The tuition has not been paid in full yet.")
  });

  it("should allow the teacher to withdraw the tuition", async function () {
    const teacherBalanceBefore = await teacher.getBalance();
    await tuitionContract.connect(student).payTuition({ value: tuitionAmount });
    
    await tuitionContract.connect(teacher).withdrawFunds();

    const teacherBalanceAfter = await teacher.getBalance();
    expect(teacherBalanceAfter).to.be.gt(teacherBalanceBefore);
  });

  it("should revert if non-student account tries to pay the tuition", async function () {
    await expect(
      tuitionContract.connect(anotherStudent).payTuition({ value: tuitionAmount })
    ).to.be.revertedWith("Only the student can pay the tuition.");
  });

  it("should revert if the payment amount is zero", async function () {
    await expect(
      tuitionContract.connect(student).payTuition({ value: 0 })
    ).to.be.revertedWith("The payment amount must be greater than 0.");
  });

  it("should revert if the tuition has already been paid in full", async function () {
    await tuitionContract.connect(student).payTuition({ value: tuitionAmount });
    await expect(
      tuitionContract.connect(student).payTuition({ value: tuitionAmount })
    ).to.be.revertedWith("The tuition has already been paid in full.");
  });
});
