
const is_authenticated = (req, res, next) => {
    const user = req?.session?.user || req?.session?.passport?.user

    console.log("middleware user :", user);

    if(!user){
        return res.render('user/user_login',{message:'You need login to continue.'});
    }
    next();
}

module.exports = is_authenticated;
