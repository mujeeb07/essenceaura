const passport = require('passport');
const google_strategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user_model');
const env = require("dotenv").config();

passport.use(new google_strategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:'http://localhost:3000/auth/google/callback'
    },
    
    async (accessToken, refreshToken, profile, done) => {
        try {
            let existingUser = await User.findOne({ google_id: profile.id });
            console.log("google exisitng user:", existingUser);
            if (existingUser) {
                return done(null, existingUser);
            } else {
                let newUser = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    google_id: profile.id,
                });
                await newUser.save();
                console.log("new User:", newUser)
                return done(null, newUser);
            }
        } catch (error) {
            return done(error, null);
        }
    }));


passport.serializeUser((user, done) => { done(null, user.id) });


passport.deserializeUser((id, done) => {
    User.findById(id)
    .then(user => {
        done(null, user)
    })
    .catch(error => {
        done(error, null)
    })
})

module.exports = passport;
