import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { MyNFTV1, NFTMarketplace } from '../typechain-types';
import { BigNumber, Contract, ContractTransaction } from 'ethers';
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const toWei = (num: number) => ethers.utils.parseEther(num.toString())
const fromWei = (num: BigNumber) => ethers.utils.formatEther(num);

async function getEventData(tx: ContractTransaction, eventName: string) {
  const txRecipent = await tx.wait();
  if (txRecipent.events == undefined) return;
  const data = txRecipent.events.find(event => event.event === eventName);
  if (data == undefined) return;
  return data.args;
}

describe('MyNFT', function () {
  let myNFT: MyNFTV1;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();

    const MyNFT = await ethers.getContractFactory('MyNFTV1');
    myNFT = (await MyNFT.deploy()) as MyNFTV1;
    await myNFT.deployed();
  });

  it('should mint an NFT', async () => {
    const tokenMint = await myNFT.mint(await addr1.getAddress());
    const tokenIdRe = await tokenMint.wait();
    if (tokenIdRe.events != undefined) {
      if (tokenIdRe.events[1].args != undefined) {
        const tokenId = tokenIdRe.events[1].args.id;
        expect(tokenId).to.equal(1);
        expect(await myNFT.ownerOf(tokenId)).to.equal(await addr1.getAddress());
      }
    }
  });

});

describe('NFTMarketplace', () => {
  let accounts: SignerWithAddress[];
  let marketplace: NFTMarketplace;
  let originListingPrice: BigNumber = toWei(0.015);

  beforeEach(async () => {
    accounts = await ethers.getSigners();

    const NFTMarketplaceFactory = await ethers.getContractFactory('NFTMarketplace', accounts[0]);
    marketplace = await NFTMarketplaceFactory.deploy();
    await marketplace.deployed();
  });

  describe('Deployment', () => {
    it('should set the correct name and symbol', async () => {
      expect(await marketplace.name()).to.equal('Market NFT');
      expect(await marketplace.symbol()).to.equal('MYNFT');
    });
  });

  describe('createToken', () => {
    it('should create a new token with correct metadata', async () => {
      const tokenURI = 'https://example.com/ipfs/1';
      const price = toWei(1);

      const contractBalanceBefore = await ethers.provider.getBalance(marketplace.address);
      const userListBalanceBefore = await ethers.provider.getBalance(accounts[0].address);

      const gasPrice = await ethers.provider.getGasPrice();
      const tx = await marketplace.createToken(tokenURI, price, { value: originListingPrice });
      const txRecipent = await tx.wait();

      const contractBalanceAfter = await ethers.provider.getBalance(marketplace.address);
      const userListBalanceAfter = await ethers.provider.getBalance(accounts[0].address);

      expect(txRecipent.events).to.not.be.undefined;
      if (txRecipent.events != undefined) {
        const data = txRecipent.events.find(event => event.event === "MarketItemCreated");
        expect(data).to.not.be.undefined;
        if (data != undefined && data.args != undefined) {
          const tokenId: BigNumber = data.args.tokenId;

          expect(await marketplace.ownerOf(tokenId)).to.equal(marketplace.address);
          expect(await marketplace.getApproved(tokenId)).to.equal(ethers.constants.AddressZero);

          const marketItem = await marketplace.getMarketItem(tokenId);
          expect(marketItem.seller).to.equal(accounts[0].address);
          expect(marketItem.owner).to.equal(marketplace.address);
          expect(marketItem.price).to.equal(price);
          expect(marketItem.sold).to.equal(false);

          expect(contractBalanceAfter).to.be.equal(contractBalanceBefore.add(originListingPrice));
          expect(userListBalanceAfter).to.be.equal(userListBalanceBefore.sub(originListingPrice).sub(txRecipent.gasUsed.mul(gasPrice)))
        }
      }
    });

    it('should create a new token in listed and market', async () => {
      const tokenURI = 'https://example.com/ipfs/1';
      const price = toWei(1);

      const tx = await marketplace.createToken(tokenURI, price, { value: originListingPrice });
      const event = await getEventData(tx, "MarketItemCreated");
      if (event == undefined) return;

      const tokenId: BigNumber = event.tokenId;
      const listedItem = await marketplace.fetchItemsListed();
      expect(listedItem.length).to.be.equal(1);
      expect(listedItem[0].tokenId).to.be.equal(tokenId);

      const marketItem = await marketplace.fetchMarketItems();
      expect(marketItem.length).to.be.equal(1);
      expect(marketItem[0].tokenId).to.be.equal(tokenId);
    });
  });

  describe('createMarketSale', () => {
    it('should create a new market sale', async () => {
      const tokenURI = 'https://example.com/ipfs/1';
      const price = toWei(1);
      const userOwner = accounts[0];
      const userSell = accounts[1];
      const tx = await marketplace.connect(userSell).createToken(tokenURI, price, { value: originListingPrice });
      const event = await getEventData(tx, "MarketItemCreated");
      if (event == undefined) return;

      const tokenId: BigNumber = event.tokenId;

      const userBuy = accounts[2];

      let myNFTList = await marketplace.connect(userBuy).fetchMyNFT();
      expect(myNFTList.length).to.be.equal(0);

      const userSellBalanceBefore = await ethers.provider.getBalance(userSell.address);
      const userBuyBalanceBefore = await ethers.provider.getBalance(userBuy.address);
      const contractBalanceBefore = await ethers.provider.getBalance(marketplace.address);
      const userOwnerBalanceBefore = await ethers.provider.getBalance(userOwner.address);

      const gasPrice = await ethers.provider.getGasPrice();
      const createMarketSaleTx = await marketplace.connect(userBuy).createMarketSale(tokenId, { value: price });
      const createMarketSaleReceipt = await createMarketSaleTx.wait();

      const userSellBalanceAfter = await ethers.provider.getBalance(userSell.address);
      const userBuyBalanceAfter = await ethers.provider.getBalance(userBuy.address);
      const contractBalanceAfter = await ethers.provider.getBalance(marketplace.address);
      const userOwnerBalanceAfter = await ethers.provider.getBalance(userOwner.address);

      expect(userOwnerBalanceAfter).to.be.equal(userOwnerBalanceBefore.add(originListingPrice));
      expect(userSellBalanceAfter).to.be.equal(userSellBalanceBefore.add(price));
      expect(userBuyBalanceAfter).to.be.equal(userBuyBalanceBefore.sub(price).sub(gasPrice.mul(createMarketSaleReceipt.gasUsed)));
      expect(contractBalanceAfter).to.be.equal(contractBalanceBefore.sub(originListingPrice));

      myNFTList = await marketplace.connect(userBuy).fetchMyNFT();
      expect(myNFTList.length).to.be.equal(1);
      const myNFT = myNFTList[0];
      expect(myNFT.tokenId).to.be.equal(tokenId);
      expect(myNFT.owner).to.be.equal(userBuy.address);
      expect(myNFT.sold).to.be.equal(true);
      expect(myNFT.seller).to.be.equal(ethers.constants.AddressZero);
    });
  });

  describe('reSellToken', () => {
    it('should create a re-sale', async () => {
      const tokenURI = 'https://example.com/ipfs/1';
      const price = toWei(1);
      const userSell = accounts[1];
      const tx = await marketplace.connect(userSell).createToken(tokenURI, price, { value: originListingPrice });
      const event = await getEventData(tx, "MarketItemCreated");
      if (event == undefined) return;

      const tokenId: BigNumber = event.tokenId;

      const userBuy = accounts[2];

      const createMarketSaleTx = await marketplace.connect(userBuy).createMarketSale(tokenId, { value: price });
      await createMarketSaleTx.wait();

      const myNFTList = await marketplace.connect(userBuy).fetchMyNFT();
      const myNFT = myNFTList[0];

      const userBuyBalanceBefore = await ethers.provider.getBalance(userBuy.address);
      const contractBalanceBefore = await ethers.provider.getBalance(marketplace.address);

      const newPrice = toWei(2);

      const gasPrice = await ethers.provider.getGasPrice();
      const reSaleTx = await marketplace.connect(userBuy).reSellToken(myNFT.tokenId, newPrice, { value: originListingPrice });
      const reSaleReceipt = await reSaleTx.wait();

      const userBuyBalanceAfter = await ethers.provider.getBalance(userBuy.address);
      const contractBalanceAfter = await ethers.provider.getBalance(marketplace.address);

      const marketItem = await marketplace.getMarketItem(tokenId);
      expect(marketItem.seller).to.equal(userBuy.address);
      expect(marketItem.owner).to.equal(marketplace.address);
      expect(marketItem.price).to.equal(newPrice);
      expect(marketItem.sold).to.equal(false);

      expect(userBuyBalanceAfter).to.be.equal(userBuyBalanceBefore.sub(originListingPrice).sub(gasPrice.mul(reSaleReceipt.gasUsed)));
      expect(contractBalanceAfter).to.be.equal(contractBalanceBefore.add(originListingPrice));
    });
  });

  describe('fetchMarketItems', () => {
    it('should get list market item', async () => {
      const tokenURI = 'https://example.com/ipfs/1';
      const price = toWei(1);
      const userSell = accounts[1];

      let marketItemList = await marketplace.fetchMarketItems();
      expect(marketItemList.length).to.be.equal(0);

      const tx = await marketplace.connect(userSell).createToken(tokenURI, price, { value: originListingPrice });
      const event = await getEventData(tx, "MarketItemCreated");
      if (event == undefined) return;
      const tokenId: BigNumber = event.tokenId;

      marketItemList = await marketplace.fetchMarketItems();
      expect(marketItemList.length).to.be.equal(1);

      const userBuy = accounts[2];

      const createMarketSaleTx = await marketplace.connect(userBuy).createMarketSale(tokenId, { value: price });
      await createMarketSaleTx.wait();

      marketItemList = await marketplace.fetchMarketItems();
      expect(marketItemList.length).to.be.equal(0);

      const newPrice = toWei(2);

      const reSaleTx = await marketplace.connect(userBuy).reSellToken(tokenId, newPrice, { value: originListingPrice });
      await reSaleTx.wait();

      marketItemList = await marketplace.fetchMarketItems();
      expect(marketItemList.length).to.be.equal(1);
    });
  });

  describe('updateListingPrice', () => {
    it('should owner update listing price', async () => {
      const userOwner = accounts[0];

      const oldListingPrice = await marketplace.getListingPrice();
      expect(oldListingPrice).to.be.equal(originListingPrice);

      const newListingPrice = toWei(0.025);
      await marketplace.connect(userOwner).updateListingPrice(newListingPrice);

      expect(await marketplace.getListingPrice()).to.be.equal(newListingPrice);
    });

    it('should not update listing price by another user', async () => {
      const userAnother = accounts[1];

      const newListingPrice = toWei(0.025);
      await expect(
         marketplace.connect(userAnother).updateListingPrice(newListingPrice)
      ).to.be.revertedWith("only owner of marketplace can change listing price");
    });
  });
});
