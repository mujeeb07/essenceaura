const mongoose = require('mongoose');



const user_schema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone: {
        type: String,
    },
    google_id:{
        type:String,
        unique:true
    },
    password:{
        type:String,
        required:false
    },
    is_active:{
        type: Boolean,
        default:true,
    },
    is_admin: {
        type: Boolean,
        default: false,
    },
    address_id:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"address"
    }],
    hashed_token:{

        type:String
    },
    token_expires:{

        type:Date
    }
},{ timestamps: true });


module.exports = mongoose.model('user', user_schema)