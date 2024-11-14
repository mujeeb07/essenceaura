const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const offer_schema = new Schema({
    offer_name: {
        type: String,
        required: true
    },
    offer_discount_percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    offer_discount_amount: {
        type: Number
    },
    offer_start_date: {
        type: Date,
        required: true
    },
    offer_expire_date: {
        type: Date,
        required: true
    },
    offer_status: {
        type: Boolean,
        default: true
    }
}, { timestamps:true } )


const product_schema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'brand',
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    variants: [ 
        {
            volume: { 
                type: Number,
                required: true,
                min: 1
            },
            stock: {
                type: Number,
                required: true,
                min: 0,
                default: 0
            },
            price: {
                type: Number,
                required: true,
                min: 0
            },
            sale_price_after_discount: {
                type: Number
            },
            offer_discount_amount: {
                type: Number
            }
        }
    ],
    product_card_image: {
        type: String,
      
    },
    product_details_images: [
        {
            type: String,
            
        }
    ],
    is_blocked: {
        type: Boolean,
        default: false
    },
    product_offer: offer_schema
}, { timestamps: true });

module.exports = mongoose.model('product', product_schema);
