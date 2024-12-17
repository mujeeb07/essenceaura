const User = require('../models/user_model');

const validate_referral_code = async (referral_code, res = null) => {
    
    try {
        const referrer = await User.findOne({ referral_code: referral_code });
        if(!referrer){
            if(res){
                return res.status(404).json({valid: false, message:"Invalid referral code"});
            }
            return null
        }
        if(res){
            return res.status(200).json({valid: true, message:"Referral code is valid"})
        }
        return referrer

    } catch (error) {
        console.error("Error validating referral code:", error);
        if (res) {
            return res.status(500).json({ valid: false, message: "Server error" });
        }
        throw error;
    }
};

module.exports = validate_referral_code;
