
const is_authenticated = (req, res, next) => {

    if(!req.session.user || !req.user){

        console.log("getting inside");
        
        return res.render('user/user_login',{message:'You need login to continue.'});

    }
    
    next();
}

module.exports = is_authenticated;
