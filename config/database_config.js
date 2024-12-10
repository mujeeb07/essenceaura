// const mongoose = require('mongoose');
// console.log("mongos db check")
// const connectDB = async () => {
//     const uri = "mongodb+srv://cluster_database:xkgOKOhmbhpvB2Y8@cluster0.bg922.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
//     try {
//         await mongoose.connect(uri);
//         console.log("Database connected successfully");
//     } catch (error) {
//         console.error("Error connecting to MongoDB", error);
//     }
// };
// module.exports = connectDB;


const mongoose = require('mongoose');
console.log("Checking MongoDB connection...");

const connectDB = async () => {
    const uri = "mongodb+srv://mujibrehman8846:NQXWUYgpPzrUBTtj@essencecluster.ta8gt.mongodb.net/?retryWrites=true&w=majority&appName=essenceCluster";
    try {
        await mongoose.connect(uri);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
    }
};

module.exports = connectDB;

