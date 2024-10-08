const brand = require("../../models/brand_model");
const { uploadToCloudinary } = require("../../config/cloudinary");

const load_brands = async (req, res) => {
  try {
    const brands = await brand.find({ is_deleted: false });

    return res.status(200).render("admin/brands", { brands: brands });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const load_add_new_brand = async (req, res) => {
  try {
    return res.status(200).render("admin/add_new_brand");
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create brand", error: err.message });
  }
};

const add_new_brand = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "No logo file uploaded." });
    }
    const logo = req.files.file;

    const upload_result = await uploadToCloudinary(logo);

    const new_brand = await brand.create({
      brandName: name,
      description: description,
      logo: upload_result.url,
    });

    return res.status(200).json({ message: "new brand added and saved" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create new brand" });
  }
};

const load_edit_brand = async (req, res) => {
  try {
    const brand_id = req.params.id;
    const brand_data = await brand.findOne({ _id: brand_id });

    res.status(200).render("admin/edit_brand", { brand: brand_data });
  } catch (error) {
    res.status(500).json({ message: "Failed to edit brand" });
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
    return res.status(200).json({ success: true, message: "brand updated" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

module.exports = {
  load_brands,
  load_add_new_brand,
  add_new_brand,
  load_edit_brand,
  edit_brand,
};
