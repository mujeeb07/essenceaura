require('dotenv').config();
const session = require('express-session')
const session_config = session({
        secret: process.env.MY_SECRET_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: {secure:false}
});

module.exports = session_config;