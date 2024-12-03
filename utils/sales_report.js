const Order = require("../models/order_model");

const daily_sales = async () => {
  return await Order.aggregate([
    { 
      $match: { 
        order_status: { $ne: "Cancelled" } 
      } 
    },
    { 
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        },
        total_sales: { $sum: "$total" },
        order_count: { $sum: 1 }
      }
    },
    { 
      $sort: { 
        "_id.year": -1, 
        "_id.month": -1, 
        "_id.day": -1 
      } 
    }
  ]);
};


const weekly_sales = async () => {
  const sales = await Order.aggregate([
    { 
      $match: { 
        order_status: { $ne: "Cancelled" } 
      } 
    },
    { 
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" }
        },
        total_sales: { $sum: "$total" },
        order_count: { $sum: 1 }
      }
    },
    { 
      $sort: { 
        "_id.year": -1, 
        "_id.week": -1 
      } 
    }
  ]);

  const formatted_sales = sales.map(week => {
    const year = week._id.year;
    const weekNum = week._id.week;
    const startOfWeek = new Date(year, 0, 1 + (weekNum - 1) * 7);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
      ...week,
      week_range: `${startOfWeek.toISOString().split('T')[0]} to ${endOfWeek.toISOString().split('T')[0]}`
    };
  });

  return formatted_sales;
};


const monthly_sales = async () => {
  const sales = await Order.aggregate([
    { 
      $match: { 
        order_status: { $ne: "Cancelled" } 
      } 
    },
    { 
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        total_sales: { $sum: "$total" },
        order_count: { $sum: 1 }
      }
    },
    { 
      $sort: { 
        "_id.year": -1, 
        "_id.month": -1 
      } 
    }
  ]);

  const formatted_sales = sales.map(month => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return {
      ...month,
      month_name: monthNames[month._id.month - 1]
    };
  });

  return formatted_sales;
};


const yearly_sales = async () => {
  const sales = await Order.aggregate([
    { 
      $match: { 
        order_status: { $ne: "Cancelled" } 
      } 
    },
    { 
      $group: {
        _id: { year: { $year: "$createdAt" } },
        total_sales: { $sum: "$total" },
        order_count: { $sum: 1 }
      }
    },
    { 
      $sort: { "_id.year": -1 } }
  ]);

  const currentYear = new Date().getFullYear();
  return sales.filter(sale => sale._id.year === currentYear);
};


module.exports = {
  daily_sales,
  weekly_sales,
  monthly_sales,
  yearly_sales
};
