const mongo = require("../components/mongoDB");
const express = require("express");
router = express.Router();

router.get("/", async (request, response) => {
    response.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.send(await mongo.getAllCollections());
});

router.get("/:id", async (request, response) => {
    
    const result = await mongo.getCollection(request.params.id);
    
    if (!result[0]) {
        response.status(404).send("Collection with the given id doesn't exist.");
    } else {
        response.send(result);
    }
});

module.exports = router;
