require('dotenv').config();
const razorpay_lib = require('razorpay');
const crypto = require('crypto');
const Orders = require('../../models/order_model');
const Transaction =  require('../../models/online_transaction_model');

const razorpay_id = process.env.RAZORPAY_ID;
const razorpay_key = process.env.RAZORPAY_SCRET_KEY

const razorpay = new razorpay_lib({
    key_id: razorpay_id,
    key_secret: razorpay_key
});

const create_razorpay_order = async (amount) => {
    try {
        const data = {
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt" + Date.now(),
            payment_capture: 1
        }
        
        const razorpay_order = await razorpay.orders.create(data);
        return razorpay_order

    } catch (error) {
        console.error('Razorpay Error:', error.response ? error.response.data : error.message);
        throw error
    }
}

const verify_razorpay_signature = async (orderId, paymentId, signature) => {
    try {
        const text = orderId + '|' + paymentId;
        const generate_signature = crypto.createHmac('sha256', razorpay_key).update(text).digest('hex');
        const transactions_data = await Transaction.findOne({ online_payment_order_id:paymentId });


        if(generate_signature === signature){
            transactions_data.payment_status = 'Paid';
            await transactions_data.save();
        }
      
        return generate_signature === signature
    } catch (error) {
        console.log("Error while verify razorpay signature.", error.message);
        throw error
        
    }
}

const verify_online_payment = async (req, res) => {
    try {
        const { address, payment, paymentId, orderId, signature } = req.body;
        const is_valid_payment = verify_razorpay_signature(paymentId, orderId, signature);

        if(is_valid_payment) {
            await Transaction.findOneAndUpdate(
                { online_payment_order_id: orderId },
                {$set: { payment_status: 'Paid'} }
            );
            return res.status(200).json({success: true, message:"Online payment verfied Success"});
        } else {
            await Transaction.findOneAndUpdate(
                { online_payment_order_id: orderId },
                {$set: { payment_status: 'Failed'} }
            );
            return res.status(400).json({success: false, message:"Online payment failed"});
        }
    } catch (error) {
        copnsole.log("Error while operating online payment.", error.message);
        return res(500).json({ success: false, message:"Error verify online payment" });
    }
}


module.exports = {
    create_razorpay_order,
    verify_razorpay_signature,
    verify_online_payment
}