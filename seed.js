const { faker } = require('@faker-js/faker');
const mongoose = require("mongoose");
const users = require('./models/users');
const { collection } = require("./models/users");
const MongoClient = require("mongodb").MongoClient;
const bcrypt = require("bcryptjs");

async function seedDB() {
    const uri = "mongodb+srv://ismaelvale:Authy1@cluster0.jopgwjc.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });

        
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const collection = client.db("test").collection("messages");
        let seedMessages = [];

        for (let i = 0; i < 5; i++) {
            
            let message = {
                caption: faker.lorem.lines(1),
                user: 'Tristin80',
                added: { type: Date, default: Date.now },
                image: faker.image.image()
            }
            seedMessages.push(message);
            
        }
        await collection.insertMany(seedMessages);
        console.log("Database seeded! :)");
        client.close();
    }
    catch (err) {
        console.log(err.stack);
    }
};

seedDB();