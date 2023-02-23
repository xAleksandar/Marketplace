const ethers = require("ethers");
const nftABI = require("../contractsData/NFT.json");
const marketplaceABI = require("../contractsData/Marketplace.json");
const marketplaceAddress = require("../contractsData/Marketplace-address.json");

const mongo = require("./mongoDB");

require("dotenv").config();

const blockchainEventListener = () => {

    const provider = new ethers.providers.WebSocketProvider(process.env.ALCHEMY_WSS_URL);
    const marketplace = new ethers.Contract(marketplaceAddress.address, marketplaceABI.abi, provider);

    marketplace.on("newCollection", async (contract, initiator) => {
        let results = await marketplace.returnCollections();
        for (let i = 0; i < results.length; i++) {
            if (results[i].Contract.toLowerCase() === contract.toLowerCase()) {

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

                mongo.addCollection(collection)
                console.log('Marketplace Listener (=) Collection added.')
            }
        }
    })

    marketplace.on("nft", async (action, itemId, initiator) => {
        
        let item = await marketplace.items(parseInt(itemId.toString()));
        let _itemId = parseInt(itemId.toString())
        let NFTcontract = new ethers.Contract(item.nft, nftABI.abi, provider)
        let nftName = (await NFTcontract.name()) + " #" + item.tokenId.toString()
        let uri = await NFTcontract.tokenURI(item.tokenId);
        let _owner = await NFTcontract.ownerOf(item.tokenId);

        let dbItem = {
            itemId: _itemId,
            owner: _owner,
            name: nftName,
            tokenId: item.tokenId,
            nftcollection: item.nft,
            price: item.price,
            bidPrice: item.bidPrice,
            rentPrice: item.rentPrice,
            rentPeriod: item.rentPeriod,
            bidAddress: item.bidAddress,
            forSell: item.forSell,
            forRent: item.forRent,
            image: uri
        }

        if (action == "Mint") {
            await mongo.addItem(dbItem);
            console.log('Marketplace Listener (=) Item added.');
        } else {
            await mongo.updateItem(dbItem);
            console.log('Marketplace Listener (=) Item Updated.');
        }

    });

    console.log('Marketplace Listener (=) Listening for events.')
}

module.exports = blockchainEventListener