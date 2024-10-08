const mongoose = require('mongoose');

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
    }
}, { timestamps: true });

module.exports = mongoose.model('product', product_schema);
