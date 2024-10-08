const mongoose = require("mongoose");

const address_schema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      mobile: {
        type: Number,
        required: true
      },
      postal_code: {
        type: String,
        required: true
      },
      landmark: {
        type: String,
        required: true,
        trim: true
      }
    }, { timestamps: true } );

module.exports = mongoose.model("Address", address_schema);
