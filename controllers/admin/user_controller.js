const user = require("../../models/user_model");
const Orders = require("../../models/order_model");

const users_list = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1 ;
      const users_per_page = 5;
      const total_users = await user.countDocuments();
      const total_pages = Math.ceil(total_users / users_per_page);

      const users = await user.find({ is_admin: false }).skip((page - 1) * users_per_page).limit(users_per_page);

      return res.status(200).render("admin/users", { user_data: users, current_page: page, total_pages: total_pages });
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
      const orders = await Orders.find().populate('user').sort({_id:-1});
      // console.log(orders);
      
        return res.status(200).render("admin/orders",  {orders}  );
    } catch (error) {
        return res.status(500).json({message: error});
    }
}

const load_order_details = async (req, res) => {
  const { id } = req.params;
  console.log("Order Id: ",id);
  try {
    const order_details = await Orders.findOne({_id:id}).populate('user')
    // console.log("fguyfvuyfvuy",order_details);
    return res.status(200).render('admin/order_details', { order_details })
  } catch (error) {
    
  }
}

const order_details = async(req, res) => {
  // console.log('...................Hello...................');
  const { orderId, status } = req.body
  console.log("status body: ", orderId, status);
  try {
    await Orders.findByIdAndUpdate(orderId, {order_status: status});

    return res.status(200).json({success: true});
  } catch (error) {
    console.log("order status error :", error);
    return res.status(500).json({ message:"Error while changing order status", success: false });
  }
}

  module.exports = {
  users_list,
  block_user,
  orders,
  load_order_details,
  order_details
}