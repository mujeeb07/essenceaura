const express = require("express");
const user_route = express.Router();
const passport = require("passport");


//controllers
const user_controller = require("../../controllers/user/user_controller");
const cart_controller = require("../../controllers/user/cart_controller");
const shop_page_controller = require("../../controllers/user/shop_page_controller");
const checkout_controller = require("../../controllers/user/checkout_controller");
const forgot_password_controller = require("../../controllers/user/forgot_password_controller");
const user_details = require("../../controllers/user/user_details_controller");
const wishlist_controller = require("../../controllers/user/wishlist_controller");
const razorpay_controller = require("../../controllers/user/razorpay_controller");
const wallet_controller = require("../../controllers/user/wallet_controller");
const order_controller =  require("../../controllers/user/orders_controller");
const check_referral = require('../../utils/validate_referral_code')

//middleware
const is_authenticated = require("../../middleware/auth");
const user_blocked = require("../../middleware/user_is_blocked");
const validate_referral_code = require("../../utils/validate_referral_code");

//user login
user_route.get("/", user_controller.load_home_page);
user_route.get("/login", user_controller.load_login);
user_route.post("/login", user_controller.login_user); 

//user register
user_route.get('/register', user_controller.load_register);
user_route.post('/register', user_controller.register_user);

// referral 
user_route.get('/check_referral/:referral_code', async (req, res) => {
    const { referral_code } = req.params;
    console.log(referral_code)
    await validate_referral_code(referral_code, res)
})
user_route.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }));
user_route.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: "/login", successRedirect: "/" }));

//home
user_route.get("/home", user_controller.load_home_page);

//OTP 
user_route.get("/otp", user_controller.user_send_otp);
user_route.post("/verify-otp", user_controller.verify_otp);
user_route.post("/resend-otp", user_controller.resend_otp);

//user logout
user_route.get("/logout", user_controller.user_logout);

//product details page.
user_route.get("/product/:product_id", user_controller.view_product);

//profile-address
user_route.post("/user_address", user_blocked, is_authenticated, user_controller.user_address);
user_route.delete('/delete_address/:id', user_blocked, is_authenticated, user_controller.delete_address);
user_route.get('/edit_address/:id', user_blocked, is_authenticated, user_controller.load_edit_address);
user_route.post('/edit_address/:id', user_blocked, is_authenticated, user_controller.edit_address);

//profile
user_route.get("/user_profile", user_blocked, is_authenticated, user_controller.user_profile);
user_route.post("/user_profile", user_blocked, is_authenticated, user_controller.user_profile);
user_route.get('/edit_profile_detials/:id', user_blocked, is_authenticated, user_details.edit_details);
user_route.post('/edit_profile_detials/:id', user_blocked, is_authenticated, user_details.post_edit_details);
user_route.get("/wallet", user_blocked, is_authenticated, wallet_controller.load_wallet);

//forgot password
user_route.get("/forgot_password", forgot_password_controller.load_forgot_password);
user_route.post("forgot_password/:id", forgot_password_controller.forgot_password);
user_route.post("/submit_forgot_password", forgot_password_controller.forgot_password);
user_route.get("/reset_password/:token", forgot_password_controller.load_reset_password);
user_route.post("/reset_password", forgot_password_controller.reset_password)

//cart
user_route.get("/shop_cart", user_blocked, is_authenticated,  cart_controller.load_shop_cart);
user_route.get("/cart/get-stock/:productId/:volume", user_blocked, is_authenticated, cart_controller.get_stock);
user_route.post("/shop_cart", user_blocked, is_authenticated, cart_controller.shop_cart); 
user_route.post("/cart/update-quantity", user_blocked, is_authenticated, cart_controller.update_quantity);
user_route.delete("/cart/remove/:id", user_blocked, is_authenticated, cart_controller.remove_item);

//wishlist
user_route.get('/wishlist', user_blocked, is_authenticated, wishlist_controller.load_wishlist);
user_route.post('/wishlist/add', user_blocked, is_authenticated, wishlist_controller.add_to_wishlist)
user_route.delete('/wishlist/remove', user_blocked, is_authenticated, wishlist_controller.wishlist_remove_item)

//shoping page
user_route.get("/shoping_page", shop_page_controller.load_shop_page);
user_route.post("/filter_products", shop_page_controller.filter_items);
user_route.get("/search-products", shop_page_controller.search_filter);

//checkout
user_route.get("/checkout", user_blocked, is_authenticated, checkout_controller.checkout);
user_route.post("/checkout", user_blocked, is_authenticated, checkout_controller.post_checkout);
user_route.get('/cart/validate_stock', user_blocked, is_authenticated, checkout_controller.validate_stock)
user_route.get('/order_confirmation', user_blocked, is_authenticated, checkout_controller.order_confirmation);
user_route.post('/apply_coupon', user_blocked, is_authenticated, checkout_controller.apply_coupon);
user_route.post('/remove_coupon', user_blocked, is_authenticated, checkout_controller.remove_coupon);

user_route.get("/verify_razorpay_payment", user_blocked, is_authenticated, razorpay_controller.verify_online_payment);

//order cancel or return operations 
user_route.get('/my_orders', user_blocked, is_authenticated, order_controller.load_my_orders);
user_route.post("/cancel_order/:order_id", user_blocked, is_authenticated, order_controller.cancel_order); //cancel full items
user_route.get("/order_details/:order_id", user_blocked, is_authenticated, order_controller.order_details);
user_route.post("/cancel_product", user_blocked, is_authenticated, order_controller.cancel_product)
user_route.post('/return_product', user_blocked, is_authenticated, order_controller.return_product);

module.exports = user_route;