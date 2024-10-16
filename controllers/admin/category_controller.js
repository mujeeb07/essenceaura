const Category = require("../../models/category_model");

const categories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).render("admin/catagories", { categories });
  } catch (error) {
    return res.status(500).json({ error: "server error" });
  }
};

const get_categories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ error: "server error " });
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
        .status(400)
        .json({ error: "Category with this name already exists" });
    }

    const new_category = new Category({
      name: name,
      description: description,
      gender: gender,
    });

    await new_category.save();

    return res.status(200).json({ message: "Category added successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

const get_category_by_id = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ error: "server error" });
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
      return res.status(400).json({error:"Category with this name already exist"});
    }
    
    const updated_category = await Category.findByIdAndUpdate(
      id,
      { name, description, gender },
      { new: true }
    );
    return res.status(200).json({ updated_category });
  } catch (error) {
    return res.status(500).json({ error: "Error updating category" });
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
    return res.status(200).json({message: "Category soft deleted successfully",updated_category,});
  } catch (error) {
    return res.status(500).json({ error: "Error deleting category" });
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
