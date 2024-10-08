const user = require("../../models/user_model")

const users_list = async (req, res) => {
    try {
      const users = await user.find({ is_admin: false });
      return res.status(200).render("admin/users", { user_data: users });
    } catch (error) {
      return res.status(500).json({ message: "Internal server side error." });
    }
  };
  
  const block_user = async (req, res) => {
    try {
      const { id, is_active } = req.body;
      const user_data = await user.findById(id);
  
      if (user_data) {
        await user.findByIdAndUpdate(id, { is_active });
  
        return res.status(200).json({
          success: true,
          message: `User ${is_active ? "unblocked" : "blocked"} successfully.`,
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  };

const orders = async (req, res) => {
    try {
        return res.status(200).render("admin/orders");
    } catch (error) {
        return res.status(500).json({message: error});
    }
}

  module.exports = {
  users_list,
  block_user,
  orders
}