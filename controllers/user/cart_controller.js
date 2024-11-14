const Cart = require("../../models/cart_model");
const mongoose = require("mongoose");
const Product = require("../../models/product_model")

const load_shop_cart = async (req, res) => {
  try {
    
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString (req.session.passport.user);
    const cart = await Cart.findOne({ user: user }).populate("item.product");
    // console.log("Cartasdf:",cart);

    return res.render("user/shop_cart", { cart });

  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ message: "Unable to fetch cart details" });
  }
};

const shop_cart = async (req, res) => {
  try {
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString (req.session.passport.user)

    const { product_id, price, volume, quantity } = req.body;

    const productData = await Product.findById(product_id)
    const sale_price_after_discount = productData.variants.find((variant) => variant.volume.toString() === volume)?.sale_price_after_discount || null;

    // console.log("shop cart product price:", price)

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
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

    console.log("Cart Data:", cart );

    return res.status(200).json({ message: "Product added to cart successfully", cart });
  } catch (error) {
    return res.status(500).json({ message: "Unable to add product to cart" });
  }
};



const update_quantity = async (req, res) => {
  try {
    const user = req.session.user || req.session.passport.user;

    const productId = String(req.body.productId);
    const productSize = Number(req.body.productSize);
    const quantity = Number(req.body.quantity);

    console.log("User ID:", user);
    console.log("Data from the body:", productId, productSize, quantity);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId format", success: false });
    }

    // const updatedCart = await Cart.findOneAndUpdate(
    //   {
    //     user: new mongoose.Types.ObjectId(user),
    //     "item.product": new mongoose.Types.ObjectId(productId),
    //     "item.volume": productSize,
    //   },
    //   { $set: { "item.$.quantity": quantity } },
    //   { new: true }
    // );
    // console.log("123456",updatedCart)

    const updatedCart = await Cart.findOne({ user: user })
    for(let item of updatedCart.item){
      if( item.volume == productSize && item.product == productId ){
        item.quantity = quantity
      }
    }

    await updatedCart.save();

    console.log("UPDATED CART:",updatedCart)

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found", success: false });
    }

    const cartItem = updatedCart.item.find(
      (i) => i.product.toString() === productId && i.volume === productSize
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found", success: false });
    }

    // console.log("Cart Item:", cartItem);

    let subtotal;
    if(cartItem.offer_price){
      subtotal = cartItem.offer_price * quantity;
    }else{
      subtotal = cartItem.price * quantity;
    }

    // console.log("Subtotal:", subtotal)
  

    return res.status(200).json({
      subtotal,
      message: "Quantity updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating quantity:", error);
    return res.status(500).json({ message: "An error occurred", success: false });
  }
};

const get_stock = async(req, res) => {
  try {
    const { productId, volume } = req.params;
    const product = await Product.findById(productId);
    console.log("Product data get stock:", product)
    const variant = product.variants.find((v) => v.volume === parseInt(volume));

    if(!variant || variant === 0){
      return res.status(404).json({ success: false, message:"Product variant not found."});
    }

    return res.status(200).json({ success: true, stock: variant.stock })

  } catch (error) {
    console.log("Error fetching stock:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch stock." });
  }

}

const remove_item = async (req, res) => {
  try {
    const cartItem = req.params.id;
    const updatedCart = await Cart.findOneAndUpdate(
      { "item._id": cartItem },
      { $pull: { item: { _id: cartItem } } },
      { new: true }
    );
    if (updatedCart) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while removing item from cart" });
  }
};

module.exports = {
  shop_cart,
  load_shop_cart,
  update_quantity,
  remove_item,
  get_stock
};
