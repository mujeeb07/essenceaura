const Product = require("../../models/product_model");
const Category = require("../../models/category_model");
const Brand = require("../../models/brand_model");
const { options } = require("../../routes/user/user_route");
const statusCode = require('../../constance/statusCodes')

const loadShopPage = async (req, res) => {
  try {
    const { categoryId, brandId, sortPrice, sortName } = req.query;

    let filter = { is_blocked: false, "variants.stock": { $gte: 1 } };
    let sort = {};

    if (categoryId) {
      filter.category = categoryId;
    }

    if (brandId) {
      filter.brand = brandId;
    }

    if (sortPrice) {
      sort["variants.price"] = sortPrice === "low-to-high" ? 1 : -1;
    } else if (sortName) {
      sort.name = sortName === "A-Z" ? 1 : -1;
    }

    const products = await Product.find(filter)
      .populate("brand")
      .populate("category")
      .sort(sort);
    const categories = await Category.find();
    const brands = await Brand.find();

    return res.status(statusCode.SUCCESS).render("user/shopping_page", {
      products,
      categories,
      brands,
      selectedCategory: categoryId,
      selectedBrand: brandId,
    });
  } catch (error) {
    console.error("Error loading shop page:", error);
    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong with the shop page" });
  }
};

const filterProducts = async (req, res) => {
  const { categories, brands, price, nameSort } = req.body;

  let filter_query = {};
  let sort_query = {};

  if (categories && categories.length > 0) {
    filter_query["category"] = { $in: categories };
  }

  if (brands && brands.length > 0) {
    filter_query["brand"] = { $in: brands };
  }

  if (price === "lowToHigh") {
    sort_query["variants.price"] = 1;
  } else if (price === "highToLow") {
    sort_query["variants.price"] = -1;
  }

  if (nameSort === "A-Z") {
    sort_query["name"] = 1;
  } else if (nameSort === "Z-A") {
    sort_query["name"] = -1;
  }

  try {
    const filtered_products = await Product.find(filter_query)
      .sort(sort_query)
      .populate("brand")
      .populate("category");

    return res.status(statusCode.SUCCESS).json({ success: true, products: filtered_products });
  } catch (error) {
    console.error("Error filtering products:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, error: "Failed to filter products" });
  }
};

const filterSearchResults =  async (req, res) => {
  try {
    const serach_query = req.query.q || "";
    const products =  await Product.find({
      name: { $regex: serach_query, $options: "i" }
    }).populate("brand").populate("category");
    return res.status(statusCode.SUCCESS).json({ success: true, products: products });
  } catch (error) {
    console.log("Error while search products.", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, error: "Error while search products"});
  }
}

module.exports = {
  loadShopPage,
  filterProducts,
  filterSearchResults
};
