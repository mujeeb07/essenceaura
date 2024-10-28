const Cart = require("../../models/cart_model");
const mongoose = require("mongoose");


const load_shop_cart = async (req, res) => {
  try {
    
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString (req.session.passport.user)
    // console.log("load shop cart:", user);
    const cart = await Cart.findOne({ user: user }).populate("item.product");

    return res.render("user/shop_cart", { cart });

  } catch (error) {
    console.log("load shop cart catch block.");
    console.error("Error fetching cart:", error);
    return res.status(500).json({ message: "Unable to fetch cart details" });
  }
};


const shop_cart = async (req, res) => {
  try {
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString (req.session.passport.user)

    const { product_id, price, volume, quantity } = req.body;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    let cart = await Cart.findOne({ user: user });

    if (cart) {
      const existingItem = cart.item.find(
        (i) => i.product.toString() == product_id && i.volume == volume
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.item.push({ product: product_id, price, volume, quantity });
      }

      cart = await cart.save();
    } else {
      cart = new Cart({
        user: user,
        item: [{ product: product_id, price, volume, quantity }],
      });
      await cart.save();
    }

    return res.status(200).json({ message: "Product added to cart successfully", cart });
  } catch (error) {
    return res.status(500).json({ message: "Unable to add product to cart" });
  }
};

const update_quantity = async (req, res) => {
  try {

    const { productId, productSize, quantity } = req.body;

    const updatedCart = await Cart.findOneAndUpdate(
      {
        user: req.session.user || mongoose.Types.ObjectId.createFromHexString (req.session.passport.user),
        "item.product": productId,
        "item.volume": productSize,
      },
      { $set: { "item.$.quantity": quantity } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(400).json({ message: "Cart or product not found", success: false });
    }

    const cartItem = updatedCart.item.find(
      (i) =>
        i.product.toString() === productId &&
        i.volume.toString() === productSize
    );

    if (!cartItem) {
      return res.status(400).json({ message: "Product not found in cart", success: false });
    }

    const subtotal = cartItem.price * quantity;
    const total = updatedCart.item.reduce((acc, item) => 
      acc + item.price * item.quantity,
    0);

    return res.status(200).json({
      message: "Quantity updated successfully",
      success: true,
      price: cartItem.price,
      subtotal,
      total,
    });
  } catch (error) {
    console.error("Error updating quantity:", error);
    return res.status(500).json({ message: "An error occurred", success: false });
  }
};

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
};
