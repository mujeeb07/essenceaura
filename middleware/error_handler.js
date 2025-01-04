const statusCode = require('../constance/statusCodes');

const handleNotFound = (req, res) => {
    
    const user = req?.session?.user || req?.session?.passport?.user

    return res.status(statusCode.NOT_FOUND).render('../views/404', { title: 'Page Not Found', user });
};

const handleServerError = (req, res, next) => {
    const user = req?.session?.user || req?.session?.passport?.user
    return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/500', { title: 'Internal Server Error', user});
}

module.exports = { handleNotFound, handleServerError }