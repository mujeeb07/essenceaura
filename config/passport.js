const passport = require('passport');
const google_strategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user_model');
require("dotenv").config();


passport.use(new google_strategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:'http://localhost:3000/auth/google/callback',
    scope:['profile', 'email'],
    prompt: 'select_account',
    passReqToCallback: true
    },

    async (req, accessToken, refreshToken, profile, cb) => {

        try {
            let user = await User.findOne({ google_id: profile.id });
            console.log("google id:", user);
            
            if(!user){
                user = new User ({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    google_id: profile.id
                });
                await user.save();
            }
            req.session.user = user._id;
            console.log("helfsdfhsdfklsf", req.session.user );
            req.session.userType = 'google'
            return cb(null, user)
        } catch (error) {
            console.log("Error while recieving data from google", error.message);
            return cb(error, null);
        }
    }));


passport.serializeUser((user, done) => { 
    done(null, user.id)
 });

passport.deserializeUser(async (id, done) => {
    try{
        const user = await User.findById(id)
        console.log("serialise ismng",user);
        
        done(null, user);
    }catch{
        done(error, null);
    }
})

module.exports = passport
