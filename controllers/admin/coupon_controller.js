const mongoose = require('mongoose')
const Cart = require('../../models/cart_model');
const Coupon = require('../../models/coupon_model');
const statusCode = require('../../constance/statusCodes')



const loadCouponDashboard = async (req, res) => {
    try {
        const coupons = await Coupon.find({})
        return res.status(statusCode.SUCCESS).render('admin/coupon_list', { coupon_data: coupons } );
    } catch (error) {
        console.log("something went wrong while rendering coupon list.", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
    }
}

const loadCreateCoupon = async (req, res) => {
    try {
        return res.status(statusCode.SUCCESS).render('admin/create_coupon');
    } catch (error) {
        console.log('Error while getting create coupon page.', error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');

    }

}

const createCouponPage = async (req, res) => {
    const {coupon_name, description, coupon_code, discount, max_amount, min_amount, valid_upto} = req.body;

    try {
        const coupon_data = new Coupon({
            coupon_name: coupon_name,
            coupon_description: description,
            coupon_code: coupon_code,
            discount_percentage: discount,
            coupon_max_amount: max_amount,
            coupon_min_amount: min_amount,
            coupon_expires: valid_upto
        });

        await coupon_data.save();
        return res.status(statusCode.SUCCESS).json({ success: true });
    } catch (error) {
        console.log("Error while getting coupon details.", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
    }
}

const activateCoupon = async (req, res) => {
const { id, is_active  }  = req.body;
    try {
        await Coupon.findByIdAndUpdate( { _id: id }, {
            coupon_status: is_active
        })
        return res.status(statusCode.SUCCESS).json({message: "cuopon status updated"})
    } catch (error) {
        console.log('Error while update coupon status', error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
    }

}

const updateCoupon = async (req, res) => {
    const { id } = req.query;
    try {
        const coupon_data = await Coupon.findById(id);
        return res.status(statusCode.SUCCESS).render('admin/edit_coupon', { coupon: coupon_data });
    } catch (error) {
        console.log('Error while fetching the data from the database:', error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
    }
};

const applyCouponUpdate = async (req, res) => {
    const { id, coupon_name, description, coupon_code, discount, max_amount, min_amount, valid_upto } = req.body;
    try {
        const update_data = await Coupon.findByIdAndUpdate(
            {_id : id},
            {
                coupon_name: coupon_name,
                coupon_description: description,
                coupon_code: coupon_code,
                coupon_discount: discount,
                coupon_max_amount: max_amount,
                coupon_min_amount: min_amount,
                coupon_expires: valid_upto
            }
        );
        await update_data.save()

        return res.status(statusCode.SUCCESS).json({ message:"Coupon udpated successfully", success:true });
    } catch (error) {
        console.log("Error while updating the coupon. ", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
    }
}



module.exports = {
    loadCouponDashboard,
    loadCreateCoupon,
    createCouponPage,
    activateCoupon,
    updateCoupon,
    applyCouponUpdate
}