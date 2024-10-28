const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId =  mongoose.Types.ObjectId;

const wishlist_schema = new mongoose.Schema({
    user_id: {
        type: ObjectId,
        ref: 'user',
        required: true
    },
    product_ids: [{
        type: ObjectId,
        ref: 'product'
    }]
}, { timestamps: true } );

const wishlist = mongoose.model('wishlist', wishlist_schema);
module.exports = wishlist;