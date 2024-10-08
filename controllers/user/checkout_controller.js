const Cart = require("../../models/cart_model");
const Address = require("../../models/address_model");
const Order_model = require("../../models/order_model");
const { session } = require("passport");

const checkout = async (req, res) => {
  try {
    const user_id = req.session.user;
    const cartItems = await Cart.findOne({ user: user_id })
      .populate("item.product")
      .exec();
    const addresses = await Address.find({ user: user_id });

    if (!cartItems || cartItems.item.length === 0) {
      return res
        .status(200)
        .render("user/check_out", {
          cartItems: [],
          addresses,
          message: "Your cart is empty!",
        });
    }

    return res
      .status(200)
      .render("user/check_out", { cartItems: cartItems.item, addresses });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ error: "checkout server error" });
  }
};

const post_checkout = async (req, res) => {
  try {
    const { payment, address } = req.body;
    const user = req.session.user;
    const cart_data = await Cart.findOne({ user: user }).populate({
      path: "item.product",
      populate: ["brand", "category"],
    });

    const ordered_items = cart_data.item.map((item) => ({
      product: {
        _id: item.product._id,
        name: item.product.name,
        description: item.product.description,
        product_card_image: item.product.product_card_image,
        variants: {
          volume: item.volume,
          price: item.price,
        },
        category: {
          _id: item.product.category._id,
          name: item.product.category.name,
          gender: item.product.category.gender,
        },
        brand: {
          _id: item.product.brand._id,
          brandName: item.product.brand.brandName,
          logo: item.product.brand.logo,
        },
      },
      quantity: item.quantity,
      price: item.price,
    }));
    const total_price = cart_data.item.reduce((total, item) => {
      const selected_variant = item.product.variants.find(
        (variant) => variant.volume === item.volume
      ); // Assuming volume is passed in cart
      const variant_price = selected_variant ? selected_variant.price : 0;

      return total + item.quantity * variant_price;
    }, 0);

    console.log("orders:", ordered_items);
    const user_address = await Address.findOne({ _id: address });

    const order = new Order_model({
      user: user,
      shipping_address: {
        name: user_address.name,
        mobile: user_address.mobile,
        address: user_address.address,
        city: user_address.city,
        state: user_address.state,
        postal_code: user_address.postal_code,
        landmark: user_address.landmark,
      },

      items: ordered_items,
      payment_method: payment,
      total_price: total_price,
    });
    order.save();
    
  } catch (error) {
    return res.status(200).json({ message: error });
  }
};

module.exports = {
  checkout,
  post_checkout,
};
