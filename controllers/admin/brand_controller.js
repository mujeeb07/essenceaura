const brand = require("../../models/brand_model");
const { uploadToCloudinary } = require("../../config/cloudinary");
const statusCode = require('../../constance/statusCodes')

const getBrands  = async (req, res) => {
  try {
    const brands = await brand.find({ is_deleted: false });

    return res.status(statusCode.SUCCESS).render("admin/brands", { brands: brands });
  } catch (error) {
    console.log('Brand page error', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
  }
};

const loadBrandCreation  = async (req, res) => {
  try {
    return res.status(statusCode.SUCCESS).render("admin/add_new_brand");
  } catch (err) {
    console.log('Brand create page render error', err)
    res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
  }
};

const createBrand  = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!req.files || !req.files.file) {
      return res.status(statusCode.BAD_REQUEST).json({ message: "No logo file uploaded." });
    }
    const logo = req.files.file;

    const upload_result = await uploadToCloudinary(logo);

    const new_brand = await brand.create({
      brandName: name,
      description: description,
      logo: upload_result.url,
    });

    return res.status(statusCode.SUCCESS).json({ message: "new brand added and saved" });
  } catch (error) {
    console.log('new brand create page error', error)
    return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
  }
};

const loadBrandEditor = async (req, res) => {
  try {
    const brand_id = req.params.id;
    const brand_data = await brand.findOne({ _id: brand_id });
    console.log(brand_data)
    return res.status(statusCode.SUCCESS).render('admin/edit_brand', { brand: brand_data });
  } catch (error) {
    console.log('Error brand update page', error)
    return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
  }
};

const updateBrand  = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const { id } = req.params;

    const is_deleted = status === "true" ? false : true;

    await brand.findByIdAndUpdate(id, {
      brandName: name,
      description: description,
      is_deleted: is_deleted,
    });
    return res.status(statusCode.SUCCESS).json({ success: true, message: "brand updated" });
  } catch (error) {
    console.log('Error update update brand.', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
  }
};

module.exports = {
  getBrands ,
  loadBrandCreation ,
  createBrand ,
  loadBrandEditor,
  updateBrand ,
};
