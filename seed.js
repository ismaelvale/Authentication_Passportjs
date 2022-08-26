const { faker } = require('@faker-js/faker');
const mongoose = require("mongoose");
const users = require('./models/users');
const { collection } = require("./models/users");
const MongoClient = require("mongodb").MongoClient;
const bcrypt = require("bcryptjs");

async function seedDB() {
    const uri = "mongodb+srv://ismaelvale:Authy1@cluster0.jopgwjc.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });

    let hashedPassword = bcrypt.hashSync('123', 10);
        
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const collection = client.db("test").collection("users");
        let seedUsers = [];

        for (let i = 0; i < 20; i++) {
            
            let User = {
                username: faker.internet.userName(),
                password: hashedPassword,
                profilePhoto: faker.image.avatar(),
                fullName: faker.name.firstName(),
                followers: [],
                following: []
            }
            seedUsers.push(User);
            
        }
        await collection.insertMany(seedUsers);
        console.log("Database seeded! :)");
        client.close();
    }
    catch (err) {
        console.log(err.stack);
    }
};

// seedDB();