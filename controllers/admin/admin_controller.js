const user = require("../../models/user_model");
const bcrypt = require("bcrypt");

const admin_login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin_data = await user.findOne({ email: email.trim() });
    const password_match = await bcrypt.compare(
      password.trim(),
      admin_data?.password
    );
    if (password_match && admin_data?.is_admin) {
      req.session.admin = admin_data._id  
      return res.status(200).render("admin/admin_dashboard");
    } else {
      return res
        .status(400)
        .render("admin/admin_login", { message: "Invalid Attempt" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const load_admin_login = async (req, res) => {
  try {
    return res.status(200).render("admin/admin_login", { message: "" });

  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const admin_dashboard = async (req, res) => {
  try {
    return res.status(200).render("admin/admin_dashboard");
  } catch (error) {
    return res
      .status(500)
      .json("admin dashboard controller error", error.message);
  }
};

const admin_logout = async (req, res) => {
  try {
    req.session.destroy();
    return res.status(204).redirect("/admin");
  } catch (error) {
    console.log(error)
    return res.status(500).json({message:"admin logout controller error"})
  }
}


module.exports = {
  admin_login,
  load_admin_login,
  admin_dashboard,
  admin_logout
};
