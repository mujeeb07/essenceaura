const Wallet = require('../../models/wallet');

const load_wallet = async (req, res) => {
    const user = req.session.user || mongoose.Types.ObjectId.createFromHexString(req.session.passport.user);
    let  wallet_data= await Wallet.findOne({ user_id: user });
    const page = parseInt(req.query.page) || 1 ;
    const data_per_page = 5;
    const total_transactions = wallet_data?.transactions.length;
    const total_pages = Math.ceil( total_transactions / data_per_page );
    const  wallet = await Wallet.find({}).skip(( page - 1 ) * data_per_page).limit(data_per_page)
    try {
        if(!wallet_data){
            const new_wallet_data = new Wallet({
                user_id: user
            });
            wallet_data = new_wallet_data;
        }
        return res.status(200).render("user/wallet", { wallet_data: wallet, current_page: page, total_pages: total_pages });
    } catch (error) {
        console.log("Error while rendering the wallet page.", error);
        return res.status(500).json({ message: "Some went wrong while fetching wallet", success: false });
        
    }
}


module.exports = { load_wallet }