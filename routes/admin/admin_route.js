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

// ADMIN_CONTROLLERS
//admin
admin_route.get("/", admin_controller.showAdminLogin);
admin_route.post("/", admin_controller.adminLogin);
admin_route.get('/dashboard', admin_auth, admin_controller.adminDashboard);
admin_route.get("/logout", admin_controller.adminLogout);
//Sales report
admin_route.get('/create_sales_report', admin_auth, admin_controller.loadSalesReportCreationPage);
admin_route.get('/sales_report_table', admin_auth, admin_controller.salesReportTable);
//Diagram 
admin_route.get('/daily_sales', admin_auth, admin_controller.dailySalesReport);
admin_route.get('/weekly_sales', admin_auth, admin_controller.weeklySalesReport);
admin_route.get('/monthly_sales', admin_auth, admin_controller.monthlySalesReport);
admin_route.get('/yearly_sales', admin_auth, admin_controller.yearlySalesReport);


//USER_CONTROLLERS
//users
admin_route.get('/users', admin_auth, user_controller.usersList);
admin_route.post("/block_user", admin_auth, user_controller.blockUser);
//Order
admin_route.get("/orders", admin_auth, user_controller.orders);
admin_route.get("/order_details/:id", admin_auth, user_controller.getOrderDetails );
admin_route.post("/update_order_status", admin_auth, user_controller.orderDetails);
//Return Management
admin_route.get("/return_management", admin_auth, user_controller.returns);
admin_route.post("/returns/update", admin_auth, user_controller.handleReturn );
admin_route.post("/return_qty_update", admin_auth, user_controller.updateReturnQuantity );


// BRAND_CONTROLLERS
admin_route.get('/brands', admin_auth, brand_controller.getBrands );
admin_route.get('/add_new_brand', admin_auth, brand_controller.loadBrandCreation );
admin_route.post('/add_new_brand', admin_auth, brand_controller.createBrand );
admin_route.get('/edit_brand/:id', admin_auth, brand_controller.loadBrandEditor );
admin_route.post('/edit_brand/:id', admin_auth, brand_controller.updateBrand );



// PRODUCT_CONTRIOLLERS
admin_route.get('/load_add_product', admin_auth, product_controller.showAddProductPage);
admin_route.post('/add_product', admin_auth, product_controller.addNewProduct);
admin_route.get('/admin_list_product', admin_auth, product_controller.loadProductList);
admin_route.get('/edit_product/:id', admin_auth, product_controller.loadProductEditor);
admin_route.post('/edit_product/:id', admin_auth, product_controller.updateProduct);

// CATEGORY_CONTROLLERS
admin_route.get("/categories", admin_auth, category_controller.categories);
admin_route.post("/add_category", admin_auth, category_controller.createCategory);
admin_route.get('/get_category', admin_auth, category_controller.loadCategories);
admin_route.get('/get_category/:id', admin_auth, category_controller.fetchCategoryById);
admin_route.put('/update_category/:id', admin_auth, category_controller.editCategory);
admin_route.put('/soft_delete_category/:id', admin_auth, category_controller.disableCategory);

// COUPON_CONTROLLERS
admin_route.get('/coupon_management', admin_auth, coupon_controller.loadCouponDashboard);
admin_route.get('/create_coupon', admin_auth, coupon_controller.loadCreateCoupon);
admin_route.post('/activation', admin_auth, coupon_controller.activateCoupon);
admin_route.post('/create_coupon', admin_auth, coupon_controller.createCouponPage);
admin_route.get('/edit_coupon', admin_auth, coupon_controller.updateCoupon);
admin_route.post('/edit_coupon', admin_auth, coupon_controller.applyCouponUpdate);

// OFFER_CONTROLLERS
admin_route.get('/offer_management',  admin_auth, offer_controller.loadOfferDashboard);
admin_route.get('/create_offer', admin_auth, offer_controller.loadOfferCreationPage);
admin_route.post('/create_offer', admin_auth, offer_controller.createNewOffer);
admin_route.get('/edit_offer/:id', admin_auth, offer_controller.loadOfferEditPage);
admin_route.post('/edit_offer', admin_auth, offer_controller.applyOfferUpdate);

module.exports = admin_route;