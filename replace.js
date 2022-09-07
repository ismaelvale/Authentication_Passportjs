const { faker } = require('@faker-js/faker');
const mongoose = require("mongoose");
const users = require('./models/users');
const { collection } = require("./models/users");
const MongoClient = require("mongodb").MongoClient;
const bcrypt = require("bcryptjs");

async function renameDB() {
    const uri = "mongodb+srv://ismaelvale:Authy1@cluster0.jopgwjc.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });

        
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const collection = client.db("test").collection("messages");
        await collection.updateMany({likes: {$type: Array}}, {$set: {likes: {$type: Number}}});
        console.log("Database renamed! :)");
        client.close();
    }
    catch (err) {
        console.log(err.stack);
    }
};

renameDB();