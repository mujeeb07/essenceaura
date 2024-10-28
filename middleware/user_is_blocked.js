const User = require("../models/user_model");
const mongoose = require('mongoose');

const user_blocked = async (req, res, next) => {
    try { 
        // console.log("Session User:", req.session.user);
        // console.log("Request User:", req.session.passport ? req.session.passport.user : "Passport user not found");
        // console.log("Complete session object:", req.session);
        const user = req.session.user || (req.session.passport && req.session.passport.user);
        if (!user) {
            // console.log("No user found in session.");
            return res.redirect('/login');
        }
        
        let userId;

        if(typeof user === 'string' ){
            userId = mongoose.Types.ObjectId.createFromHexString(user)
        }else{
            userId = user
        }
        // console.log("User ID for query:", userId);
        const user_data = await User.findOne({ _id: userId });
        // console.log("Fetched user data:", user_data);
        if (!user_data || !user_data.is_active) {
            console.log("User is either not found or is blocked.");
            return res.redirect('/login');
        }

        next();
    } catch (error) {
        console.error("Error in user_blocked middleware:", error);
        return res.status(500).json({ message: "Error occurred in user_blocked middleware" });
    }
}

module.exports = user_blocked;
