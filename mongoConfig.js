const mongoose = require("mongoose");
const { collection } = require("./models/users");

const dev_db_url = process.env.mongoDB;
const mongoDB = process.env.mongoDB_URI || dev_db_url;

mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));
