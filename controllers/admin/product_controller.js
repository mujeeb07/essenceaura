const Product = require("../../models/product_model");
const Category = require("../../models/category_model");
const Brand = require("../../models/brand_model");
const { uploadToCloudinary } = require("../../config/cloudinary");
const mongoose = require("mongoose");
const statusCode = require('../../constance/statusCodes')



const loadProductList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1 ;
    const items_per_page = 5;
    const total_products = await Product.countDocuments();
    const total_pages = Math.ceil( total_products / items_per_page );

    const products_list = await Product.find({}).populate("category").populate("brand").skip((page - 1) * items_per_page ).limit(items_per_page);

    return res.status(statusCode.SUCCESS).render("admin/products_list", { products_list, current_page: page, total_pages: total_pages });
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
  }
};

const showAddProductPage = async (req, res) => {
  try {
    const category = await Category.find();
    const brand = await Brand.find();
    return res.status(statusCode.SUCCESS).render("admin/add_product", { category, brand });
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
  }
};

const addNewProduct = async (req, res) => {
  try {
    const { product_name, product_description, volumeVariants, priceVariants, stockVariants, brand, category } = req.body;
    const productCardImage = req.files?.product_card_image[0];
    const productDetailImages = req.files?.product_details_images || [];

    if (!productCardImage) {
      return res.status(statusCode.BAD_REQUEST).json({ error: "Product card image is required." });
    }

    if ( !product_name || !product_description || !volumeVariants || !priceVariants || !stockVariants || !brand || !category) {
      return res.status(statusCode.BAD_REQUEST).json({ error: "All product details are required." });
    }

    const brandId = mongoose.Types.ObjectId.createFromHexString(brand);
    const categoryId = mongoose.Types.ObjectId.createFromHexString(category);

    const priceArray = typeof priceVariants === "string" ? JSON.parse(priceVariants) : priceVariants;
    const stockArray = typeof stockVariants === "string" ? JSON.parse(stockVariants) : stockVariants;
    const volumeVariantsArray = typeof volumeVariants === "string" ? JSON.parse(volumeVariants) : volumeVariants;

    const product_image_result = await uploadToCloudinary( productCardImage, "products" );

    const additional_images_results = await Promise.all(
      productDetailImages.map((file) =>
        uploadToCloudinary(file, "product_details")
      )
    );

    const variants = volumeVariantsArray.map((volume, index) => ({
      volume: parseFloat(volume),
      price: parseFloat(priceArray[index]),
      stock: parseInt(stockArray[index], 10) || 0,
    }));

    const new_product = await Product.create({
      name: product_name,
      description: product_description,
      brand: brandId,
      category: categoryId,
      variants,
      product_card_image: product_image_result.url,
      product_details_images: additional_images_results.map((img) => img.url),
    });

    await new_product.save()

    return res.status(statusCode.SUCCESS).json({ message: "New product added and saved", product: new_product });
  } catch (error) {
    console.error("Error with add product controller:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500');
  }
};

const loadProductEditor = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId }).populate("brand").populate("category");
    const brand = await Brand.find();
    const category = await Category.find();
    return res.status(statusCode.SUCCESS).render("admin/edit_product", {
      product,
      brands: brand,
      categories: category,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500')
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { product_name, product_description, brand, category, status } = req.body;

    let variants = {};
    if (req.body.variants) { variants = JSON.parse(req.body.variants) }
    console.log("Updated Varinats Data : ", variants);

    let product = await Product.findById(productId);
    if (!product) { return res.status(statusCode.NOT_FOUND).render('../views/admin404', { title: 'Product Not Found' }); }

    product.name = product_name || product.name;
    product.description = product_description || product.description;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.is_blocked = status !== "on";

    if (variants) {
      product.variants = Object.keys(variants).map((volume) => ({
        volume: parseInt(volume),
        price: parseFloat(variants[volume].price),
        stock: parseInt(variants[volume].stock, 10) || 0,
      }));
    }

    if ( req.files && req.files.product_card_image && req.files.product_card_image ) {

      const productCardImage = req.files.product_card_image;
      const cardImageUpload = await uploadToCloudinary( productCardImage, "products" );

      if (cardImageUpload) {
        product.product_card_image = cardImageUpload.url;
      } else {
        console.error("Error uploading card image to Cloudinary.");
      }
    } else {
      console.log("No product card image provided.");
    }

    if ( req.files && req.files.product_details_images && req.files.product_details_images.length > 0) {
      const productDetailImages = req.files.product_details_images;
      const detailImagesUpload = await Promise.all(
        productDetailImages.map((image) =>
          uploadToCloudinary(image, "product_details")
        )
      );

      const detailImagesUrls = detailImagesUpload.map((upload) => upload.url);
      if (detailImagesUrls && detailImagesUrls.length > 0) {
        product.product_details_images = detailImagesUrls;
      } else {
        console.error("Error uploading detail images to Cloudinary.");
      }
    } else {
      console.log("No product detail images provided.");
    }

    await product.save();
    
    return res.status(statusCode.SUCCESS).redirect('/admin/admin_list_product');
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).render('../views/admin500')
  }
};

module.exports = {
  showAddProductPage,
  addNewProduct,
  loadProductList,
  loadProductEditor,
  updateProduct,
};
