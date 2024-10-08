const mongoose = require('mongoose');

const otp_schema = new mongoose.Schema({

    email:{
        type: String,
        required: true,
    },
    otpCode: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1m' 
    },
 
});

module.exports = mongoose.model('otp', otp_schema)