const express = require("express");
const admin_route = express.Router();
const admin_controller = require("../../controllers/admin/admin_controller");
const brand_controller = require("../../controllers/admin/brand_controller");
const product_controller = require('../../controllers/admin/product_controller');
const category_controller = require("../../controllers/admin/category_controller");
const user_controller = require("../../controllers/admin/user_controller");
const coupon_controller = require('../../controllers/admin/coupon_controller');
const offer_controller = require("../../controllers/admin/offer_controller");
const admin_auth = require("../../middleware/admin_auth");

// Admin.
admin_route.get("/", admin_controller.load_admin_login);
admin_route.post("/", admin_controller.admin_login);
admin_route.get('/dashboard', admin_auth, admin_controller.admin_dashboard);
admin_route.get("/logout", admin_controller.admin_logout);

//users
admin_route.get('/users', admin_auth, user_controller.users_list);
admin_route.post("/block_user", admin_auth, user_controller.block_user);

//Order
admin_route.get("/orders", admin_auth, user_controller.orders);
admin_route.get("/order_details/:id", admin_auth, user_controller.load_order_details);
admin_route.post("/update_order_status", admin_auth, user_controller.order_details);

//Return Management
admin_route.get("/return_management", admin_auth, user_controller.returns);
admin_route.post("/returns/update", admin_auth, user_controller.return_action);
admin_route.post("/return_qty_update", admin_auth, user_controller.return_qty_update);

// Brand
admin_route.get('/brands', admin_auth, brand_controller.load_brands);
admin_route.get('/add_new_brand', admin_auth, brand_controller.load_add_new_brand);
admin_route.post('/add_new_brand', admin_auth, brand_controller.add_new_brand);
admin_route.get('/edit_brand/:id', admin_auth, brand_controller.load_edit_brand);
admin_route.post('/edit_brand/:id', admin_auth, brand_controller.edit_brand);

// Product
admin_route.get('/load_add_product', admin_auth, product_controller.load_add_product);
admin_route.post('/add_product', admin_auth, product_controller.add_product);
admin_route.get('/admin_list_product', admin_auth, product_controller.load_list_product);
admin_route.get('/edit_product/:id', admin_auth, product_controller.load_edit_product);
admin_route.post('/edit_product/:id', admin_auth, product_controller.edit_product);

// Category
admin_route.get("/categories", admin_auth, category_controller.categories);
admin_route.post("/add_category", admin_auth, category_controller.add_category);
admin_route.get('/get_category', admin_auth, category_controller.get_categories);
admin_route.get('/get_category/:id', admin_auth, category_controller.get_category_by_id);
admin_route.put('/update_category/:id', admin_auth, category_controller.update_category);
admin_route.put('/soft_delete_category/:id', admin_auth, category_controller.soft_delete_category);

// Coupon
admin_route.get('/coupon_management', admin_auth, coupon_controller.load_coupon_management);
admin_route.get('/create_coupon', admin_auth, coupon_controller.load_coupon_create_page);
admin_route.post('/activation', admin_auth, coupon_controller.activation_coupon);
admin_route.post('/create_coupon', admin_auth, coupon_controller.coupon_create_page);
admin_route.get('/edit_coupon', admin_auth, coupon_controller.edit_coupon);
admin_route.post('/edit_coupon', admin_auth, coupon_controller.update_coupon);

// Offer management
admin_route.get('/offer_management',  admin_auth, offer_controller.load_offer_management);
admin_route.get('/create_offer', admin_auth, offer_controller.load_create_offer);
admin_route.post('/create_offer', admin_auth, offer_controller.create_offer);
admin_route.get('/edit_offer/:id', admin_auth, offer_controller.load_edit_offer);
admin_route.post('/edit_offer', admin_auth, offer_controller.update_offer);

//Sales report
admin_route.get('/create_sales_report', admin_auth, admin_controller.load_create_sales_report);

//Diagram 
admin_route.get('/daily_sales', admin_auth, admin_controller.daily_sales_data)
admin_route.get('/weekly_sales', admin_auth, admin_controller.weekly_sales_data)
admin_route.get('/monthly_sales', admin_auth, admin_controller.monthly_sales_data)
admin_route.get('/yearly_sales', admin_auth, admin_controller.yearly_sales_data)

module.exports = admin_route;