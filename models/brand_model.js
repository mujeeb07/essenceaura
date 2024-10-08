const mongoose = require('mongoose');
  const brand_schema = new mongoose.Schema({
      brandName: {
          type: String,
          required: true,
        },
      description: {
          type: String,
          required: true
        },
      is_deleted: {
        type: Boolean,
        default:false
      },
      logo: {
            type: String,
            required: true
        }  
          
  }, {timestamps:true}); 

module.exports  = mongoose.model('brand', brand_schema);

