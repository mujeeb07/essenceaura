const crypto = require("crypto");
const bcrypt = require('bcrypt');
const User = require("../../models/user_model");
const nodemailer = require("nodemailer");
require("dotenv").config();


const load_forgot_password = async (req, res) => {
  try {
    return res.status(200).render("user/forgot_password", { message:" Enter Your email" });
  } catch (error) {
    return res.status(500).json({message:"Error while load forgot password. " + error.message});
  }
};

const forgot_password = async(req, res) => {

  try {

      const {email} = req.body;

      const user_email = email;

      const user_data = await User.findOne({email: user_email});
      
      if(!user_data){
        return res.status(400).json({message:"No User Found With that Email.", success: false});
      }

      if(user_data.google_id){
        return res.status(400).json({message:"Try With Google Signup.", success:false});
      }

      req.session.user = user_email;

      const token = crypto.randomBytes(32).toString('hex');

      const hashed_token = crypto.createHash('sha256').update(token).digest('hex');
      
      const token_expires = Date.now() + 1800000;

      user_data.hashed_token = hashed_token;

      user_data.token_expires = token_expires;


      await user_data.save();

      const reset_link = `${process.env.URL}/reset_password/${hashed_token}`;

      const transporter = nodemailer.createTransport({

        service: "gmail",

        auth:{

          user: process.env.EMAIL_USER,

          pass: process.env.EMAIL_PASS,

        },

      });
      const mailOptions = {

        from: {

          name: "Essence Aura",

          address: process.env.EMAIL_USER,

        },

          to:email,

          subject:"Password Reset.",

          text:`Please reset your password using this link:${reset_link}. link will expires in 30 minutes.`,

      };
      await transporter.sendMail(mailOptions);

      console.log('link has been sent');


      return res.status(400).json({ message:"Link has been sent. Please check your email.", success:true});

  } catch (error) {

    return res.status(400).json({ message:"ERROR ", success:false});

  }

}


const load_reset_password = async (req, res) => {

  const {token} = req.params

  try {

    return res.status(200).render("user/reset_password",{token});

  } catch (error) {
   
    return res.status(500).json({message:"error while rendering reset password page" + error.message})
    
  }

}


const reset_password = async(req, res) => {

  try {
    
    const {token, password} = req.body;
    const user = req.session.user;
    console.log("user emeail:", user);
    console.log("data form the body:",token,password);

    const user_data = await User.findOne({email:user});

    if(!user_data){
      return res.status(400).json({message:"user not found."});
    }

    if(user_data.token_expires < Date.now()){
      return res.status(400).json({message:"The token has expired"})
    }

    if(token !== user_data.hashed_token){
      return res.status(400).json({message:"Invalid token or expired token."})
    }

    const hashed_password = await bcrypt.hash(password, 10);
    
    user_data.password = hashed_password;
    user_data.hashed_token = undefined;
    user_data.token_expires = undefined;

    await user_data.save();

    req.session.success_message = 'Password has been reset successfully.';

    return res.status(200).redirect('/login')

  } catch (error) {

   return res.status(500).json({message:"Error while resetting password." + error.message}); 

  }
}


module.exports = {
  load_forgot_password,
  forgot_password,
  load_reset_password,
  reset_password
}
