const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if(req.body.brand){
            cb(null, path.join(__dirname, "../public/brand_logo"));
        }else{
            cb(null, path.join(__dirname, "../public/product_images"));
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})


const upload = multer({ storage: storage });

module.exports = upload;