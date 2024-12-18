const mongoose = require('mongoose');
const ObjectId =  mongoose.Types.ObjectId;
const user = require("../../models/user_model");
const Orders = require("../../models/order_model");
const Product = require("../../models/product_model");
const Wallet = require("../../models/wallet")
const Wallet_txns = require('../../models/wallet_transactions');

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
        const perPage = 6;
        const page = parseInt(req.query.page) || 1;

        const totalOrders = await Orders.countDocuments();
        const totalPages = Math.ceil(totalOrders / perPage); 

        const orders = await Orders.find().populate('user').sort({ _id: -1 }).skip((page - 1) * perPage).limit(perPage);

        return res.status(200).render("admin/orders", {
            orders,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};


const load_order_details = async (req, res) => {
  const { id } = req.params;
  try {
    const order_details = await Orders.findOne({_id:id}).populate('user')
    
    return res.status(200).render('admin/order_details', { order_details })
  } catch (error) {
    console.log("Error while getting the orders details.", error);
    return res.status(500).json({ message: "Error while getting the orders details.", success: false });
    
  }
}

const order_details = async(req, res) => {
  const { orderId, status } = req.body
  try {
    let order_data = await Orders.findByIdAndUpdate(orderId, {order_status: status});
    order_data.items.forEach((i) => {
      i.product.return_request = status;
    })
    await order_data.save();

    return res.status(200).json({success: true});
  } catch (error) {
    console.log("order status error :", error);
    return res.status(500).json({ message:"Error while changing order status", success: false });
  }
}

const returns = async (req, res) => {
  try {
    const perPage = 6;
    const page = parseInt(req.query.page) || 1; 

    const totalReturns = await Orders.countDocuments({ "items.product.return_request": "Return Initiated" }); 
    const totalPages = Math.ceil(totalReturns / perPage); 

    const orders = await Orders.find({
      "items.product.return_request": { $in: ["Return Initiated", "Return Approved", "Return Rejected"] }
  }).populate('user').sort({ _id: -1 }).skip((page - 1) * perPage).limit(perPage);
  

    orders.forEach((order) => {
      order.items.forEach(async (i) => {
        i.price = (i.price * 0.18 + i.price) * order.discount_amount / order.total;
        // await order.save(); 
      })
    });
    return res.status(200).render("admin/return_management", { orders, currentPage: page, totalPages });
  } catch (error) {
    console.log("Error while rendering the return management page.", error);
    return res.status(500).json({ message: "Error while getting the return management page.", success: false });
  }
};

const return_action = async(req, res) => {
  try {

    const { orderId, itemId, variant, status, quantity, reason } = req.body;
    let order_data = await Orders.findById( new ObjectId(orderId) );
    let price = 0;
    let product_name = '';
    if(status === 'Approve'){
      for (let item of order_data.items) {
        if(String(order_data._id) === orderId){
          price = item.product.variants.price * item.quantity;
          product_name = item.product.name;
          price += price * 0.18;
          let discount = (price * order_data.discount_amount) / order_data.total + order_data.discount_amount
          price -= discount;
          item.product.return_request = "Return Approved";
        }
      }
      await order_data.save();
      
      const wallet = await Wallet.findOne({ user_id : order_data.user });
      console.log(wallet)
      if(!wallet){
        const new_wallet = new Wallet({ user_id: order_data.user });
        wallet = await new_wallet.save();
      }

      wallet.balance += price;
      await wallet.save();

      const new_wallet_txn = new Wallet_txns({
        wallet_id: wallet._id,
        txn_amount: Number(price),
        txn_description: `Refunded for the item returned "${product_name}." `,
        txn_type: "Credit",
        wallet_transaction_status: "Refunded"
      });

      await new_wallet_txn.save();
    } 
    
    if(status === 'Reject'){
      for (let item of order_data.items) {
        if(String(order_data._id) === orderId){
          item.product.return_request = "Return Rejected";
        }
      }
    }
    await order_data.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log('Error while updating return action.', error);
    return res.status(500).json({ success: false });
  }
}

const return_qty_update = async (req, res) => {
  try {
    const { itemId, variant, quantity } = req.body;

    let product_to_update = await Product.findById( new ObjectId(itemId) );
    let price;
    // console.log("PRODUCT DATA TO UPDATE:", product_to_update);
    product_to_update.variants.forEach((i) => {
      if(i.volume === Number(variant)){
        i.stock += Number(quantity)
      }
    });

    await product_to_update.save();
    
    return res.status(200).json({ success:true })
  } catch (error) {
    console.log('Error while updating returned item quantity.', error);
    return res.status(200).json({ success: false });
  }
}

  module.exports = {
  users_list,
  block_user,
  orders,
  load_order_details,
  order_details,
  returns,
  return_action,
  return_qty_update
}