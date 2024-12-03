const mongoose = require('mongoose')
const Wallet = require('../../models/wallet');
const Wallet_txns = require('../../models/wallet_transactions');

const load_wallet = async (req, res) => {
    try {
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    let  wallet_data = await Wallet.findOne({ user_id: user });

    if(!wallet_data){
        return res.status(404).render("user/wallet", { wallet_txns: [], total_pages: 0, wallet_balance: 0 })
    }
    const wallet_id = wallet_data._id;
    const wallet_balance = wallet_data.balance.toFixed(2);

    const page = parseInt(req.query.page) || 1;
    const data_per_page = 5;

    const total_transactions = await Wallet_txns.countDocuments({ wallet_id });
    const total_pages = Math.ceil( total_transactions / data_per_page );

    const wallet_txns = await Wallet_txns.find({ wallet_id }).sort({ _id:-1 }).skip((page - 1) * data_per_page).limit(data_per_page)

    return res.status(200).render("user/wallet", { wallet_txns, total_pages, wallet_balance, current_page: page });

    } catch (error) {
        console.log("Error while rendering the wallet page.", error);
        return res.status(500).json({ message: "Some went wrong while fetching wallet", success: false });
    }
}


module.exports = { 
    load_wallet 
}