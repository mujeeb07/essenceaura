const mongoose = require('mongoose');
const transaction = require('./online_transaction_model');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


const wallet_transactions = new mongoose.Schema({
    order_id:{
        type: ObjectId,
        ref: 'order',
        required: true
    },
    amount:{
        type: Number,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    wallet_transaction_status:{
        type: String,
        enum: ["refunded", "pending", "paid"],
        default: 'pending'
    }
}, { timestamps: true });

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
    },
    transactions: [wallet_transactions]
}, { timestamps: true });

const wallet = mongoose.model('wallet', wallet_schema);

module.exports = wallet;
