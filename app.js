const express = require("express");
const session_config = require("./config/session_config");
const passport = require("./config/passport");
require("dotenv").config();
const connect_db = require("./config/database_config");
const user_route = require("./routes/user/user_route");
const admin_route = require("./routes/admin/admin_route");
const file_upload = require("express-fileupload");
const path = require("path");
const { handleNotFound, handleServerError } = require('./middleware/error_handler');

const app = express();

connect_db(); 

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

app.use(handleNotFound);
app.use(handleServerError);

app.use(passport.initialize());
app.use(passport.session());

app.listen(PORT, () => {
  console.log("server started");
});
