const user = require("../../models/user_model");
const user_otp = require("../../models/user_otp_model");
const Product = require("../../models/product_model");
const Address = require("../../models/address_model");
const orders = require("../../models/order_model");
const otp_generator = require("otp-generator");
const nodemailer = require("nodemailer");
require("dotenv").config();
const bcrypt = require("bcrypt");

const load_login = async (req, res) => {
  try {
    return res.status(200).render("user/user_login", {
      message: "",
      show_message: true,
    });
  } catch (error) {
    console.log(`error while loading the login page ${error.message}`);
  }
};

const load_register = async (req, res) => {
  try {
    return res.status(200).render("user/user_register");
  } catch (error) {
    console.log(
      `error while loading the loding registration page ${error.message}`
    );
  }
};

const register_user = async (req, res) => {
  try {
    const { name, email, password, cpassword } = req.body;
    // console.log(`Registration details:`, name, email, password, cpassword);
    if (password !== cpassword) {
      return res.status(400);
    }
    const existing_user = await user.findOne({ email: email });
    if (existing_user) {
      return res.status(400).render("user/user_login", {
        message: "User already exist!. Please Login.",
      });
    }
    const otp = otp_generator.generate(6, {
      digits: true,
      alphabets: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log(`this is the generated otp`, otp);
    const otp_data = new user_otp({
      email: email,
      otpCode: otp,
    });
    await otp_data.save();
    req.session.form_data = { name, email, password, cpassword };
    // console.log("Session Data:", req.session.form_data);
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
      text: `Hello, your OTP code is ${otp}. It will be expire in 1 minute.`,
    };
    const sendMail = async () => {
      try {
        await transporter.sendMail(mailOptions);
        console.log("Email has been sent!");
      } catch (error) {
        console.log(error.message);
      }
    };
    await sendMail();
    return res.render("user/user_send_otp", {
      message: "OTP send to your Email",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const user_send_otp = async (req, res) => {
  try {
    return res.status(200).render("user/user_send_otp");
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

const verify_otp = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email, name, password } = req.session.form_data;

    const otp_data = await user_otp.findOne({ otpCode: otp, email });

    if (!otp_data) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
        success: false,
      });
    }

    const user_data = new user({
      name,
      email,
      password: await secure_password(password),
      is_admin: false,
    });
    await user_data.save();

    await user_otp.deleteOne({ email });

    console.log("User data saved to the database");

    return res.status(200).json({
      message: "OTP verified successfully",
      success: true,
    });
  } catch (err) {
    console.log("Error from verify OTP function:", err.message);
    return res.status(500).json({
      message: "Verification failed. Please try again.",
      success: false,
    });
  }
};

const resend_otp = async (req, res) => {
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

    await transporter.sendMail(mailOptions);
    console.log("OTP email has been sent");

    return res.status(200).json({
      message: "OTP has been sent to your email.",
      success: true,
    });
  } catch (error) {
    console.log(`Error resending OTP: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Failed to resend OTP.", success: false });
  }
};

const load_home_page = async (req, res) => {
  try {

    const products_list = await Product.find({ is_blocked: false })
      .populate("brand")
      .populate("category");

    return res.render("user/user_landing", { products_list });
  } catch (error) {
    console.log("error while rendering home page.");
  }
};

const login_user = async (req, res) => {
  try {

    console.log("req.body:", req.body)

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render("user/user_login", {
        message: "Please enter both email and password.",
        show_message: true,
      });
    }

    const user_data = await user.findOne({ email: email.trim() });

    if (!user_data) {
      return res.status(400).render("user/user_login", {
        message: "No user found! Please register first.",
        show_message: true,
      });
    }

    if (!user_data.is_active) {
      return res.status(400).render("user/user_login", {
        message: "Can't login, user has been blocked.",
        show_message: true,
      });
    }

    const password_match = await bcrypt.compare(
      password.trim(),
      user_data.password
    );
    if (!password_match) {
      return res.status(400).render("user/user_login", {
        message: "Invalid email or password.",
        show_message: true,
      });
    }

    req.session.user = user_data._id;
    console.log("user:",req.session.user)
    return res.status(200).redirect("/");
  } catch (error) {
    console.error("Error while logging in:", error.message);
    return res.status(500).render("user/user_login", {
      message: "Something went wrong. Please try again later.",
      show_message: true,
    });
  }
};

const user_logout = async (req, res) => {
  try {
    req.session.destroy();
    return res.status(204).redirect("/login");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const view_product = async (req, res) => {
  try {
    const productId = req.params.product_id;
    const product = await Product.findById(productId)
      .populate("category")
      .populate("brand");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).render("user/view_product", { product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const user_address = async (req, res) => {

  console.log("hello ba", req.body)
  
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
    const user_id = req.session.user || req.user;
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

    console.log("address added successfully.", address_data);


    const sourcePage = req.body.sourcePage;

    if(sourcePage === "checkout") {

      return res.redirect("/checkout")

    }

    return res.redirect("/user_profile")
  

  } catch (error) {

    console.log("error for adding address", error);

  }
};

const user_profile = async (req, res) => {
  try {
    const user_id = req.session.user 
    const id = await user.findById({ _id: user_id });
    const order = await orders.find();
    // console.log("user :", id);
    const addresses = await Address.find({ user: user_id });
    // console.log("data from the body address:",req.body)

    return res.render("user/user_profile", {
      addresses: addresses,
      id,
      orders: order,
    });
  } catch (error) {}
};


module.exports = {
  load_login,
  load_register,
  register_user,
  login_user,
  verify_otp,
  load_home_page,
  user_send_otp,
  resend_otp,
  user_logout,
  view_product,
  user_address,
  user_profile,
};
