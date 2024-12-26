const brand = require("../../models/brand_model");
const { uploadToCloudinary } = require("../../config/cloudinary");
const statusCode = require('../../constance/statusCodes')

const load_brands = async (req, res) => {
  try {
    const brands = await brand.find({ is_deleted: false });

    return res.status(statusCode.SUCCESS).render("admin/brands", { brands: brands });
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error });
  }
};

const load_add_new_brand = async (req, res) => {
  try {
    return res.status(statusCode.SUCCESS).render("admin/add_new_brand");
  } catch (err) {
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to create brand", error: err.message });
  }
};

const add_new_brand = async (req, res) => {
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
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to create new brand" });
  }
};

const load_edit_brand = async (req, res) => {
  try {
    const brand_id = req.params.id;
    const brand_data = await brand.findOne({ _id: brand_id });

    res.status(statusCode.SUCCESS).render("admin/edit_brand", { brand: brand_data });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to edit brand" });
  }
};

const edit_brand = async (req, res) => {
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
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error });
  }
};

module.exports = {
  load_brands,
  load_add_new_brand,
  add_new_brand,
  load_edit_brand,
  edit_brand,
};
