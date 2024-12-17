const express = require("express");
const session_config = require("./config/session_config");
const passport = require("./config/passport");
require("dotenv").config();
const connect_db = require("./config/database_config")
// const testConnection = require("./config/database_config")

const user_route = require("./routes/user/user_route");
const admin_route = require("./routes/admin/admin_route");
const file_upload = require("express-fileupload");
const path = require("path");

const app = express();

connect_db();


// const { MongoClient } = require('mongodb');
// 
// const URI = "mongodb://yesudasmj50:tISAUWSMedq1zw7B@cluster0-shard-00-00.tzfus.mongodb.net:27017,cluster0-shard-00-01.tzfus.mongodb.net:27017,cluster0-shard-00-02.tzfus.mongodb.net:27017/?ssl=true&replicaSet=atlas-uenen9-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0 ";
// 
// const client = new MongoClient(URI, {
//   ssl: false,
//   serverSelectionTimeoutMS: 5000,
// });

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
// 
// testConnection()

app.use(session_config);

const PORT = process.env.PORT;
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  file_upload({
    limits: { fileSize: 50 * 1024 * 1024, files: 6 },
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "public/tmp"),
  })
);

app.use("/", user_route);

app.use("/admin", admin_route);

app.use(passport.initialize());
app.use(passport.session());

app.listen(PORT, () => {
  console.log("server started");
});
