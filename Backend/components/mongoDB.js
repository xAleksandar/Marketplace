const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

mongoose.connect("mongodb://localhost/Marketplace")
    .then(() => {console.log('Mongo (=) Connected to database.')})
    .catch(err => {console.log("Mongo (=) Couldn't connect to database.", err)});

const itemSchema = new mongoose.Schema({
    itemId: Number,
    owner: String,
    name: String,
    tokenId: Number,
    contract: String,
    price: String,
    bidPrice: String,
    rentPrice: String,
    rentPeriod: Number,
    bidAddress: String,
    forSell: Boolean,
    forRent: Boolean,
    image: String,
    isMarketplaceApproved: Boolean
})

const Item = mongoose.model("Items", itemSchema);



const collectionSchema = new mongoose.Schema({
    id: Number,
    name: String,
    symbol: String,
    contract: String,
    owner: String,
    image: String,
    info: String
})

const Collection = mongoose.model("Collections", collectionSchema);



const addCollection = async(args) => {
    const collection = new Collection({
        id: args.id,
        name: args.name,
        symbol: args.symbol,
        contract: args.contract,
        owner: args.owner,
        image: args.image,
        info: args.info
    })

    const result = await collection.save();
    return result;
}

const getCollection = async (_id) => {
    result = await Collection.find({id: _id})
    return result;
}

const getAllCollections = async () => {
    result = await Collection.find()
    return result;
}

const addItem = async (args) => {
    const item = new Item({
        itemId: args.itemId,
        owner: args.owner,
        name: args.name,
        tokenId: args.tokenId,
        contract: args.contract,
        price: args.price,
        bidPrice: args.bidPrice,
        rentPrice: args.rentPrice,
        rentPeriod: args.rentPeriod,
        bidAddress: args.bidAddress,
        forSell: args.forSell,
        forRent: args.forRent,
        image: args.image,
        isMarketplaceApproved: args.isMarketplaceApproved
    })

    const result = await item.save();
    return result;
}

const updateItem = async (args) => {

    const result = await Item.updateOne({itemId: args.itemId}, args);
    return result;
}

const getItem = async (id) => {
    result = await Item.find({itemId: id})
    return result;
}

const getAllItems = async () => {
    result = await Item.find()
    return result;
}

module.exports = {addItem, 
                  getAllItems, 
                  getItem, 
                  updateItem,
                  addCollection,
                  getCollection,
                  getAllCollections}