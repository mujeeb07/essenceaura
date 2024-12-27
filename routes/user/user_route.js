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
//middlewareS
const is_authenticated = require("../../middleware/auth");
const user_blocked = require("../../middleware/user_is_blocked");
const validate_referral_code = require("../../utils/validate_referral_code");


//user login
user_route.get("/", user_controller.loadHomePage);
user_route.get("/login", user_controller.loadUserLoginPage);
user_route.post("/login", user_controller.userLogin); 

//user register
user_route.get('/register', user_controller.loadUserRegistrationPage);
user_route.post('/register', user_controller.registerNewUser);

// referral 
user_route.get('/check_referral/:referral_code', async (req, res) => {
    const { referral_code } = req.params;
    console.log(referral_code)
    await validate_referral_code(referral_code, res)
})
user_route.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }));
user_route.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: "/login", successRedirect: "/" }));

//home
user_route.get("/home", user_controller.loadHomePage);

//OTP 
user_route.get("/otp", user_controller.sendUserOtp);
user_route.post("/verify-otp", user_controller.otpVerification);
user_route.post("/resend-otp", user_controller.resendOtp);

//user logout
user_route.get("/logout", user_controller.logoutUser);

//product details page.
user_route.get("/product/:product_id", user_controller.displayProduct);

//profile-address
user_route.post("/user_address", user_blocked, is_authenticated, user_controller.userAddressDetails);
user_route.delete('/delete_address/:id', user_blocked, is_authenticated, user_controller.deleteUserAddress);
user_route.get('/edit_address/:id', user_blocked, is_authenticated, user_controller.loadEditAddressPage);
user_route.post('/edit_address/:id', user_blocked, is_authenticated, user_controller.updateAddress);

//profile
user_route.get("/user_profile", user_blocked, is_authenticated, user_controller.userProfileDetails);
user_route.post("/user_profile", user_blocked, is_authenticated, user_controller.userProfileDetails);
user_route.get('/edit_profile_detials/:id', user_blocked, is_authenticated, user_details.updateDetails);
user_route.post('/edit_profile_detials/:id', user_blocked, is_authenticated, user_details.saveEditedDetails);
user_route.get("/wallet", user_blocked, is_authenticated, wallet_controller.loadWalletPage);

//forgot password
user_route.get("/forgot_password", forgot_password_controller.loadForgotPasswordPage);
user_route.post("forgot_password/:id", forgot_password_controller.resetPassword);
user_route.post("/submit_forgot_password", forgot_password_controller.resetPassword);
user_route.get("/reset_password/:token", forgot_password_controller.loadPasswordResetPage);
user_route.post("/reset_password", forgot_password_controller.saveNewPassword)

//cart
user_route.get("/shop_cart", user_blocked, is_authenticated,  cart_controller.loadShoppingCart);
user_route.get("/cart/get-stock/:productId/:volume", user_blocked, is_authenticated, cart_controller.checkStockLevel);
user_route.post("/shop_cart", user_blocked, is_authenticated, cart_controller.shoppingCart); 
user_route.post("/cart/update-quantity", user_blocked, is_authenticated, cart_controller.updateItemQuantity);
user_route.delete("/cart/remove/:id", user_blocked, is_authenticated, cart_controller.removeFromCart);

//wishlist
user_route.get('/wishlist', user_blocked, is_authenticated, wishlist_controller.loadWishlistPage);
user_route.post('/wishlist/add', user_blocked, is_authenticated, wishlist_controller.addItemToWishlist)
user_route.delete('/wishlist/remove', user_blocked, is_authenticated, wishlist_controller.removeItemFromWishlist)

//shoping page
user_route.get("/shoping_page", shop_page_controller.loadShopPage);
user_route.post("/filter_products", shop_page_controller.filterProducts);
user_route.get("/search-products", shop_page_controller.filterSearchResults);

//checkout
user_route.get("/checkout", user_blocked, is_authenticated, checkout_controller.loadCheckoutPage);
user_route.post("/checkout", user_blocked, is_authenticated, checkout_controller.processCheckout);
user_route.get('/cart/validate_stock', user_blocked, is_authenticated, checkout_controller.checkStockAvailability)
user_route.get('/order_confirmation', user_blocked, is_authenticated, checkout_controller.loadOrderConfirmationPage);
user_route.post('/decline_payment', user_blocked, is_authenticated, checkout_controller.cancelPayment)
user_route.post('/apply_coupon', user_blocked, is_authenticated, checkout_controller.applyDiscountCoupon);
user_route.post('/remove_coupon', user_blocked, is_authenticated, checkout_controller.removeDiscountCoupon);

user_route.get("/verify_razorpay_payment", user_blocked, is_authenticated, razorpay_controller.verifyOnlinePayment);

//order cancel or return operations 
user_route.get('/my_orders', user_blocked, is_authenticated, order_controller.showMyOrders);
user_route.post("/cancel_order/:order_id", user_blocked, is_authenticated, order_controller.cancelOrder); //cancel full items
user_route.get("/order_details/:order_id", user_blocked, is_authenticated, order_controller.orderDetails);
user_route.post("/cancel_product", user_blocked, is_authenticated, order_controller.cancelProduct)
user_route.post('/return_product', user_blocked, is_authenticated, order_controller.returnProduct);
user_route.post("/orders_retrypayment", user_blocked, is_authenticated, order_controller.retryOrderPayment);
user_route.post('/update_order', user_blocked, is_authenticated, order_controller.updateOrderStatus)



module.exports = user_route;