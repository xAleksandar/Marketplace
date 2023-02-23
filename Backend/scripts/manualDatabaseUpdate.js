const ethers = require("ethers");
const nftABI = require("../contractsData/NFT.json");
const marketplaceABI = require("../contractsData/Marketplace.json");
const marketplaceAddress = require("../contractsData/Marketplace-address.json");

const mongo = require("../components/mongoDB");

require("dotenv").config();

async function main() {
    const provider = new ethers.providers.WebSocketProvider(process.env.ALCHEMY_WSS_URL);
    const marketplace = new ethers.Contract(marketplaceAddress.address, marketplaceABI.abi, provider);
    const itemsCount = parseInt((await marketplace.returnItemsLength()).toString());

    for (let i = 1; i < itemsCount + 1; i++) {
        await new Promise(r => setTimeout(r, 2000));
        let item = await marketplace.items(i);
        let NFTcontract = new ethers.Contract(item.nft, nftABI.abi, provider)
        let nftName = (await NFTcontract.name()) + " #" + item.tokenId.toString()
        let uri = await NFTcontract.tokenURI(item.tokenId.toString())
        let _owner = await NFTcontract.ownerOf(item.tokenId.toString());
        let _isMarketplaceApproved = false;
        if ((await NFTcontract.getApproved(item.tokenId)).toLowerCase() === marketplaceAddress.address.toLowerCase()) {
            _isMarketplaceApproved = true;
        }
        console.log('CC: ', item.nft)
        let dbItem = {
            itemId: i,
            owner: _owner,
            name: nftName,
            tokenId: item.tokenId,
            contract: item.nft,
            price: item.price,
            bidPrice: item.bidPrice,
            rentPrice: item.rentPrice,
            rentPeriod: item.rentPeriod,
            bidAddress: item.bidAddress,
            forSell: item.forSell,
            forRent: item.forRent,
            image: uri,
            isMarketplaceApproved: _isMarketplaceApproved
        }

        let existInDatabase = await mongo.getItem(i);
        if (!existInDatabase[0]) {
            console.log("Adding item ", i, " in database..");
            mongo.addItem(dbItem)

        } else {
            console.log("Item ", i, " already exist. Updating it..");
            mongo.updateItem(dbItem)
        }


    }
    process.exit();
}

main();