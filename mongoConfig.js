const mongoose = require("mongoose");
const { collection } = require("./models/users");

const mongoDB = process.env.MONGO_DB;

mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));
