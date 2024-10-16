const User = require("../../models/user_model");
const Address = require("../../models/address_model");
const mongoose = require("mongoose");

const edit_details = async (req, res) => {
    try {
        const user_id = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
        console.log("user id: ", user_id)
        const user = await User.findOne({ _id:user_id });
        return res.status(200).render('user/user_profile',user);
    } catch (error) {
        return res.status(500).json({message:"edit details page error",error})
    }
}

const post_edit_details = async (req, res) => {
    try {
        const user_id = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
        const {dname, mobile} = req.body;

        console.log("name:",dname, "mobile:",mobile, "user id:", user_id);

        const updated_user = await User.findByIdAndUpdate( user_id, { 
            name:dname,
            phone: mobile
        }, {new: true});
        console.log("updated user:",updated_user);
        return res.status(200).json({ message: true });
    } catch (error) {
        return res.status(500).json({ message: "error while post from edit profile", error: error.message });
    }
}

module.exports = {
    edit_details,
    post_edit_details
} 
