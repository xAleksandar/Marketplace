const mongo = require("../components/mongoDB");
const express = require("express");
router = express.Router();

router.get("/", async (request, response) => {
    response.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.send(await mongo.getAllItems());
});

router.get("/:id", async (request, response) => {
    
    const result = await mongo.getItem(request.params.id);
    
    if (!result[0]) {
        response.status(404).send("Item with the given id doesn't exist.");
    } else {
        response.send(result);
    }
});

router.post("/", (request, response) => {
    
    console.log(request.body)

    const result = items.find(x => x.id === request.body.id);
    if (!result) {
        console.log('Not found, adding to database..');
        const action = mongo.addItem(request.body);
        response.send(action);
    
    } else {
        response.status(404).send("Item with given id already exist.");
    }
});

module.exports = router;
