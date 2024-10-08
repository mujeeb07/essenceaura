const User = require("../models/user_model");
const user_blocked = async (req, res, next) => {
    try {
        const user = req.session.user;
        if(!req.session.user){
            return res.redirect('/login');
        }
        const user_data = await User.findOne({_id: user});

        if(!user_data.is_active){
            return res.redirect('/login');
        }

        next();
    } catch (error) {
        return res.status(500).json({message:error});
    }
}

module.exports = user_blocked;