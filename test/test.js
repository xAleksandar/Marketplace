const { expect } = require("chai");

describe("NFT", function () {

    let NFT;
    let NFTAddress;
    let NFTContract;

    before(async () => {
        NFTContract = await ethers.getContractFactory("NFT");
        NFT = await NFTContract.deploy();
        await NFT.deployed();
        NFTAddress = NFT.address;
    })

    it("Should not allow minting before initialization", async function () {
        const [_, address2, address3, address4] = await ethers.getSigners();
        await expect(NFT.mint("Test Token Uri", _.address)).to.be.revertedWith('You are not the owner of this collection or contract is not initialized.');
    })

    it("Should be initializable", async function () {
        const [_, address2, address3, address4] = await ethers.getSigners();
        const initialize = await NFT.initialize("Test Token", "TT", _.address);
    })

    it("Should be able to mint new nfts ", async function () {
        const [_, address2, address3, address4] = await ethers.getSigners();
        const transaction = await NFT.mint("Test Token Uri", _.address);
    })

    it("Should allow only the owner create nfts ", async function () {
        const [_, address2, address3, address4] = await ethers.getSigners();
        await expect(NFT.connect(address2).mint("Test Token Uri", address2.address)).to.be.revertedWith('You are not the owner of this collection or contract is not initialized.');
    })

    it("Should count the existing nfts", async function () {
        expect(await NFT.tokenCount()).to.equal(1);
    })
})



describe("NFT Factory", function () {

    let NFTFactory;
    let NFTFactoryAddress;
    let NFTFactoryContract;

    before(async () => {
        NFTFactoryContract = await ethers.getContractFactory("NFTFactory");
        NFTFactory = await NFTFactoryContract.deploy();
        await NFTFactory.deployed();
        NFTFactoryAddress = NFTFactory.address;
    })

    it("Should create new collections", async function () {
        const [_, address2, address3, address4] = await ethers.getSigners();
        const transaction = await NFTFactory.createNFTContract("Test Collection", "TC", _.address)
    })
})


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
        Marketplace = await MarketplaceContract.deploy();
        await Marketplace.deployed();
        MarketplaceAddress = Marketplace.address;

    });
    
    it("Should track collections length", async function () {
        expect(await Marketplace.returnCollectionsLength()).to.equal(0);
    });

    it("Should mint new collections", async function () {
        const name = "Victoria";
        const ticker = "VIKI";
        const imageLink = "https://www.test.com/image"
        const info = "Some collection info"
        const collection = await Marketplace.createCollection(name, ticker, imageLink, info);
        await collection.wait();
        expect(await Marketplace.returnCollectionsLength()).to.equal(1);
    });
    
    it("Should mint new NFTs", async function () {
        const nft = await Marketplace.mintNFT(0, "path");
        await nft.wait();
        
        const secondnft = await Marketplace.mintNFT(0, "Path");
        await secondnft.wait();
        
        expect(await Marketplace.returnItemsLength()).to.equal(2);
    });

    it("Should be able to bid on item", async function () {
    	const [_, address2, address3, address4] = await ethers.getSigners();
    	const placebid = await Marketplace.connect(address2).bidOnNFT(2, { value: 10 });
    	const marketItem = await Marketplace.items(2);
    	expect(marketItem.bidPrice).to.equal(10)
    	
    	const contractBalance = (await Marketplace.getBalance()).toString();
    	expect(contractBalance).to.equal('10')
    });
    
    it("Should be able to accept bid", async function () {
    	const [_, address2, address3, address4] = await ethers.getSigners();
    	const marketItem = await Marketplace.items(2);

        const NFTContract = await hre.ethers.getContractAt("NFT", marketItem.nft);
        await NFTContract.approve(MarketplaceAddress, marketItem.tokenId);
   	const acceptBid = await Marketplace.acceptBid(2);
   	
   	const newMarketItem = await Marketplace.items(2);
   	const newNFTContract = await hre.ethers.getContractAt("NFT", marketItem.nft);
    	expect(await newNFTContract.ownerOf(newMarketItem.tokenId)).to.equal(address2.address);
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
