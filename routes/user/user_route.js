//express
const express = require("express");
const user_route = express.Router();
//controllers
const user_controller = require("../../controllers/user/user_controller");
const cart_controller = require("../../controllers/user/cart_controller");
const shop_page_controller = require("../../controllers/user/shop_page_controller");
const checkout_controller = require("../../controllers/user/checkout_controller");
const passport = require("passport");
//middleware
const is_authenticated = require("../../middleware/auth");
const user_blocked = require("../../middleware/user_is_blocked");

//user
user_route.get("/", user_controller.load_home_page);
user_route.get("/login", user_controller.load_login);
user_route.post("/login", user_controller.login_user); 
user_route.get('/register', user_controller.load_register);
user_route.post('/register', user_controller.register_user);
user_route.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }));
user_route.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: "/login" }), (req, res) => {
    res.redirect('/home');
});
user_route.get("/home", user_controller.load_home_page);
user_route.get("/otp", user_controller.user_send_otp);
user_route.post("/verify-otp", user_controller.verify_otp);
user_route.post("/resend-otp", user_controller.resend_otp);
user_route.get("/logout", user_controller.user_logout);
user_route.get("/product/:product_id", user_controller.view_product);
user_route.post("/user_address", user_blocked,is_authenticated, user_controller.user_address);
user_route.get("/user_profile", user_blocked,is_authenticated, user_controller.user_profile);
user_route.post("/user_profile", user_blocked,is_authenticated, user_controller.user_profile);

//cart
user_route.get("/shop_cart", user_blocked,is_authenticated,  cart_controller.load_shop_cart);
user_route.post("/shop_cart", user_blocked,is_authenticated, cart_controller.shop_cart); 
user_route.post("/cart/update-quantity", user_blocked,is_authenticated, cart_controller.update_quantity);
user_route.delete("/cart/remove/:id", user_blocked,is_authenticated, cart_controller.remove_item);

//shoping page
user_route.get("/shoping_page", shop_page_controller.load_shop_page);
user_route.post("/filter_products", shop_page_controller.filter_items);

//checkout
user_route.get("/checkout", user_blocked,is_authenticated, checkout_controller.checkout);
user_route.post("/checkout", user_blocked,is_authenticated, checkout_controller.post_checkout);


module.exports = user_route;