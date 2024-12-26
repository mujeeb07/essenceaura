const Category = require("../../models/category_model");
const statusCode = require('../../constance/statusCodes')

const categories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(statusCode.SUCCESS).render("admin/catagories", { categories });
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: "server error" });
  }
};

const get_categories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(statusCode.SUCCESS).json(categories);
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: "server error " });
  }
};
const add_category = async (req, res) => {
  try {
    const { name, description, gender } = req.body;

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") } 
    });

    if (existingCategory) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ error: "Category with this name already exists" });
    }

    const new_category = new Category({
      name: name,
      description: description,
      gender: gender,
    });

    await new_category.save();

    return res.status(statusCode.SUCCESS).json({ message: "Category added successfully" });
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: "Server error" });
  }
};

const update_category = async (req, res) => {
  try {
    const { name, description, gender } = req.body;

    const id = req.params.id;

    const existing_category = await Category.findOne({
      _id: { $ne: id}, 
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if(existing_category){
      return res.status(statusCode.BAD_REQUEST).json({error:"Category with this name already exist"});
    }
    
    const updated_category = await Category.findByIdAndUpdate(
      id,
      { name, description, gender },
      { new: true }
    );
    return res.status(statusCode.SUCCESS).json({ updated_category });
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: "Error updating category" });
  }
};

const get_category_by_id = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    return res.status(statusCode.SUCCESS).json(category);
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: "server error" });
  }
};



const soft_delete_category = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    const updated_category = await Category.findByIdAndUpdate(
      id,
      { $set: { is_active: !category.is_active } },
      { new: true }
    );
    return res.status(statusCode.SUCCESS).json({message: "Category soft deleted successfully",updated_category,});
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ error: "Error deleting category" });
  }
};

module.exports = {
  categories,
  add_category,
  get_categories,
  update_category,
  get_category_by_id,
  soft_delete_category,
};
