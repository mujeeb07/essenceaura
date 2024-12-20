const mongoose = require('mongoose');

const connect_db = async () => {
    console.log("Checking MongoDB connection...");
    const URI = process.env.DATABASE_CONFIG
    try {
      await mongoose.connect(URI);
      console.log("Database connected successfully"); 
    } catch (error) {
      console.error("Error connecting to Database:", error.message);
    }
  };   

  if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode');
  } else {
    console.log('Running in development mode');
  }

module.exports = connect_db;            