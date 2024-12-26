const user = require("../../models/user_model");
const bcrypt = require("bcrypt");
const total_orders = require("../../models/order_model");
const products = require("../../models/product_model");
const { daily_sales, weekly_sales, monthly_sales, yearly_sales } = require("../../utils/sales_report_chart");
const {startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } = require('date-fns');
const  generate_report  = require("../../utils/generate_report");
const statusCode = require ('../../constance/statusCodes')



const admin_login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin_data = await user.findOne({ email: email.trim() });
    const password_match = await bcrypt.compare(
      password.trim(),
      admin_data?.password
    );
    if (password_match && admin_data?.is_admin) {
      req.session.admin = admin_data._id  
      return res.status(statusCode.SUCCESS).redirect("/admin/dashboard")
    } else {
      return res.status(statusCode.BAD_REQUEST).render("admin/admin_login", { message: "Enter valid email and password" });
    }
  } catch (error) {
    console.log("admin login error", error)
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "admin login error", error });
  }
};

const load_admin_login = async (req, res) => {
  try {
    return res.status(statusCode.SUCCESS).render("admin/admin_login", { message: "" });
  } catch (error) {
    console.log("Error while getting the admin login page.", error)
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error });
  }
};

const admin_logout = async (req, res) => {
  try {
    req.session.destroy();
    return res.status(204).redirect("/admin");
  } catch (error) {
    console.log('error admin logout.',error)
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({message:"admin logout controller error"})
  }
}

const admin_dashboard = async (req, res) => {
  try {
  
    const totals = await total_orders.find({}, { total:1, _id:0 });
    const revenue = totals.reduce((sum, item) => sum + item.total, 0);
    const order_count = totals.length;
    const total_products = await products.countDocuments();
    const toal_categories = (await products.distinct("category")).length;

    const top_products = await total_orders.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product._id",
          name: { $first: "$items.product.name" },
          total_quantity: { $sum: "$items.quantity" }, 
        }
      },
      { $sort: { total_quantity: -1 } },
    ]).limit(5);
    
    top_products.sort((a,b) => b.total_quantity - a.total_quantity);
    const top_brands = await total_orders.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product._id",
          brand_name: { $first : "$items.product.brand.brandName" },
          brand_quantity: {$sum:1}
        }
      },
      { $sort: {brand_quantity:-1} }

    ]).limit(5);
    const top_categories = await total_orders.aggregate([
      {$unwind: "$items"},
      {
        $group: {
          _id: "$items.product._id",
          category_name: { $first: "$items.product.category.name" },
          category_quantity: { $sum:1 }
        }
      },
      { $sort: { category_quantity:-1 } }
    ]).limit(5);
    console.log("Top category:",top_categories)
    const start_of_month = new Date();
        start_of_month.setDate(1);
        start_of_month.setHours(0, 0, 0, 0);
        const monthly_orders = await total_orders.find(
            { createdAt: { $gte: start_of_month } },
            { total: 1, _id: 0 }
        );
        const monthly_earnings = monthly_orders.reduce(
            (sum, item) => sum + item.total,
            0
        );

    return res.status(statusCode.SUCCESS).render("admin/admin_dashboard", { 
      revenue ,
      order_count,
      total_products, 
      toal_categories, 
      monthly_earnings,
      top_products,
      top_brands,
      top_categories
    });
  } catch (error) {
    console.log("admin dashboard controller error", error)
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json("admin dashboard controller error", error.message);
  }
};

//Sales Report
const load_create_sales_report = async (req, res) => {
  try {
    const sales_report_data = await total_orders.find({ order_status: "Delivered" });

    return res.status(statusCode.SUCCESS).render("admin/create_sales_report",{ sales_report_data });
  } catch (error) {
    console.log("Error while rendering sales report page", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "Error while rendering sales report page", success: false });
  }
}

//Sales Report Table
const sales_report_table = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    console.log("Query Data:", type, startDate, endDate);

    let date_start, date_end;

    if(startDate && endDate){
      console.log('Table for custome range data.');
      date_start = new Date(startDate);
      date_end = new Date(endDate);
    }else{
      const today = new Date();

      switch(type){
        case "daily":
          date_start = new startOfDay(today);
          date_end = new endOfDay(today);
          break;
        case "weekly":
          date_start = new startOfWeek(today);
          date_end = new endOfWeek(today);
          break;
        case "monthly":
          date_start = new startOfMonth(today);
          date_end = new endOfMonth(today);
          break;
        case "yearly":
          date_start = new startOfYear(today);
          date_end = new endOfYear(today);
          break;
        default:
          return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "Invalid Period Selected." });
      }
    }

   const report = await generate_report(date_start, date_end);

   console.log("Report Data:",report);

   return res.status(statusCode.SUCCESS).json({ success: true, report });
  
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success:false });
  }
}


// For Diagram //
const daily_sales_data = async (req, res) => {
  try {
    const data = await daily_sales();
    return res.status(statusCode.SUCCESS).json(data);
  } catch (error) {
    console.log("Error fetching daily sales diagram", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false });
  }
};

const weekly_sales_data = async (req, res) => {
  try {
    const data = await weekly_sales();
    return res.status(statusCode.SUCCESS).json(data);
  } catch (error) {
    console.log("Error while fetching weekly sales diagram", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false });
  }
};

const monthly_sales_data = async (req, res) => {
  try {
    const data = await monthly_sales();
    return res.status(statusCode.SUCCESS).json(data);
  } catch (error) {
    console.log("Error while fetching monthly sales diagram", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false });
  }
};

const yearly_sales_data = async (req, res) => {
  try {
    const data = await yearly_sales();
    return res.status(statusCode.SUCCESS).json(data);
  } catch (error) {
    console.log("Error while fetching yearly sales diagram.", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false });
  }
};

// Diagram end //

module.exports = {
  admin_login,
  load_admin_login,
  admin_dashboard,
  admin_logout,
  load_create_sales_report,
  daily_sales_data,
  weekly_sales_data,
  monthly_sales_data,
  yearly_sales_data,
  sales_report_table
};
