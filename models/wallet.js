const mongoose = require('mongoose');
// const transaction = require('./online_transaction_model');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const wallet_schema = new mongoose.Schema({
    user_id: {
        type: ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

const wallet = mongoose.model('wallet', wallet_schema);
module.exports = wallet;
