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
        },
        cancel_request: {
          type: String,
          enum: ['Pending', 'Cancelled'],
          default: 'Pending'
        },
        return_request: {
          type: String,
          enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Return Initiated", "Return Approved", "Return Rejected"],
          default: "Pending"
        },
        return_reason: {
          type: String,
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
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  delivery_charge: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    reqwiured: true
  },
  payment_method: {
    type: String,
    enum: ['COD', 'online', 'wallet'],
    required: true
  },
  payment_status: {
    type: String,
    enum: ["pending","completed"],
    default: "pending"
  },
  order_status: {
    type: String,
    enum: ['Pending', 'Returned', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('order', order_schema);
