const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectId;
   
const app = express();
const jsonParser = express.json();

const mongoClient = new MongoClient("mongodb://root:mypassword@127.0.0.1:27017/?authMechanism=DEFAULT", { useUnifiedTopology: true });

let dbClient;
 
app.use(express.static(__dirname + "/public"));

mongoClient.connect().then(mongoClient => 
{
    dbClient = mongoClient;
    app.locals.collection = dbClient.db("carsdb").collection("cars");
    app.listen(3000, function(){
        console.log("Server is waiting for connection...");
    });
});
 
app.get("/api/cars", function(req, res){
    const collection = req.app.locals.collection;

    collection.find().toArray().then((cars) => {
        res.json(cars)
    }).catch((err) => console.log(err));
});

app.get("/api/cars/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}).then(function(car){
        res.send(car);
    }).catch((err) => console.log(err));
});
   
app.post("/api/cars", jsonParser, function (req, res) {
       
    if(!req.body) return res.sendStatus(400);
       
    const carCompany = req.body.company;
    const carModel = req.body.model;
    const carEnginePower = req.body.enginePower;

    const car = {company: carCompany, model: carModel, enginePower: carEnginePower};

    const collection = req.app.locals.collection;
    collection.insertOne(car).then(function(result){
        res.json(car);
    }).catch((err) => console.log(err));
});
    
app.delete("/api/cars/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}).then(function(result){    
        let car = result.value;
        res.json(car);
    }).catch((err) => console.log(err));
});
   
app.put("/api/cars", jsonParser, function(req, res){
        
    if(!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const carCompany = req.body.company;
    const carModel = req.body.model;
    const carEnginePower = req.body.enginePower;
       
    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {company: carCompany, model: carModel, enginePower: carEnginePower}},
         {returnDocument: 'after'}).then(function(result){   
        const car = result.value;
        res.send(car);
    }).catch((err) => console.log(err));
});

process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});
