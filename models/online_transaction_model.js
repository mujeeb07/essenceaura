const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const transation_schema = new mongoose.Schema({
    user_id: {
        type: ObjectId,
        ref: 'user',
        required: true
    },
    order_id: {
        type: ObjectId,
        ref: 'order',
        required: true
    },
    payment_provider: {
        type: String,
        required: false
    },
    online_payment_order_id: {
        type:String,
        required: false
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: "INR"
    },
     payment_status: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
     },
}, { timestamps: true });

const transaction = mongoose.model('transaction', transation_schema);
module.exports = transaction;