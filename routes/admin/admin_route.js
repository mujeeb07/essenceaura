const express = require("express");
const admin_route = express.Router();
const admin_controller = require("../../controllers/admin/admin_controller");
const brand_controller = require("../../controllers/admin/brand_controller");
const product_controller = require('../../controllers/admin/product_controller');
const category_controller = require("../../controllers/admin/category_controller");
const user_controller = require("../../controllers/admin/user_controller");
const admin_auth = require("../../middleware/admin_auth")

// Admin.
admin_route.get("/", admin_controller.load_admin_login);
admin_route.post("/", admin_controller.admin_login);
admin_route.get('/dashboard', admin_auth, admin_controller.admin_dashboard);
admin_route.get("/admin/logout", admin_controller.admin_logout)

//users
admin_route.get('/users', admin_auth, user_controller.users_list);
admin_route.post("/block_user", admin_auth, user_controller.block_user);
admin_route.get("/orders", admin_auth, user_controller.orders)


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



module.exports = admin_route;
