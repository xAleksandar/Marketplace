const { expect } = require("chai");

describe("Marketplace", function () {   
    
    let Marketplace;
    let NarketplaceAddress;
    let MarketplaceContract;

    let NFTFactoryContract;
    let NFTFactoryAddress;
    let NFTFactory;

    before(async () => {

        NFTFactoryContract = await ethers.getContractFactory("NFTFactory");
        NFTFactory = await NFTFactoryContract.deploy();
        await NFTFactory.deployed();
        NFTFactoryAddress = NFTFactory.address;

        MarketplaceContract = await ethers.getContractFactory("Marketplace");
        Marketplace = await MarketplaceContract.deploy(NFTFactoryAddress);
        await Marketplace.deployed();
        MarketplaceAddress = Marketplace.address;

    });
    
    it("Should track collections length", async function () {
        expect(await Marketplace.lengthCollections()).to.equal(0);
    });

    it("Should mint new collections", async function () {
        const name = "Victoria";
        const ticker = "VIKI";
        const collection = await Marketplace.createCollection(name, ticker);
        await collection.wait();
        expect(await Marketplace.lengthCollections()).to.equal(1);
    });

    it("Should mint new NFTs", async function () {
        const nft = await Marketplace.mintNFT(0, "path");
        await nft.wait();
        expect(await Marketplace.lengthItems()).to.equal(1);
    });

    it("Should put NFT for sale", async function () {
        const sellNFT = await Marketplace.sellNFT(1, 20);
        const marketItem = await Marketplace.items(1);

        const NFTContract = await hre.ethers.getContractAt("NFT", marketItem.nft);
        await NFTContract.approve(MarketplaceAddress, marketItem.tokenId);

        expect(await NFTContract.getApproved(1)).to.equal(MarketplaceAddress);
        expect(marketItem.forSell).to.equal(true);
    });

    it("Should cancel NFT sell", async function () {
        await Marketplace.cancelSell(1);
        const marketItem = await Marketplace.items(1);

        const NFTContract = await hre.ethers.getContractAt("NFT", marketItem.nft);
        await NFTContract.approve(marketItem.nft, marketItem.tokenId);

        expect(await NFTContract.getApproved(1)).to.equal(marketItem.nft);
        expect(marketItem.forSell).to.equal(false);
    });

    it("Should transfer NFT to buyer's address", async function () {
        const sellNFT = await Marketplace.sellNFT(1, 20);
        const marketItem = await Marketplace.items(1);

        const NFTContract = await hre.ethers.getContractAt("NFT", marketItem.nft);
        await NFTContract.approve(MarketplaceAddress, marketItem.tokenId);

        const [_, address2, address3, address4] = await ethers.getSigners();
        await Marketplace.connect(address2).buyNFT(1, { value: marketItem.price});

        const newMarketItem = await Marketplace.items(1);
        expect(newMarketItem.forSell).to.equal(false);
        expect(await NFTContract.ownerOf(1)).to.equal(address2.address);
    });


});