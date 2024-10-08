const admin_auth = (req, res, next) => {
    if(req.session.admin){
        next();
        return
    }
    return res.redirect('/admin');
}

module.exports = admin_auth;