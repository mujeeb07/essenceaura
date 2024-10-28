require('dotenv').config();
const razorpay_lib = rerquire('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/online_transaction_model');
const transaction = require('../models/online_transaction_model');
const { create } = require('../models/wishlist_model');

const RAZORPAY_ID = process.env.RAZORPAY_ID;
const RAZORPAY_SECRET_KEY = process.env.RAZORPAY_SECRET_KEY;

const razorpay = new razorpay_lib({
    key_id : RAZORPAY_ID,
    key_secret : RAZORPAY_SECRET_KEY
})

const create_razorpay_order = async (amount) => {
    try {
        const data = {
            amount : amount * 100,
            currency : "INR",
            receipt : "reciept" + Date.now(),
            payment_capture : 1
        }

        const razorpay_order = await razorpay.order.create(data);
        return razorpay_order;

    } catch (error) {
        console.error('Razorpay Error:', error.message);
        throw error
    }
}

const verify_razorpay_signature = async (order_id, payment_id, signature) => {
    const text  = order_id + "|" + payment_id;
    const generate_signature = crypto.createHmac('sha256', RAZORPAY_SECRET_KEY,).update(text).digest('hex');
    const transaction_data = await transaction.findOne({ online_payment_order_id: payment_id });

    if(generate_signature === signature){
        transaction_data.payment_status = "Paid";
        await transaction_data.save();
    }

    return generate_signature === signature;

}

module.exports = { create_razorpay_order, verify_razorpay_signature }