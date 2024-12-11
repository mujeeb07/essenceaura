const mongoose = require('mongoose');
require("dotenv").config();
const connect_db = async () => {
    console.log("Checking MongoDB connection...");
  
    const URI = process.env.DATABASE_CONFIG
    console.log(URI)
    try {
      await mongoose.connect(URI);
      console.log("Database connected successfully"); 
    } catch (error) {
      console.error("Error connecting to MongoDB:", error.message);
    }
  };   
module.exports = connect_db;