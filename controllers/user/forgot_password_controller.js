const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../../models/user_model");

const forgot_password = async (req, res) => {
  const { email } = req.body;
  console.log("E-mail:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .redirect("/forgot-password?message=No user with that email");
    }
  } catch (error) {}
};
