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
const statusCode = require('../../constance/statusCodes')

const loadCheckoutPage = async (req, res) => {
  try {
    const user_id = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    const appliedCoupon = req.session.coupon;
    const razorpay_key = process.env.RAZORPAY_ID;
    let address_message = req.session.address_message;
    req.session.address_message = null;
    const userData = await User_model.findById(user_id);
    const cartItems = await Cart.findOne({ user: user_id }).populate("item.product").exec();
    const addresses = await Address.find({ user: user_id });
    const coupons = await Coupons.find({ coupon_status: true, used_by: { $nin: [user_id] } });

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
   
    return res.status(statusCode.SUCCESS).render("user/check_out", {
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
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "checkout server error", error });
  }
};

const applyDiscountCoupon = async (req, res) => {
  let { selectedCoupon, total   } = req.body;
  
  total = Number(total);
try {
  if (!selectedCoupon) {
      return res.status(statusCode.BAD_REQUEST).json({ success: false, message: 'No coupon selected' });
  }

  if (!selectedCoupon.coupon_status) {
      return res.status(statusCode.BAD_REQUEST).json({ success: false, message: 'Coupon is inactive' });
  }

  const currentDate = new Date();
  const expirationDate = new Date(selectedCoupon.coupon_expires);
  if (expirationDate <= currentDate) {
      return res.status(statusCode.BAD_REQUEST).json({ success: false, message: 'Coupon has expired' });
  }

  if (total < selectedCoupon.coupon_min_amount) {
      return res.status(statusCode.BAD_REQUEST).json({ 
          success: false, 
          message: `Minimum purchase of ₹${selectedCoupon.coupon_min_amount} is required for this coupon`
      });
  }

  req.session.coupon = selectedCoupon;
  
  const couponDiscount = Math.min( (total * selectedCoupon.discount_percentage) / 100, selectedCoupon.coupon_max_amount );
  
  req.session.coupon_discounted = couponDiscount;

  let a = (total - couponDiscount).toFixed(2);
  
  total = a
  

  const user_id = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
  await Cart.findOneAndUpdate({ user: user_id }, 
    {
      $set: { coupon_amount: couponDiscount },
    },
    { new: true }
  )
  return res.status(statusCode.SUCCESS).json({ success: true, total, couponDiscount});

} catch (error) {
  console.error('Error applying coupon:', error);
  return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: 'An error occurred while applying the coupon' });
}

};

const removeDiscountCoupon = async (req, res) => {
  try {
    let { couponDiscount, finalAmount } = req.body;
    
    finalAmount = Number(finalAmount) + Number(couponDiscount);
    
    req.session.coupon = null;
    req.session.coupon_discounted = 0;
    const user_id = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    await Cart.findOneAndUpdate({ user: user_id }, 
      { $set: { coupon_amount: 0 } }, { new: true } );
    return res.status(statusCode.SUCCESS).json({ success: true, finalAmount });
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message:"An error occured while remove coupon", success: false })
  }
}

const processCheckout = async (req, res) => {
  try {
    const { payment, address, paymentId, final_amt } = req.body;
    console.log("ertyudfgh",address)
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    const coupon_discounted = req.session.coupon_discounted;
    const cart_data = await Cart.findOne({ user: user }).populate({ path: "item.product", populate: ["brand", "category"] });

    let subtotal = 0;
    for(let value of cart_data.item){
      subtotal += (value.offer_price ? value.offer_price : value.price  * value.quantity)
    }
    const delivery_charge = subtotal > 2500 ? 0 : 50;

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
    console.log("first",user_address)

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
      delivery_charge: delivery_charge,
      razorpay_payment_id:paymentId,
    });


    let razorpay_order;

    if(order.payment_method === 'COD' && order.total > 2500){
      return res.status(statusCode.BAD_REQUEST).json({message:'COD not available for order above ₹2500, Try other payment methods', success: false });
    }

    if (order.payment_method === 'online') {
      razorpay_order = await create_razorpay_order( final_amt + delivery_charge );
      const is_verified = verify_razorpay_signature(order._id, paymentId, razorpay_order.signature);
      if (!is_verified) {
        return res.status(statusCode.BAD_REQUEST).json({ message: "Payment verification failed", success: false });
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

      const txn = await transaction_model.findOne({ order_id: order._id });
      if(txn.payment_status === 'Failed'){
        order.payment_status = 'pending';
      }
      order.payment_status = 'completed';
      await order.save()
    }

    if(order.payment_method === 'wallet'){
      let wallet = await Wallet.findOne({ user_id: user });
      if(!wallet){
        const new_wallet = new Wallet({ user_id: user });
        wallet = await new_wallet.save();
      }

      if(wallet.balance < Number(final_amt)){
        return res.status(statusCode.BAD_REQUEST).json({ message:"Insufficient balance. Try another payment method", success: false });
      }

      wallet.balance -= Number(final_amt);
      const wallet_txns = new Wallet_txns({
        wallet_id: wallet._id,
        txn_amount: Number(final_amt + order.delivery_charge),
        txn_description: `Purchase Using wallet. Order ID : #"${order._id}"`,
        txn_type: 'Debit',
        wallet_transaction_status: 'Purchase'
      });
      await wallet_txns.save();
      await wallet.save();
      order.payment_status = 'completed';
      await order.save()
    }

    order.total += order.delivery_charge;

    await order.save();

    await Cart.updateOne({ user: user }, { $set: { item: [] } });
    for(let item of order.items){
      let pId = item.product._id;
      let vol = item.product.variants.volume;
      let qty = item.quantity;

      await Product.findOneAndUpdate(
        {_id: pId, "variants.volume": vol },
        {$inc: {"variants.$.stock": -qty }},
      )
    }
    
    req.session.order_id = order._id;
    return res.status(statusCode.SUCCESS).json({ message: "Order placed successfully", success: true });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "Error while placing out" });
  }
};

const checkStockAvailability = async (req, res) => {
  try {
    const user_id = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    
    const cart = await Cart.findOne({ user: user_id }).populate('item.product');

    if (!cart || cart.item.length === 0) {
      return res.status(statusCode.NOT_FOUND).json({ message: 'Cart is empty.' });
    }

    const itemsWithStock = cart.item.map(i => {
      const product = i.product;
      if (!product || !product.variants) {
        return { name: "Unknown Product", volume: i.volume, quantity: i.quantity, stock: 0 };
      }

      const variant = product.variants.find(v => v.volume === i.volume);
      return {
        name: product.name,
        volume: i.volume,
        quantity: i.quantity,
        stock: variant ? variant.stock : 0,
      };
    });

    return res.json({ items: itemsWithStock });
  } catch (error) {
    console.error('Error validating stock:', error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
  }
};
 

const loadOrderConfirmationPage = async (req, res) => {
  try {
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    const order = await Order_model.findOne({ user: user }).sort({ createdAt: -1 });
    if (!order) {
      return res.status(statusCode.NOT_FOUND).json({ message: "Order not found", success: false });
    }

    const estimated_delivery = get_estimated_date();

    if (req.session.coupon) {
      await Coupons.updateOne({ _id: req.session.coupon._id }, { $push: { used_by: user } });
      req.session.coupon = null;
    }

    return res.status(statusCode.SUCCESS).render('user/order_confirmation', { order, estimated_delivery, cartItems: order.items, coupon_discount_amount: order.items.discount_amount });
  } catch (error) {
    console.error('Confirmation Error: ', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "Error while rendering the order confirmation page.", error });
  }
};


const cancelPayment = async (req, res) => {
  try {
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    const { address, finalAmount, isCouponApplied,  couponDiscount } = req.body
    const cart_data = await Cart.findOne({ user: user }).populate({ path: "item.product", populate: ["brand", "category"] });
    let subtotal = 0;
    for(let value of cart_data.item){
      subtotal += (value.offer_price ? value.offer_price : value.price  * value.quantity)
    }
    const delivery_charge = subtotal > 2500 ? 0 : 50;

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
      payment_method: 'online',
      sub_total: subtotal.toFixed(2),
      tax: tax_amount,
      discount_amount: couponDiscount,
      total: finalAmount ,
      order_status: 'Not-Confirmed',
      payment_status:'pending',
      delivery_charge: delivery_charge
    });

    await order.save();
    
    await Cart.updateOne({ user: user }, { $set: { item: [] } });

    return res.status(statusCode.SUCCESS).json({ message: 'Order payment failed. Cart cleared.' });
  } catch (error) {
      console.error('Error in decline payment:', error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to process decline payment request.' });
  }
};


module.exports = {
  loadCheckoutPage,
  processCheckout,
  loadOrderConfirmationPage,
  applyDiscountCoupon,
  removeDiscountCoupon,
  checkStockAvailability,
  cancelPayment
};
