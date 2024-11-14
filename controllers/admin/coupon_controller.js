const mongoose = require('mongoose')
const Cart = require('../../models/cart_model');
const Coupon = require('../../models/coupon_model');



const load_coupon_management = async (req, res) => {

    try {
        const coupons = await Coupon.find({})
        return res.status(200).render('admin/coupon_list', { coupon_data: coupons } );

    } catch (error) {
        return res.status(500).json({ message:"something went wrong while rendering coupon list." });
    }
}

const load_coupon_create_page = async (req, res) => {

    try {
        
        return res.status(200).render('admin/create_coupon');

    } catch (error) {

        return res.status(500).json({ message:"error while rendering create coupon page." });

    }

}

const coupon_create_page = async (req, res) => {
    console.log('coupon create page.')
    const {coupon_name, description, coupon_code, discount, max_amount, min_amount, valid_upto} = req.body;
    console.log('data from the body:', coupon_name, description, coupon_code, discount, max_amount, min_amount, valid_upto)

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
        console.log("coupon created and saved successfully.")

        return res.status(200).json({ success: true });
    } catch (error) {
        console.log("Error: ", error.message)
        return res.status(500).json({message: "error while rendering the created coupon details."});
    }
}

const activation_coupon = async (req, res) => {
const { id, is_active  }  = req.body;
console.log('coupon id:',id, "status: ",is_active);

    try {
        await Coupon.findByIdAndUpdate( { _id: id }, {
            coupon_status: is_active
        })

        return res.status(200).json({message: "cuopon status updated"})
    } catch (error) {
        console.log('Error while update coupon status', error);
        return res.status(500).json({message: error });
    }

}

const edit_coupon = async (req, res) => {
    const { id } = req.query;
    console.log('Coupon id from params:', id);

    try {
        const coupon_data = await Coupon.findById(id);
        console.log('coupon data:', coupon_data);
        return res.status(200).render('admin/edit_coupon', { coupon: coupon_data });

    } catch (error) {
        console.log('Error while fetching the data from the database:', error.message);
        return res.status(500).send("Server error while fetching coupon data.");
    }
};

const update_coupon = async (req, res) => {
    const { id, coupon_name, description, coupon_code, discount, max_amount, min_amount, valid_upto } = req.body;
    
    console.log("data for updation: ", id, coupon_name, description, coupon_code, discount, max_amount, min_amount, valid_upto );

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

        return res.status(200).json({ message:"Coupon udpated successfully", success:true });
    } catch (error) {
        console.log("Error while updating the coupon. ", error);
        return res.status(200).json({ message:"Error while updating the coupon. ", error });
    }
}



module.exports = {
    load_coupon_management,
    load_coupon_create_page,
    coupon_create_page,
    activation_coupon,
    edit_coupon,
    update_coupon
}