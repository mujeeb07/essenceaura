const Orders = require("../../models/order_model");
const Wallet = require("../../models/wallet");
const ObjectId = require('mongoose').Types.ObjectId;
const Wallet_txns = require('../../models/wallet_transactions');
const Product = require('../../models/product_model');

const load_my_orders = async(req, res) => {
    try {
      const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
      const limit = 6;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit
      const total_orders = await Orders.countDocuments({ user : user} )

      const my_orders = await Orders.find({ user: user }).sort({_id:-1}).skip(skip).limit(limit);
      const total_pages = Math.ceil(total_orders / limit);
  
      return res.status(200).render('user/my_orders', { my_orders, current_page: page, total_pages } );
  
    } catch (error) {
      console.log("error while renders the my orders page", error);
     return res.status(500).json({messge: "error while renders the my orders page.", error});
    }
  }

// CANCELLATION CONTROLLERS
  const cancel_order = async (req, res) => {
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    const { order_id } = req.params;
    try {
        let order_data = await Orders.findByIdAndUpdate(
            order_id,
            { $set: { 'order_status': 'Cancelled' } },
            { new: true } 
        );
        order_data.items.forEach((item) => {
            item.product.cancel_request = "Cancelled";
        })
        await order_data.save();
        if(order_data.payment_method !== "COD" && order_data.order_status !== "Delivered"){
            let wallet = await Wallet.findOne({ user_id: user });
            if(!wallet){
                const new_wallet = new Wallet({ user_id: user });
                wallet = await new_wallet.save();
            }

            const order_id = order_data._id
            let balance = Number(order_data.total)
            console.log("Order Grand Total : ", Number(balance));

            console.log('Wallet balance before:', wallet.balance)

            wallet.balance += balance;
            console.log('Wallet balance after :', wallet.balance);
            await wallet.save();

            const new_wallet_txn = new Wallet_txns({
                wallet_id: wallet._id,
                txn_amount: Number(balance),
                txn_description: `Refunded for the order #${order_id.toString().slice(0, 10).toUpperCase()}`,
                txn_type: "Credit",
                wallet_transaction_status: "Refunded"
            });

            await new_wallet_txn.save();
            console.log("Wallet transaction for order saved successfully :)");
        }
      return res.status(200).json({ message:"Order Cancelled Successfully",success:true });
    } catch (error) {
      console.log("Something went wrong while cancel order", error);
      return res.status.status(500).json({ message:"Something went wrong while cancel order",error })
    }
  }

  const order_details = async (req, res) => {
    try {
        const order_id = req.params.order_id;
        const order = await Orders.findById( order_id );

        if(!order)console.log("Couldn't find the order details");

        return res.status(200).render('user/order_details', { order });
    } catch (error) {
        console.log('Error while getting order details.', error);
        return res.status(500).json({ message:"Error while getting order details." });
    }
  }

  const cancel_product = async (req, res) => {
    try {
        const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
        const { order_id, product_id, product_variant } = req.body;
        // console.log("DATA FROM THE BODY:", order_id, product_id, product_variant);
        const order_data = await Orders.findById(order_id);
        if(!order_data){
            return res.status(400).json({ message: "Order Not Found", success: false });
        };
        let product_found = false;
        let product_name;
        order_data.items.forEach((item) => {
            if(item.product._id.toString() === product_id){
                product_found = true;
                item.product.cancel_request = "Cancelled";
                product_name = item.product.name;
            }
        });
        if (!product_found) {
            return res.status(404).json({ message: "Product not found in the order" });
        }
        const allCancelled = order_data.items.every((i) => {
            if (i.product.cancel_request === "Cancelled") {
                return true;
            }
                return false;
        });
    
        if (allCancelled) {
            console.log("All products in the order are already cancelled.");
            order_data.order_status = "Cancelled"
        } 
        
        await order_data.save();

        if(order_data.payment_method !== "COD" && order_data.order_status !== "Delivered") {
            let wallet = await Wallet.findOne( {user_id:user} );
            if(!wallet){
              const new_wallet = new Wallet({ user_id: user });
              wallet = await new_wallet.save();
            }
            
            let balance = 0
            for(let item of order_data.items){
                if(item.product._id.toString() === product_id.toString() && item.product.variants.volume.toString() === product_variant){
                    balance = Number(item.price) * Number(item.quantity);
                    break;
                }
            }
            console.log('BALANCE:', balance);
            wallet.user_id = user;
            balance += balance * 0.18;
            if(order_data.discount_amount){
                const discount = order_data.discount_amount;
                const total = order_data.total + discount
                balance += balance * discount / total;
                console.log('Actual balance:', balance)
            }
            wallet.balance += balance;
            await wallet.save();

            const new_wallet_txn = new Wallet_txns({ 
                wallet_id: wallet._id,
                txn_amount: balance,
                txn_description: `Refunded for product "${product_name}" cancellation.`,
                txn_type: "Credit",
                wallet_transaction_status: "Refunded"
            });

            await new_wallet_txn.save();
            console.log("Wallet transaction for product saved successfully :)");
        }

        return res.status(200).json({message:"Product cancelled successfully", success: true})
        
    } catch (error) {
        console.log("Error while cancel product", error)
        return res.status(500).json({message:"Error while cancel product."})
    }
  }


//RETURN CONTROLLERS
const return_product = async (req, res) => {
    try {
        const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
        const { order_id, product_id, product_variant, reason } = req.body;
        const order_data = await Orders.findById(order_id);
        if(!order_data){
            return res.status(400).json({ message: "Order Not Found", success: false });
        };

        let product_found = false;
        let product_name;
        order_data.items.forEach((item) => {
            if(item.product._id.toString() === product_id && item.product.cancel_request !== "Cancelled"){
                product_found = true;
                item.product.return_request = "Return Initiated";
                item.product.return_reason = reason;
                product_name = item.product.name;
            }
        });

        if (!product_found) {
            return res.status(404).json({ message: "Product not found in the order" });
        }

        const allCancelled = order_data.items.every((i) => {
            if (i.product.cancel_request === "Cancelled") {
                return true;
            }
                return false;
        });

        if (allCancelled) {
            console.log("All products in the order are already cancelled.");
            order_data.order_status = "Cancelled"
        } 

        await order_data.save();

        if(order_data.order_status !== "Delivered"){
            return res.status(400).json({ message:'Sorry cannot initiate return request due to "Undelivered" order.', success: false });
        }
        console.log('The product return request initiated successfully :)')
        return res.status(200).json({ message: 'The product return request initiated successfully.', success: true })
    } catch (error) {
        console.log("Error while return order.", error);
        return res.status(500).json({ message:"Error while return order.", success: false });
    }
}

//INVOICE 
const get_invoice = async (req, res) => {
    try {
        const { order_id } = req.params;

        const order = await Orders.findById(order_id).populate('items');

        if(!order){
            return res.status(404).json({ message: "Order not found.", success:false });
        }

        for(let i of order.items){
            console.log("Order data:", i.price)
        }
        
        let cartItems = [];

        for (let i of order.items) {
        cartItems.push({
            product: i.product, 
            quantity: i.quantity,
            price: i.price,
            offer_price: i.offer_price,
        });
        }

        console.log("cart items:", cartItems)
        
          return res.status(200).render("user/invoice", { cartItems, order });
    } catch (error) {
        console.log("Error while generating Invoice pdf", error);
        return res.status(500).json({ message: "Error while generating Invoice pdf", success: false});
    }
}

module.exports = {
    load_my_orders,
    cancel_order,
    order_details,
    cancel_product,
    return_product,
    get_invoice
}
