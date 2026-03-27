const Product = require("../models/productModel");
const mongoose = require("mongoose");
const History = require("../models/historyModel");
const Wishlist = require("../models/wishlistModel");
const UserActivity = require("../models/UserActivityModel");

const BASE_URL = "http://192.168.1.2:5000";

// ================= CREATE PRODUCT =================
const createProduct = async (req, res) => {
  try {
    const { name, price, category, image, description, stock } = req.body;
    const product = new Product({
      name,
      price,
      category: category || "Uncategorized",
      image,
      description,
      stock,
    });
    await product.save();
    res.json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL PRODUCTS =================
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET SINGLE PRODUCT =================
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    let userId = req.query.userId || "guest";

    if (userId === "rajesh1234") userId = "rajeshwarik";

    if (!mongoose.Types.ObjectId.isValid(productId))
      return res.status(404).json({ message: "Invalid product id" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    try {
      await History.create({ userId, productId: product._id });
    } catch (e) {
      console.warn(e.message);
    }

    try {
      await UserActivity.findOneAndUpdate(
        { userId },
        { $push: { viewedProducts: { productId: product._id, viewedAt: new Date() } } },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn(e.message);
    }

    let imagePath = product.image || "";

    if (imagePath.startsWith("uploads/")) {
      imagePath = imagePath.replace(/^uploads\//, "");
    }

    const productWithFullImage = {
      ...product.toObject(),
      image: imagePath.startsWith("http")
        ? imagePath
        : `${BASE_URL}/uploads/${encodeURIComponent(imagePath)}`,
      images: product.images?.map(img => {
        let cleanedImg = img;
        if (cleanedImg.startsWith("uploads/")) {
          cleanedImg = cleanedImg.replace(/^uploads\//, "");
        }
        return cleanedImg.startsWith("http")
          ? cleanedImg
          : `${BASE_URL}/uploads/${encodeURIComponent(cleanedImg)}`;
      }) || [],
    };

    res.json(productWithFullImage);
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= INTELLIGENT RECOMMENDATION ENGINE =================
const getRecommendedProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.query.userId || "guest";

    let categories = new Set();
    let recommended = [];

    // 1️⃣ Current product category
    if (mongoose.Types.ObjectId.isValid(productId)) {
      const currentProduct = await Product.findById(productId);
      if (currentProduct && currentProduct.category) {
        categories.add(currentProduct.category);
      }
    }

    // 2️⃣ Browsing history categories
    try {
      const history = await History.find({ userId }).limit(10);
      const historyProductIds = history.map(h => h.productId);

      const historyProducts = await Product.find({
        _id: { $in: historyProductIds }
      });

      historyProducts.forEach(p => {
        if (p.category) categories.add(p.category);
      });

    } catch (e) {
      console.warn("History read error:", e.message);
    }

    // 3️⃣ Wishlist categories
    try {
      const wishlist = await Wishlist.find({ userId });

      const wishlistProductIds = wishlist.map(w => w.productId);

      const wishlistProducts = await Product.find({
        _id: { $in: wishlistProductIds }
      });

      wishlistProducts.forEach(p => {
        if (p.category) categories.add(p.category);
      });

    } catch (e) {
      console.warn("Wishlist read error:", e.message);
    }

    // 4️⃣ Find products using collected categories
    if (categories.size > 0) {
      recommended = await Product.find({
        category: { $in: Array.from(categories) },
        _id: { $ne: productId }
      })
      .limit(12)
      .select("_id name price image images brand sizes offer category description");
    }

    // 5️⃣ Random fallback
    if (recommended.length === 0) {
      recommended = await Product.aggregate([{ $sample: { size: 6 } }]);
    }

    // 6️⃣ Format images
    recommended = recommended.map(p => {
      let imagePath = p.image || (p.images && p.images[0]) || "";

      if (imagePath.startsWith("uploads/")) {
        imagePath = imagePath.replace(/^uploads\//, "");
      }

      return {
        _id: p._id,
        name: p.name,
        price: p.price,
        brand: p.brand || "",
        sizes: p.sizes || [],
        offer: p.offer || 0,
        category: p.category || "",
        description: p.description || "",
        image: imagePath.startsWith("http")
          ? imagePath
          : `${BASE_URL}/uploads/${encodeURIComponent(imagePath)}`,
        images: (p.images || []).map(img => {
          let cleanedImg = img;
          if (cleanedImg.startsWith("uploads/")) {
            cleanedImg = cleanedImg.replace(/^uploads\//, "");
          }
          return cleanedImg.startsWith("http")
            ? cleanedImg
            : `${BASE_URL}/uploads/${encodeURIComponent(cleanedImg)}`;
        }),
      };
    }).slice(0, 6);

    console.log("RECOMMENDED PRODUCTS SENT:", recommended.map(p => p.name));

    res.json(recommended);

  } catch (error) {
    console.error("RECOMMENDATION ERROR:", error);
    res.status(500).json({ message: "Recommendation error" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getRecommendedProducts,
};