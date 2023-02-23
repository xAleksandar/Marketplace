const ethers = require("ethers");
const nftABI = require("../contractsData/NFT.json");
const marketplaceABI = require("../contractsData/Marketplace.json");
const marketplaceAddress = require("../contractsData/Marketplace-address.json");

const mongo = require("../components/mongoDB");

require("dotenv").config();

async function main() {
    const provider = new ethers.providers.WebSocketProvider(process.env.ALCHEMY_WSS_URL);
    const marketplace = new ethers.Contract(marketplaceAddress.address, marketplaceABI.abi, provider);
    
    const results = await marketplace.returnCollections();
    for (let i = 0; i < results.length; i++) {
        let contract = new ethers.Contract(results[i].Contract, nftABI.abi, provider)

        let collectionName = await contract.name();
        let collectionSym = await contract.symbol();

        let collection = {
            id: i,
            name: collectionName,
            symbol: collectionSym,
            contract: results[i].contract,
            owner: results[i].Owner,
            image: results[i].imageLink,
            info: results[i].info
        }
        
        let existInDatabase = await mongo.getCollection(i);
        if (!existInDatabase[0]) {
            console.log("Adding Collection ", i, " in database..");
            mongo.addCollection(collection)

        } else {
            console.log("Collection ", i, " already exist.");
        }

    }




//     for (let i = 1; i < itemsCount + 1; i++) {

//         let item = await marketplace.items(i);

//         let NFTcontract = new ethers.Contract(item.nft, nftABI.abi, provider)
//         let nftName = (await NFTcontract.name()) + " #" + item.tokenId.toString()
//         let uri = await NFTcontract.tokenURI(item.tokenId.toString())
//         let _owner = await NFTcontract.ownerOf(item.tokenId.toString());

//         let dbItem = {
//             itemId: i,
//             owner: _owner,
//             name: nftName,
//             tokenId: item.tokenId,
//             nftcollection: item.nft,
//             price: item.price,
//             bidPrice: item.bidPrice,
//             rentPrice: item.rentPrice,
//             rentPeriod: item.rentPeriod,
//             bidAddress: item.bidAddress,
//             forSell: item.forSell,
//             forRent: item.forRent,
//             image: uri
//         }

//         let existInDatabase = await mongo.getItem(i);
//         if (!existInDatabase[0]) {
//             console.log("Adding item ", i, " in database..");
//             mongo.addItem(dbItem)

//         } else {
//             console.log("Item ", i, " already exist. Updating it..");
//             mongo.updateItem(dbItem)
//         }


//     }
    process.exit();
}

main();