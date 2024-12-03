const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;



const Products = require('../../models/product_model');




const load_offer_management = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1 ;
        const offers_per_page = 5;
        const total_offer_products = await Products.countDocuments({ "product_offer.offer_status": true });
        const total_pages = Math.ceil(total_offer_products / offers_per_page);

        const offer_products = await Products.find({ "product_offer.offer_status": true }).populate('category brand').skip((page - 1) * offers_per_page).limit(offers_per_page);

        return res.status(200).render('admin/offer_management', { offers:offer_products, current_page: page, total_pages: total_pages });
        
    } catch (error) {
        console.log("Error while rendering offer management page", error.message);
        return res.status(500).json({message:"Error while rendering offer management page.", success:false})
    }
}

const load_create_offer = async (req, res) => {
    try {
        const currentDdate = new Date();
        const offer_products = await Products.find({ $or: [
            { "product_offer.offer_expire_date" : { $lt: currentDdate } }, {"product_offer":{ $exists :false } }
        ] })
        return res.status(200).render('admin/create_offer', { offer_products });
    } catch (error) {
        console.log("Error while rendering create offer page", error.message)
        return res.status(500).json({ message:"Error while rendering create offer page", success: false });
    }
}

const create_offer = async (req, res) => {
    try {
        const { offer_name, product, discount_percentage, start_date, expiry_date } = req.body;

        const product_data = await Products.findById(product);
        if (!product_data) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        product_data.variants.forEach(variant => {
            const discountAmount = (variant.price * Number(discount_percentage)) / 100;
            variant.sale_price_after_discount = variant.price - discountAmount;
            variant.offer_discount_amount = discountAmount; 
        });
         
        product_data.product_offer = {
            offer_name,
            offer_discount_percentage: discount_percentage,
            offer_start_date: start_date,
            offer_expire_date: expiry_date,
            offer_status: true,
        };

        await product_data.save();

        return res.status(200).json({ success: true, message: "Offer created successfully" });
    } catch (error) {
        console.error("Error creating offer:", error);
        return res.status(500).json({ message: "Error while creating the offer", success: false });
    }
};


const load_edit_offer = async (req, res) => {
    try {
        const productId = req.params.id;
        // console.log("Offer Id: ", productId)
        const product =  await Products.findById( productId ).populate('category brand');

        if(!product){
            return res.status(400).json({mesage: "Product not found", success: false});
        }

        const offer = product.product_offer || {};
        return res.status(200).render('admin/edit_offer', { offer, productId, product } );
    } catch (error) {
        console.log('Error while rendering the edit offer page', error);
        return res.status(500).json({ message:"Error while rendering the edit offer page", success: false });
    }
}

const update_offer = async (req, res) => {

    try {
        const {product_id, offer_name, discount_percentage, start_date, expiry_date } = req.body;
        
        console.log(product_id);
        const productIdstr = ObjectId.createFromHexString(product_id);
        const updated_product = await Products.findByIdAndUpdate(product_id,
            {   
                product_offer: {
                    offer_name,
                    offer_discount_percentage: discount_percentage,
                    offer_start_date: new Date(start_date),
                    offer_expire_date: new Date(expiry_date),
                    offer_status: true,
                },
                       
            },
            { new: true }
        );
        updated_product.variants.forEach(variant => {
            const discountAmount = (variant.price * Number(discount_percentage)) / 100;
            variant.sale_price_after_discount = variant.price - discountAmount;
            variant.offer_discount_amount = discountAmount
        })

        await updated_product.save();
        console.log("Updated offer details:", updated_product )

        if(!updated_product){
            return res.status(400).json({ message: "Product not found", success: false });
        }

        return res.status(200).json({ message: "Offer details updated successfylly", success: true })

    } catch (error) {
        console.log("Error while updating the offer", error)
        return res.status(500).json({ message: "Error while updating the offer", success: false })
    }

}

module.exports = {
    load_offer_management,
    load_create_offer,
    create_offer,
    load_edit_offer,
    update_offer
}