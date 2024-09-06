const mongoose = require("mongoose")
require("dotenv").config();
const link = "mongodb://127.0.0.1:27017/project1"
mongoose.connect(link)
const database = mongoose.connection;
database.on("connected", function(){
    console.log("Database server connected")
})
database.on("disconnected", function(){
    console.log("Database server disconnected")
})
database.on("error", function(){
    console.log("Error while connecting to the database")
})