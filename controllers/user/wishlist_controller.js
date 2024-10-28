const Wishlist = require('../../models/wishlist_model');
const Products = require('../../models/product_model')
const mongoose = require('mongoose');

const load_wishlist = async (req, res) => {

    try {
        const user = req.session.user || mongoose.Types.ObjectId.createFromHexString (req.session.passport.user);
        const user_wishlist = await Wishlist.findOne({ user_id: user });

        if(!user_wishlist){
            const new_wishlist = new Wishlist({
                user_id: user
            });
            await new_wishlist.save();
            user_wishlist = new_wishlist;
        }

        const product_ids = user_wishlist.product_ids || []
        const product_data = await Products.find({ _id: product_ids }).populate('category')

        return res.status(200).render('user/wishlist.ejs', { user_wishlist,product_data } );
        
    } catch (error) {

        console.log('Error while rendering the wishlist page');
        return res.status(500).json({ message:'Error while rendering the wishlist page. ', error } )
        
    }
}

const add_to_wishlist = async(req, res) => {
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString (req.session.passport.user);
    const { productId }  = req.body
    // console.log("product Id:", productId);
    // console.log("User :", user);
    let user_wishlist = await Wishlist.findOne({ user_id: user});
    // console.log('user wishlist :', user_wishlist);
    try {
        if(!user_wishlist){
            const user_wishlist = new Wishlist({
                user_id: user,
                product_ids: [productId]
            });
            await user_wishlist.save();
        }else{
            await Wishlist.findOneAndUpdate(
                {user_id: user},
                { $push: { product_ids: productId } }
            )
        }
        // console.log("wishListData : ", user_wishlist);
        return res.status(200).json({message: "product added to wishlist", success: true})
    } catch (error) {
        return res.status(500).json({message:"Error while adding product to wishlist", error});
    }
}

const wishlist_remove_item = async (req, res) => {

    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString (req.session.passport.user);
    const { productId } = req.body;
    
    try {

        const updated_wishlist = await Wishlist.findOneAndUpdate(
            { user_id : user },
            { $pull: { product_ids: productId } },
            { new: true }
        );

        if(updated_wishlist){
            console.log('Product removed successfuly')
            return res.status(200).json({ message:"Product removed successfuly",success: true });
        }else{
            return res.status(404).json({message:"Item not found"})
        }
        
    } catch (error) {
        return res.status(500).json({ message:"An error occured while removing item from wishlist" });
    }

}

module.exports = {
    load_wishlist,
    add_to_wishlist,
    wishlist_remove_item
}