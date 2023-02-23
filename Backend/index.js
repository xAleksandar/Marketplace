require("dotenv").config();
const express = require("express");
const itemsAPI = require("./APIs/itemsAPI");
const collectionsAPI = require("./APIs/collectionsAPI");
const startMongo = require("./components/startMongo");
const blockchainEventListener = require("./components/MarketplaceEventListener");

startMongo();
blockchainEventListener();

const app = express();

app.use(express.json());
app.use('/api/items', itemsAPI);
app.use('/api/collections', collectionsAPI);

app.get("/", (request, response) => {
    response.send("Hi!!");
});

const port = process.env.NODE_SERVER_PORT || 5000
app.listen(port, () => {
    console.log('Listening on Port:', port);
})
