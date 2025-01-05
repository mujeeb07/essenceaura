const statusCode = require('../constance/statusCodes');

const handleNotFound = (req, res) => {
    const user = req?.session?.user || req?.session?.passport?.user;
    const isAdmin = req.originalUrl.startsWith('/admin');
    if(isAdmin){
        return res.status(statusCode.NOT_FOUND).render('../views/admin404', { title: 'Admin Page Not Found.' })
    } else {
        return res.status(statusCode.NOT_FOUND).render('../views/404', { title: 'Page Not Found', user });
    }
    
};

const handleServerError = (req, res, next) => {
    const user = req?.session?.user || req?.session?.passport?.user;
    const isAdmin = req.originalUrl.startsWith('/admin');
    if(isAdmin){
        return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500', { title: 'Admin Internal Server Error.' })
    } else {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/500', { title: 'Internal Server Error', user});
    }
    
}

module.exports = { handleNotFound, handleServerError }