const mongoose = require('mongoose');
// const Wallet = require('../models/wallet');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const wallet_txns_schema = new mongoose.Schema({
    wallet_id: {
        type: ObjectId,
        ref: 'wallet',
        required: true
    },
    txn_amount:{
        type: Number,
        required: true
    },
    txn_description:{
        type: String,
        required: true
    },
    txn_type:{
        type: String,
        enum: ["Credit", "Debit"],
        required: true
    },
    wallet_transaction_status:{
        type: String,
        enum: ["Refunded", "Pending", "Purchase"],
        default: 'pending'
    }
}, { timestamps: true });


module.exports = mongoose.model('wallet_txns', wallet_txns_schema)