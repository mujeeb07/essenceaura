const mongoose = require('mongoose');
const connect_db = async () => {
    console.log("Checking MongoDB connection...");
  
    const URI = 'mongodb://yesudasmj50:tISAUWSMedq1zw7B@cluster0-shard-00-00.tzfus.mongodb.net:27017,cluster0-shard-00-01.tzfus.mongodb.net:27017,cluster0-shard-00-02.tzfus.mongodb.net:27017/?ssl=true&replicaSet=atlas-uenen9-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0'
    // console.log(URI)
    try {
      await mongoose.connect(URI);
      console.log("Database connected successfully"); 
    } catch (error) {
      console.error("Error connecting to MongoDB:", error.message);
    }
  };   
module.exports = connect_db;      
          
// const mongoose = require('mongoose');
// const connect_db = async () => {
//     console.log("Checking MongoDB connection...");
//   
//     const URI = 'mongodb://mujibrehman8846:uc5ydQ97Xe5364ki@cluster0-shard-00-00.oadpl.mongodb.net:27017,cluster0-shard-00-01.oadpl.mongodb.net:27017,cluster0-shard-00-02.oadpl.mongodb.net:27017/?ssl=true&replicaSet=atlas-znvefe-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';
//     
//     try {
//       await mongoose.connect(URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//       });
//       console.log("Database connected successfully"); 
//     } catch (error) {
//       console.error("Detailed MongoDB Connection Error:", error);
//       console.error("Error Name:", error.name);
//       console.error("Error Message:", error.message);
//     }
//   };   
// module.exports = connect_db;  
// 
// const { MongoClient } = require('mongodb');
// 
// const URI = "mongodb+srv://mujibrehman8846:uc5ydQ97Xe5364ki@cluster0.oadpl.mongodb.net/mydatabase?retryWrites=true&w=majority";
// 
// const client = new MongoClient(URI);
// 
// async function testConnection() {
//   try {
//     await client.connect();
//     console.log("MongoDB connection successful!");
//   } catch (error) {
//     console.error("MongoDB connection failed:", error.message);
//   } finally {
//     await client.close();
//   }
// }
// 
//  testConnection();
