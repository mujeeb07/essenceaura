const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const user_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    google_id: {
      type: String,
    },
    password: {
      type: String,
      required: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
    address_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "address",
      },
    ],
    hashed_token: {
      type: String,
    },
    token_expires: {
      type: Date,
    },
    referral_code: {
      type: String,
    },
    referred_by: {
      type: String,
    },
    referred_id: {  // referral code of the user who invited
      type: String,
    },
    // referral_bonus_amount: {
    //   type: Number,
    //   default: 0
    // },
    referred_users: [{
      type: ObjectId,
      ref:"user"
    }]
  },{ timestamps: true }
);

module.exports = mongoose.model("user", user_schema);
    