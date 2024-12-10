const Order = require('../models/order_model');

const generate_report = async (date_start, date_end) => {
    // console.log("Start date:", date_start);
    // console.log("End date:", date_end);

    const pipeline = [
        {
            $match: {
                createdAt: { $gte: new Date(date_start), $lte: new Date(date_end) },
                order_status: "Delivered"
            }
        },
        {
            $unwind: "$items"
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    productId: "$items.product._id",
                    productName: "$items.product.name",
                    productBrand: "$items.product.brand.brandName",
                    productCardImage: "$items.product.product_card_image"
                },
                totalQuantity: { $sum: "$items.quantity" },
                totalRevenue: { $sum: "$items.price" },
                orderCount: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: "$_id.date",
                products: {
                    $push: {
                        productId: "$_id.productId",
                        productName: "$_id.productName",
                        productBrand: "$_id.productBrand",
                        productCardImage: "$_id.productCardImage",
                        quantity: "$totalQuantity",
                        revenue: "$totalRevenue"
                    }
                },
                dailyTotalRevenue: { $sum: "$totalRevenue" },
                dailyTotalQuantity: { $sum: "$totalQuantity" },
                dailyOrderCount: { $sum: "$orderCount" }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ];

    try {
        const result = await Order.aggregate(pipeline);
        // console.log("Report generated:", result);
        return result;
    } catch (error) {
        console.error("Error generating report:", error);
        throw error;
    }
};

module.exports = generate_report;
