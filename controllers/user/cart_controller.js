const Cart = require("../../models/cart_model");
const mongoose = require("mongoose");
const Product = require("../../models/product_model");
const statusCode = require('../../constance/statusCodes')

const loadShoppingCart = async (req, res) => {
  try {
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString (req.session.passport.user);
    const cart = await Cart.findOne({ user: user }).populate("item.product");
    return res.render("user/shop_cart", { cart, user:true });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "Unable to fetch cart details" });
  }
};

const shoppingCart = async (req, res) => {
  try {
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString (req.session.passport.user)

    const { product_id, price, volume, quantity } = req.body;

    const productData = await Product.findById(product_id)
    const sale_price_after_discount = productData.variants.find((variant) => variant.volume.toString() === volume)?.sale_price_after_discount || null;

    if (!user) {
      return res.status(statusCode.UNAUTHORIZED).json({ message: "User not authenticated" });
    }

    let cart = await Cart.findOne({ user: user });

      if (cart) {
          const existingItem = cart.item.find( (i) => i.product.toString() == product_id && i.volume == volume );

          if (existingItem) {
              existingItem.quantity += quantity;
          } else {
              cart.item.push({ product: product_id, price,offer_price:sale_price_after_discount, volume, quantity });
          } 

        cart = await cart.save();

      } else {
        cart = new Cart({ user: user, item: [{ product: product_id, price,offer_price:sale_price_after_discount, volume, quantity }] });
        await cart.save();
      }

    return res.status(statusCode.SUCCESS).json({ message: "Product added to cart successfully", cart });
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "Unable to add product to cart" });
  }
};



const updateItemQuantity = async (req, res) => {
  try {
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString (req.session.passport.user);

    const productId = String(req.body.productId);
    const productSize = Number(req.body.productSize);
    const quantity = Number(req.body.quantity);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(statusCode.BAD_REQUEST).json({ message: "Invalid productId format", success: false });
    }

    const updatedCart = await Cart.findOne({ user: user })
    for(let item of updatedCart.item){
      if( item.volume == productSize && item.product == productId ){
        item.quantity = quantity
      }
    }

    await updatedCart.save();

    if (!updatedCart) {
      return res.status(statusCode.NOT_FOUND).json({ message: "Cart not found", success: false });
    }

    const cartItem = updatedCart.item.find(
      (i) => i.product.toString() === productId && i.volume === productSize
    );

    if (!cartItem) {
      return res.status(statusCode.NOT_FOUND).json({ message: "Cart item not found", success: false });
    }

    let subtotal;
    if(cartItem.offer_price){
      subtotal = cartItem.offer_price * quantity;
    }else{
      subtotal = cartItem.price * quantity;
    }

    return res.status(statusCode.SUCCESS).json({
      subtotal,
      message: "Quantity updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating quantity:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "An error occurred", success: false });
  }
};

const checkStockLevel = async(req, res) => {
  try {
    const { productId, volume } = req.params;
    const product = await Product.findById(productId);
    const variant = product.variants.find((v) => v.volume === parseInt(volume));

    if(!variant || variant === 0){
      return res.status(statusCode.NOT_FOUND).json({ success: false, message:"Product variant not found."});
    }

    return res.status(statusCode.SUCCESS).json({ success: true, stock: variant.stock })

  } catch (error) {
    console.log("Error fetching stock:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Unable to fetch stock." });
  }

}

const removeFromCart = async (req, res) => {
  try {
    const cartItem = req.params.id;
    const updatedCart = await Cart.findOneAndUpdate(
      { "item._id": cartItem },
      { $pull: { item: { _id: cartItem } } },
      { new: true }
    );
    if (updatedCart) {
      return res.status(statusCode.SUCCESS).json({ success: true });
    } else {
      return res.status(statusCode.NOT_FOUND).json({ message: "Item not found" });
    }
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while removing item from cart" });
  }
};

module.exports = {
  shoppingCart,
  loadShoppingCart,
  updateItemQuantity,
  removeFromCart,
  checkStockLevel
};
