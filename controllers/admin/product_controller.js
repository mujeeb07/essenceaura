const Product = require("../../models/product_model");
const Category = require("../../models/category_model");
const Brand = require("../../models/brand_model");
const { uploadToCloudinary } = require("../../config/cloudinary");
const mongoose = require("mongoose");

const load_list_product = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1 ;
    const items_per_page = 5;
    const total_products = await Product.countDocuments();
    const total_pages = Math.ceil( total_products / items_per_page );

    const products_list = await Product.find({}).populate("category").populate("brand").skip((page - 1) * items_per_page ).limit(items_per_page);

    return res.status(200).render("admin/products_list", { products_list, current_page: page, total_pages: total_pages });
  } catch (error) {
    return res.status(400);
  }
};

const load_add_product = async (req, res) => {
  try {
    const category = await Category.find();
    const brand = await Brand.find();
    return res.status(200).render("admin/add_product", { category, brand });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const add_product = async (req, res) => {

  console.log('Add product page.')

  try {
    const {
      product_name,
      product_description,
      volumeVariants,
      priceVariants,
      stockVariants,
      brand,
      category,
    } = req.body;

    const productCardImage = req.files?.product_card_image[0];
    const productDetailImages = req.files?.product_details_images || [];

    if (!productCardImage) {
      return res.status(400).json({ error: "Product card image is required." });
    }

    if (
      !product_name ||
      !product_description ||
      !volumeVariants ||
      !priceVariants ||
      !stockVariants ||
      !brand ||
      !category
    ) {
      return res
        .status(400)
        .json({ error: "All product details are required." });
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

    console.log('New prodcut details: ', new_product);
    return res.status(200).json({ message: "New product added and saved", product: new_product });
  } catch (error) {
    console.error("Error with add product controller:", error);
    return res.status(500).json({ error: "Something went wrong while adding the product." });
  }
};

const load_edit_product = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId })
      .populate("brand")
      .populate("category");
    const brand = await Brand.find();
    const category = await Category.find();

    return res.status(200).render("admin/edit_product", {
      product,
      brands: brand,
      categories: category,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Server error");
  }
};

const edit_product = async (req, res) => {
  try {
    const productId = req.params.id;
    const { product_name, product_description, brand, category, status } = req.body;

    let variants = {};
    if (req.body.variants) { variants = JSON.parse(req.body.variants) }

    let product = await Product.findById(productId);
    if (!product) { return res.status(404).json({ message: "Product not found", success: false }) }

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
    console.log("Product updated successfully");
    return res.status(200).redirect('/admin/admin_list_product');
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "An error occurred while updating the product", success: false });
  }
};

module.exports = {
  load_add_product,
  add_product,
  load_list_product,
  load_edit_product,
  edit_product,
};
