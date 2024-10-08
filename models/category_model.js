const mongoose = require("mongoose");
const category_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false,
    },
    is_active: {
      type: Boolean,
      default: true
    },
    gender: {
      type: String,
      required: true
    }
  }, { timestamps: true } );

module.exports = mongoose.model("category", category_schema);