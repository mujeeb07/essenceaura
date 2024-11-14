const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//cart items schema
const cart_items_schema = new mongoose.Schema({
    product: {
        type: ObjectId,
        ref: 'product',
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
        max: 5
    },
    price: {
        type:Number,
        required: true
    },
    offer_price: {
        type: Number,
        default: 0
    },
    volume: {
        type: Number,
        require: true
    }
},{timestamps: true});

const cart_schema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: 'user',
        required: true
    },
    item: [cart_items_schema]
},{timestamps: true});


const cart = mongoose.model('cart', cart_schema);

module.exports = cart;