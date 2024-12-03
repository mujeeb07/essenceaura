const getDailySalesData = async (total_orders) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const timeSlots = [
        { start: 0, end: 2 },
        { start: 2, end: 4 },
        { start: 4, end: 6 },
        { start: 6, end: 8 },
        { start: 8, end: 10 },
        { start: 10, end: 12 },
        { start: 12, end: 14 },
        { start: 14, end: 16 },
        { start: 16, end: 18 },
        { start: 18, end: 20 },
        { start: 20, end: 22 },
        { start: 22, end: 24 },
    ];

    let dailySalesData = timeSlots.map(slot => ({
        hour_start: slot.start,
        hour_end: slot.end,
        total_revenue: 0, 
    }));

    const salesData = await total_orders.aggregate([
        {
            $match: {
                createdAt: { $gte: startOfDay, $lte: endOfDay },
                order_status: { $ne: 'Cancelled' },
            },
        },
        {
            $project: {
                hour: { $hour: '$createdAt' },
                total: '$total',
            },
        },
        {
            $group: {
                _id: {
                    $subtract: [
                        { $divide: ['$hour', 2] },
                        { $mod: [{ $divide: ['$hour', 2] }, 1] },
                    ],
                },
                total_revenue: { $sum: '$total' },
            },
        },
        {
            $project: {
                hour_start: { $multiply: ['$_id', 2] },
                hour_end: { $add: [{ $multiply: ['$_id', 2] }, 2] },
                total_revenue: 1,
            },
        },
    ]);

    salesData.forEach(sale => {
        const matchingSlot = dailySalesData.find(slot =>
            slot.hour_start === sale.hour_start && slot.hour_end === sale.hour_end
        );
        if (matchingSlot) {
            matchingSlot.total_revenue = sale.total_revenue;
        }
    });
    return dailySalesData;
};

  
const getWeeklySalesData = async (total_orders) => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return await total_orders.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          order_status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          total_revenue: { $sum: '$total' },
        },
      },
      {
        $project: {
          day: '$_id',
          total_revenue: 1,
        },
      },
      { $sort: { day: 1 } },
    ]);
};


const getMonthlySalesData = async (total_orders) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(startOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    return await total_orders.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          order_status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          total_revenue: { $sum: '$total' },
        },
      },
      {
        $project: {
          day: '$_id',
          total_revenue: 1,
        },
      },
      { $sort: { day: 1 } },
    ]);
};


const getYearlySalesData = async (total_orders) => {
    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const endOfYear = new Date(startOfYear);
    endOfYear.setMonth(11, 31);
    endOfYear.setHours(23, 59, 59, 999);

    return await total_orders.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
          order_status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total_revenue: { $sum: '$total' },
        },
      },
      {
        $project: {
          month: '$_id',
          total_revenue: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);
};



  module.exports = {
    getDailySalesData,
    getWeeklySalesData,
    getMonthlySalesData,
    getYearlySalesData
  };
  