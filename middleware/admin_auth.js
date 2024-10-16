const admin_auth = (req, res, next) => {
    if(req.session.admin){
        return  next();
    }
    return res.redirect('/admin');
}

module.exports = admin_auth;