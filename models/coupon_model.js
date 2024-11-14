const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const coupon_schema = new mongoose.Schema({

    coupon_name: {
        type: String,
        required: true
    },
    coupon_description: {
        type: String,
        required: true
    },
    coupon_code: {
        type: String,
        required: true,
        unique: true
    },
    coupon_status: {
        type: Boolean,
        default: true
    },
    discount_percentage: {
        type: Number,
        required: true
    },
    coupon_max_amount: {
        type: Number,
        required: true
    },
    coupon_min_amount: {
        type: Number,
        required: true
    },
    coupon_expires: {
        type: String,
        required: true,
        default:""
    },
    used_by: [{
        type: ObjectId,
        ref:"user"
    }]
}, { timestamps: true} );

const coupons = mongoose.model('coupon', coupon_schema);
module.exports = coupons;