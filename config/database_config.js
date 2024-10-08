const mongoose = require('mongoose');
const connectDB = async () => {
    const uri = process.env.DATABASE_CONFIG 
    try {
        await mongoose.connect(uri);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
    }
};
module.exports = connectDB;