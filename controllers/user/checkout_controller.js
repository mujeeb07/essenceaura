require('dotenv').config();
const Cart = require("../../models/cart_model");
const Product = require("../../models/product_model");
const mongoose = require("mongoose");
const Address = require("../../models/address_model");
const Order_model = require("../../models/order_model");
const User_model = require('../../models/user_model');
const Coupons = require('../../models/coupon_model');
const transaction_model = require('../../models/online_transaction_model')
const { create_razorpay_order, verify_razorpay_signature, verify_online_payment } = require("../../controllers/user/razorpay_controller");
const { get_estimated_date } = require("../../utils/estimate_date");


const checkout = async (req, res) => {
  try {
    const user_id = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    const appliedCoupon = req.session.coupon;
    const razorpay_key = process.env.RAZORPAY_ID;

    const userData = await User_model.findById(user_id);
    const cartItems = await Cart.findOne({ user: user_id }).populate("item.product").exec();
    const addresses = await Address.find({ user: user_id });
    const coupons = await Coupons.find({ coupon_status: true, used_by: { $nin: [user_id] } });
    console.log('CART:',cartItems.item[0]);
    // if(cartItems.item[0].product.)
    const sub_total = cartItems.item.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = parseFloat((sub_total * 0.18).toFixed(2));
    const grand_total = parseFloat((sub_total + gst).toFixed(2));
    
    console.log("Calculated totals:", { sub_total, gst, grand_total });

    if( sub_total === 0 || gst === 0 || grand_total === 0 ){
      return res.status(400).json({message:"Someting Went Wrong", success: false });
    }

    let discount = 0;

    if (appliedCoupon && sub_total >= appliedCoupon.coupon_min_amount) {
      discount = Math.min(sub_total * (appliedCoupon.discount_percentage / 100), appliedCoupon.coupon_max_amount);
    }

    return res.status(200).render("user/check_out", {
      cartItems: cartItems.item,
      addresses,
      coupons,
      grand_total: grand_total,
      gst,
      sub_total,
      discount,
      appliedCoupon,
      userData,
      razorpay_key
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ message: "checkout server error", error });
  }
};

const apply_coupon = async (req, res) => {
  let { selectedCoupon, total   } = req.body;
  console.log("Selected Coupon : ", selectedCoupon, "Total Amount : ", total)

  let coupon_max_dicount_amount = Math.min(Number(selectedCoupon.coupon_max_amount), total * selectedCoupon.discount_percentage );
  console.log("abcdefgh :", coupon_max_dicount_amount)
  try {
    if (selectedCoupon && selectedCoupon.coupon_status && new Date(selectedCoupon.coupon_expires) > new Date() && total >= selectedCoupon.coupon_min_amount) {
      req.session.coupon = selectedCoupon; 

      total  = (Number(total) - coupon_max_dicount_amount).toFixed(2);
      console.log("Total amunt after discount : ", total);
      return res.status(200).json({ success: true,total  });
    } else {
      return res.status(400).json({ success: false });
    }
  } catch (error) {
    console.error('Error applying coupon:', error);
    return res.status(500).json({ success: false, message: 'Invalid coupon' });
  }
};

const post_checkout = async (req, res) => {
  try {
    const { payment, address, paymentId, total } = req.body;
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    const cart_data = await Cart.findOne({ user: user }).populate({ path: "item.product", populate: ["brand", "category"] });

    const sub_total = cart_data.item.reduce((total, item) => {
      const selected_variant = item.product.variants.find(variant => variant.volume === item.volume);
      const variant_price = selected_variant ? selected_variant.price : 0;
      return total + item.quantity * variant_price;
    }, 0);
    const tax = parseFloat((sub_total * 0.18).toFixed(2));
    const total_before_discount = sub_total + tax;

    let coupon_discount = 0;
    const appliedCoupon = req.session.coupon;
    if (appliedCoupon && sub_total >= appliedCoupon.coupon_min_amount) {
      const percentage_discount = sub_total * (appliedCoupon.discount_percentage / 100);
      coupon_discount = Math.min(percentage_discount, appliedCoupon.coupon_max_amount);
    }

    console.log('Total before discount : ', total_before_discount);

    const total_after_discount = total_before_discount - coupon_discount;

    console.log('Total After Discount : ', total_after_discount);

    const ordered_items = cart_data.item.map(item => ({
      product: {
        _id: item.product._id,
        name: item.product.name,
        description: item.product.description,
        product_card_image: item.product.product_card_image,
        variants: { volume: item.volume, price: item.price },
        category: item.product.category,
        brand: item.product.brand,
      },
      quantity: item.quantity,
      price: item.price,
    }));

    const user_address = await Address.findOne({ _id: address });

    const order = new Order_model({
      user,
      shipping_address: user_address,
      items: ordered_items,
      payment_method: payment,
      sub_total,
      tax,
      discount_amount: coupon_discount,
      total: total_after_discount,
      order_status: 'Pending',
    });

    // console.log("Order details :", order);
    // console.log("Applied coupon : ", appliedCoupon);

    let razorpay_order;

    if (order.payment_method === 'online') {
      console.log('Total amount',order.total)
      razorpay_order = await create_razorpay_order( total );

      console.log('razorpay order data: ',razorpay_order)
      const is_verified = verify_razorpay_signature(order._id, paymentId, razorpay_order.signature);
      if (!is_verified) {
        return res.status(400).json({ message: "Payment verification failed", success: false });
      }

      const online_transaction = new transaction_model ({
        user_id: user,
        order_id: order._id,
        payment_provider: 'razorpay',
        online_payment_order_id: razorpay_order.id,
        amount: razorpay_order.amount / 100,
        currency: razorpay_order.currency,
        payment_status: 'Paid'
      });
  
      await online_transaction.save();
     
      console.log("Razorpay Order data : ", razorpay_order);
    }

    await order.save();

    await Cart.updateOne({ user: user }, { $set: { item: [] } });
    req.session.order_id = order._id;
    // console.log("session data:", req.session);
    return res.status(200).json({ message: "Order placed successfully", success: true });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ message: "Error while checking out", error });
  }
};


const order_confirmation = async (req, res) => {
  try {

    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    const order = await Order_model.findOne({ user: user }).sort({ createdAt: -1 });

    console.log('Order total:', order);
    // console.log('Amount paid:', tot)

    if (!order) {
      return res.status(404).json({ message: "Order not found", success: false });
    }

    const estimated_delivery = get_estimated_date();

    if (req.session.coupon) {
      await Coupons.updateOne({ _id: req.session.coupon._id }, { $push: { used_by: user } });
      req.session.coupon = null;
    }

    return res.status(200).render('user/order_confirmation', { order, estimated_delivery, cartItems: order.items, coupon_discount_amount: order.discount_amount });
  } catch (error) {
    console.error('Confirmation Error: ', error);
    return res.status(500).json({ message: "Error while rendering the order confirmation page.", error });
  }
};

module.exports = {
  checkout,
  post_checkout,
  order_confirmation,
  apply_coupon
};
