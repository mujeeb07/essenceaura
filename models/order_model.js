const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const order_schema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: 'user',
    required: true
  },
  shipping_address: {
    name: { type: String, required: true, trim: true },
    mobile: { type: Number, required: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postal_code: { type: String, required: true },
    landmark: { type: String, trim: true }
  },
  items: [
    {
      product: {
        _id: { type: ObjectId, ref: 'product', required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        product_card_image: { type: String },
        variants: {
          volume: { type: Number, required: true },
          price: { type: Number, required: true }
        },
        category: {
          _id: { type: ObjectId, ref: 'category', required: true },
          name: { type: String, required: true },
          gender: { type: String, required: true }
        },
        brand: {
          _id: { type: ObjectId, ref: 'brand', required: true },
          brandName: { type: String, required: true },
          logo: { type: String }
        }
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  sub_total: {
    type: String,
    required: true
  },
  tax: {
    type: String,
    required: true
  },
  coupon_amount: {
    type: Number,
    default: 0
  },
  total: {
    type: String,
    reqwiured: true
  },
  payment_method: {
    type: String,
    enum: ['COD', 'Online'],
    required: true
  },
  order_status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('order', order_schema);
