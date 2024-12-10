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
const Wallet = require("../../models/wallet");
const Wallet_txns = require("../../models/wallet_transactions");




const checkout = async (req, res) => {
  try {
    const user_id = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    const appliedCoupon = req.session.coupon;
    const razorpay_key = process.env.RAZORPAY_ID;
    let address_message = req.session.address_message;
    req.session.address_message = null;
    // console.log("Adrress message from session:", address_message)
    const userData = await User_model.findById(user_id);
    const cartItems = await Cart.findOne({ user: user_id }).populate("item.product").exec();
    const addresses = await Address.find({ user: user_id });
    const coupons = await Coupons.find({ coupon_status: true, used_by: { $nin: [user_id] } });
    // console.log("Cart Data:", cartItems)

    let sub_total = 0;
    for( let i = 0; i < cartItems.item.length; i++){
        if(cartItems.item[i].offer_price !== null){
          sub_total += cartItems.item[i].offer_price * cartItems.item[i].quantity
        }else{
          sub_total += cartItems.item[i].price * cartItems.item[i].quantity
        }
    }

    sub_total.toFixed(2);
    const gst = parseFloat((sub_total * 0.18).toFixed(2));
    const grand_total = parseFloat((sub_total + gst).toFixed(2));

    let discount = 0;
    
    if (appliedCoupon && sub_total >= appliedCoupon.coupon_min_amount) {
      discount = Math.min(sub_total * (appliedCoupon.discount_percentage / 100), appliedCoupon.coupon_max_amount);
    }

    
    console.log("Address message before rendering:", address_message);
   
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
      razorpay_key,
      address_message
      
    });
    

  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ message: "checkout server error", error });
  }
};

const apply_coupon = async (req, res) => {
  let { selectedCoupon, total   } = req.body;
  total = Number(total);
try {
  if (!selectedCoupon) {
      return res.status(400).json({ success: false, message: 'No coupon selected' });
  }

  if (!selectedCoupon.coupon_status) {
      return res.status(400).json({ success: false, message: 'Coupon is inactive' });
  }

  const currentDate = new Date();
  const expirationDate = new Date(selectedCoupon.coupon_expires);
  if (expirationDate <= currentDate) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
  }

  if (total < selectedCoupon.coupon_min_amount) {
      return res.status(400).json({ 
          success: false, 
          message: `Minimum purchase of ₹${selectedCoupon.coupon_min_amount} is required for this coupon`
      });
  }

  req.session.coupon = selectedCoupon;
  
  const couponDiscount = Math.min(
      (total * selectedCoupon.discount_percentage) / 100, 
      selectedCoupon.coupon_max_amount
  );

  req.session.coupon_discounted = couponDiscount;

  total = (total - couponDiscount).toFixed(2);
  const user_id = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
  await Cart.findOneAndUpdate({ user: user_id }, 
    {
      $set: { coupon_amount: couponDiscount },
    },
    { new: true }
  )
  return res.status(200).json({ success: true, total });

} catch (error) {
  console.error('Error applying coupon:', error);
  return res.status(500).json({ success: false, message: 'An error occurred while applying the coupon' });
}

};

const remove_coupon = async (req, res) => {
  try {
    let { coupon_discount, total } = req.body;

    console.log("Remove coupon data:", coupon_discount, total);
    total = Number(total) + Number(coupon_discount);
    console.log("TOTAL:",typeof(total), total);
    req.session.coupon = null;
    req.session.coupon_discounted = 0;
    const user_id = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    await Cart.findOneAndUpdate({ user: user_id }, 
      { $set: { coupon_amount: 0 } }, { new: true } );
    return res.status(200).json({ success: true, total });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false })
  }
}

const post_checkout = async (req, res) => {
  try {

    const { payment, address, paymentId, final_amt } = req.body;
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    const coupon_discounted = req.session.coupon_discounted;
    const cart_data = await Cart.findOne({ user: user }).populate({ path: "item.product", populate: ["brand", "category"] });

    let subtotal = 0;
    for(let value of cart_data.item){
      subtotal += (value.offer_price ? value.offer_price : value.price  * value.quantity)
    }
    const delivery_charge = subtotal > 2500 ? 0 : 50;

    console.log("subtoal from same as the cart:", subtotal);
    let tax_amount = subtotal * 0.18.toFixed(2);
    const ordered_items = cart_data.item.map(item => ({
      product: {
        _id: item.product._id,
        name: item.product.name,
        description: item.product.description,
        product_card_image: item.product.product_card_image,
        variants: { volume: item.volume, price: item.offer_price ? item.offer_price : item.price },
        category: item.product.category,
        brand: item.product.brand,
      },
      quantity: item.quantity,
      price: item.offer_price ? item.offer_price : item.price
    }));

    const user_address = await Address.findOne({ _id: address });

    const order = new Order_model({
      user,
      shipping_address: user_address,
      items: ordered_items,
      payment_method: payment,
      sub_total: subtotal.toFixed(2),
      tax: tax_amount,
      discount_amount: coupon_discounted,
      total: final_amt ,
      order_status: 'Pending',
      delivery_charge: delivery_charge
    });

    let razorpay_order;

    if(order.payment_method === 'COD' && order.total > 2500){
      return res.status(400).json({message:'COD not available for order above ₹2500, Try other payment methods', success: false });
    }

    if (order.payment_method === 'online') {
      console.log('Total amount',order.total)
      razorpay_order = await create_razorpay_order( final_amt + delivery_charge );

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

    if(order.payment_method === 'wallet'){
      let wallet = await Wallet.findOne({ user_id: user });
      if(!wallet){
        const new_wallet = new Wallet({ user_id: user });
        wallet = await new_wallet.save();
        console.log("New Wallet created. Wallet Balance:", wallet.balance)
      }
      // console.log("User wallet data:", wallet)

      if(wallet.balance < Number(final_amt)){
        return res.status(400).json({ message:"Insufficient balance. Try another payment method", success: false });
      }

      wallet.balance -= Number(final_amt);
      console.log("Wallet balance after :", wallet.balance);
      const wallet_txns = new Wallet_txns({
        wallet_id: wallet._id,
        txn_amount: Number(final_amt + order.delivery_charge),
        txn_description: `Purchase Using wallet. Order ID : #"${order._id}"`,
        txn_type: 'Debit',
        wallet_transaction_status: 'Purchase'
      });
      await wallet_txns.save();
      await wallet.save();
    }

    order.total += order.delivery_charge;

    await order.save();

    await Cart.updateOne({ user: user }, { $set: { item: [] } });
    for(let item of order.items){
      let pId = item.product._id;
      let vol = item.product.variants.volume;
      let qty = item.quantity
      console.log("updating the stock, Product ID:", pId, " Product volume:", vol, " Product quantity:", qty)
      await Product.findOneAndUpdate(
        {_id: pId, "variants.volume": vol },
        {$inc: {"variants.$.stock": -qty }},
    )}
    

    req.session.order_id = order._id;
    return res.status(200).json({ message: "Order placed successfully", success: true });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ message: "Error while checking out" });
  }
};

const order_confirmation = async (req, res) => {
  try {
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    const order = await Order_model.findOne({ user: user }).sort({ createdAt: -1 });
    if (!order) {
      return res.status(404).json({ message: "Order not found", success: false });
    }

    const estimated_delivery = get_estimated_date();

    if (req.session.coupon) {
      await Coupons.updateOne({ _id: req.session.coupon._id }, { $push: { used_by: user } });
      req.session.coupon = null;
    }

    return res.status(200).render('user/order_confirmation', { order, estimated_delivery, cartItems: order.items, coupon_discount_amount: order.items.discount_amount });
  } catch (error) {
    console.error('Confirmation Error: ', error);
    return res.status(500).json({ message: "Error while rendering the order confirmation page.", error });
  }
};

module.exports = {
  checkout,
  post_checkout,
  order_confirmation,
  apply_coupon,
  remove_coupon
};
