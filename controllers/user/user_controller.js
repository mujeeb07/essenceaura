const user = require("../../models/user_model");
const user_otp = require("../../models/user_otp_model");
const Product = require("../../models/product_model");
const Address = require("../../models/address_model");
const orders = require("../../models/order_model");
const otp_generator = require("otp-generator");
const nodemailer = require("nodemailer");
require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;
const generate_referral_code = require("../../utils/generate_referral_code");
const create_mail_options = require("../../utils/create_email");
const Wallet = require("../../models/wallet");
const Wallet_txns = require("../../models/wallet_transactions");
const statusCode = require("../../constance/statusCodes");

const loadUserLoginPage = async (req, res) => {
  try {
    let success_message = req.session.success_message;

    req.session.success_message;

    return res
      .status(statusCode.SUCCESS)
      .render("user/user_login", { message: "", show_message: true });
  } catch (error) {
    console.log(`error while loading the login page ${error.message}`);
  }
};

const loadUserRegistrationPage = async (req, res) => {
  try {
    return res
      .status(statusCode.SUCCESS)
      .render("user/user_register", { message: null });
  } catch (error) {
    console.log(
      `error while loading the loding registration page ${error.message}`
    );
  }
};

const registerNewUser = async (req, res) => {
  try {
    const { name, email, referral, password, cpassword } = req.body;

    if (password !== cpassword) {
      return res
        .status(400)
        .render("user/user_register", { message: "Passwords do not match!" });
    }

    const existing_user = await user.findOne({ email: email });
    if (existing_user) {
      return res
        .status(400)
        .render("user/user_login", {
          message: "User already exists! Please log in.",
        });
    }

    let referrer_id = null;
    if (referral !== "") {
      const referrer = await user.findOne({ referral_code: referral });

      if (!referrer) {
        return res
          .status(400)
          .render("user/user_register", { message: "Invalid referral code!" });
      }
      referrer_id = referrer._id;
    }

    const otp = otp_generator.generate(6, {
      digits: true,
      alphabets: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log(`Generated OTP: ${otp}`);

    const otp_data = new user_otp({ email: email, otpCode: otp });
    await otp_data.save();

    req.session.form_data = { name, email, password, cpassword, referrer_id };

    const otp_text = `Hello, your OTP code is ${otp}. It will expire in 1 minute.`;
    const mailOptions = create_mail_options(email, "Your OTP Code", otp_text);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail(mailOptions);
    console.log("Email has been sent!");

    return res.render("user/user_send_otp", {
      message: "OTP sent to your email.",
    });
  } catch (error) {
    console.error("Error in register_user function:", error);
    return res.status(500);
  }
};

const sendUserOtp = async (req, res) => {
  try {
    return res.status(statusCode.SUCCESS).render("user/user_send_otp");
  } catch (error) {
    console.log("Error with OTP:", error.message);
    return res.status(400).send("Error while sending the OTP");
  }
};

const secure_password = async (password) => {
  try {
    const password_hash = await bcrypt.hash(password, 10);
    return password_hash;
  } catch (error) {
    console.log(error.message);
  }
};

const otpVerification = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email, name, password, referrer_id } = req.session.form_data;
    const otp_data = await user_otp.findOne({ otpCode: otp, email });

    if (!otp_data) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP", success: false });
    }

    //new user
    const user_data = new user({
      name,
      email,
      password: await secure_password(password),
      is_admin: false,
      referred_by: referrer_id,
    });

    await user_data.save();
    await user_otp.deleteOne({ email });

    //  referral code for new user
    user_data.referral_code = generate_referral_code(user_data._id);
    await user_data.save();

    // wallet for the new user
    let wallet = await Wallet.findOne({ user_id: user_data._id });
    if (!wallet) {
      const new_wallet = new Wallet({ user_id: user_data._id });
      wallet = await new_wallet.save();
    }

    // new user get ₹1000 bonus
    if (user_data.referred_by) {
      wallet.balance += 1000;
      await wallet.save();

      const referred_user_txn = new Wallet_txns({
        wallet_id: wallet._id,
        txn_amount: 1000,
        txn_description: "Referral bonus credited to your wallet",
        txn_type: "Credit",
        wallet_transaction_status: "Referral",
      });
      await referred_user_txn.save();
    }

    if (user_data.referred_by) {
      let referrer_wallet = await Wallet.findOne({
        user_id: user_data.referred_by,
      });
      if (!referrer_wallet) {
        const new_referrer_wallet = new Wallet({
          user_id: user_data.referred_by,
        });
        referrer_wallet = await new_referrer_wallet.save();
      }
      referrer_wallet.balance += 500;
      await referrer_wallet.save();

      const referrer_txn = new Wallet_txns({
        wallet_id: referrer_wallet._id,
        txn_amount: 500,
        txn_description: `Referral bonus credited for referring "${user_data.name}"`,
        txn_type: "Credit",
        wallet_transaction_status: "Referral",
      });
      await referrer_txn.save();

      // Updaate referred users list in referrer's usr document
      const referrer_user = await user.findById(user_data.referred_by);
      referrer_user.referred_users.push(user_data._id);
      await referrer_user.save();
    }

    return res
      .status(statusCode.SUCCESS)
      .json({ message: "OTP verified successfully", success: true });
  } catch (err) {
    console.log("Error from verify OTP function:", err);
    return res
      .status(500)
      .json({
        message: "Verification failed. Please try again.",
        success: false,
      });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.session.form_data;

    if (!email) {
      return res
        .status(400)
        .json({ message: "No email found in session.", success: false });
    }

    const otp = otp_generator.generate(6, {
      digits: true,
      alphabets: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log(`Resent OTP: ${otp}`);

    await user_otp.findOneAndUpdate(
      { email },
      { otpCode: otp, createdAt: Date.now() },
      { upsert: true }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: {
        name: "Essence Aura",
        address: process.env.EMAIL_USER,
      },

      to: email,
      subject: "Your OTP Code",
      text: `Hello, your new OTP code is ${otp}. It will expire in 1 minute.`,
    };

    transporter.sendMail(mailOptions);

    console.log("OTP email has been sent");
    return res
      .status(statusCode.SUCCESS)
      .json({ message: "OTP has been sent to your email.", success: true });
  } catch (error) {
    console.log(`Error resending OTP: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Failed to resend OTP.", success: false });
  }
};

const loadHomePage = async (req, res) => {
  try {
    let success_message = req.session.success_message;
    req.session.success_message = null;
    const products_list = await Product.find({ is_blocked: false })
      .populate("brand")
      .populate("category");
    let user = false
    if(req.session.user || req.session?.passport?.user){
      user = true
    }
    return res.render("user/user_landing", { products_list, success_message, user });
  } catch (error) {
    console.log("error while rendering home page.", error);
    return res.status(500).json({ message: "Error while rendering home page." });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .render("user/user_login", {
          message: "Please enter both email and password.",
          show_message: true,
        });
    }

    const user_data = await user.findOne({ email: email.trim() });

    if (!user_data) {
      return res
        .status(400)
        .render("user/user_login", {
          message: "No user found! Please register first.",
          show_message: true,
        });
    }

    if (!user_data.is_active) {
      return res
        .status(400)
        .render("user/user_login", {
          message: "Can't login, user has been blocked.",
          show_message: true,
        });
    }

    if (user_data.is_admin) {
      return res
        .status(400)
        .render("user/user_login", {
          message: "Admin can't login here.",
          show_message: true,
        });
    }

    const password_match = bcrypt.compare(password.trim(), user_data.password);

    if (!password_match) {
      return res
        .status(400)
        .render("user/user_login", {
          message: "Invalid email or password.",
          show_message: "false",
        });
    }

    req.session.success_message = ` Welcome ${user_data.name}`;
    req.session.user = user_data._id;

    return res.status(statusCode.SUCCESS).redirect("/");
  } catch (error) {
    console.error("Error while logging in:", error.message);
    return res
      .status(500)
      .render("user/user_login", {
        message: "Something went wrong. Please try again later.",
        show_message: true,
      });
  }
};

const logoutUser = async (req, res) => {
  try {
    req.session.destroy() ||
      mongoose.Types.ObjectId.createFromHexString(
        req.session?.passport?.user
      ).destroy();
    return res.status(204).redirect("/login");
  } catch (error) {
    console.log("Error while Logout.", error);
    return res.status(500).json({ message: "error while login out", error });
  }
};

const displayProduct = async (req, res) => {
  try {
    const productId = req.params.product_id;
    const product = await Product.findById(productId)
      .populate("category")
      .populate("brand");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const default_variant =
      product.variants.find((variant) => variant.stock > 0) ||
      product.variants[0];
    const actualPrice = default_variant.price;

    const hasOffer =
      product.product_offer &&
      product.product_offer.offer_status &&
      new Date(product.product_offer.offer_expire_date) > new Date();

    let offerPrice = null;

    if (hasOffer) {
      offerPrice = default_variant.sale_price_after_discount;
    }

    return res.status(statusCode.SUCCESS).render("user/view_product", {
      product,
      actualPrice,
      offerPrice,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error while rendering the product view page", error);
    return res
      .status(500)
      .json({ message: "Error while viewing product", error });
  }
};

const userAddressDetails = async (req, res) => {
  try {
    const {
      full_name,
      mobile_number,
      pincode,
      address,
      landmark,
      town_city,
      state,
    } = req.body;

    const user_id =
      req.session.user ||
      req.session?.passport?.user;
    const address_data = new Address({
      user: user_id,
      name: full_name,
      address: address,
      city: town_city,
      state: state,
      mobile: mobile_number,
      postal_code: pincode,
      landmark: landmark,
    });

    await address_data.save();
    const current_user = await user.findById(user_id);
    current_user.address_id.push(address_data._id);

    await current_user.save();
    const sourcePage = req.body.sourcePage;
    if (sourcePage === "checkout") {
      req.session.address_message = `Address added successfully`;
      return res.redirect("/checkout");
    }
    return res
      .status(statusCode.SUCCESS)
      .json({ message: "New address added successfully.", success: true });
  } catch (error) {
    console.log("error for adding address", error);
    return res
      .status(500)
      .json({ message: "Error add address.", success: false });
  }
};

const deleteUserAddress = async (req, res) => {
  const addressId = req.params.id;
  const user_id =
    req.session.user ||
    req.session?.passport?.user;
  try {
    await Address.findByIdAndDelete(addressId);
    await user.updateOne(
      { _id: user_id },
      { $pull: { address_id: addressId } }
    );
    return res
      .status(statusCode.SUCCESS)
      .json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.log("Error while delete address.", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete address" });
  }
};

const userProfileDetails = async (req, res) => {
  try {
    const user_id = req.session.user || req.session?.passport?.user;
    const id = await user.findById({ _id: user_id });
    const order = await orders.find({ user: user_id });
    const addresses = await Address.find({ user: user_id });
    return res.render("user/user_profile", {
      addresses: addresses,
      id,
      orders: order,
      user: true
    });
  } catch (error) {
    console.log("error while in user profile", error.message);
    return res.status(500).json({ message: "error whith user profile", error });
  }
};

const loadEditAddressPage = async (req, res) => {
  const address_id = req.params.id;
  try {
    const address = await Address.findOne({ _id: address_id });
    return res
      .status(statusCode.SUCCESS)
      .render("user/edit_address", { address, user: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "error while rendering edit page", error });
  }
};

const updateAddress = async (req, res) => {
  const { id, name, mobile, address, city, state, postal_code, landmark } =
    req.body;
  try {
    await Address.findByIdAndUpdate(
      { _id: id },
      {
        name: name,
        address: address,
        city: city,
        state: state,
        mobile: mobile,
        postal_code: postal_code,
        landmark: landmark,
      }
    );
    return res.status(statusCode.SUCCESS).redirect("/user_profile");
  } catch (error) {
    return res
      .status(500)
      .console.log("error while updating user addres", error);
  }
};

module.exports = {
  loadUserLoginPage,
  loadUserRegistrationPage,
  registerNewUser,
  userLogin,
  otpVerification,
  loadHomePage,
  sendUserOtp,
  resendOtp,
  logoutUser,
  displayProduct,
  userAddressDetails,
  userProfileDetails,
  deleteUserAddress,
  loadEditAddressPage,
  updateAddress,
};
