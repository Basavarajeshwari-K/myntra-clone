const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  getRecommendedProducts
} = require("../controllers/productController");

// create product
router.post("/", createProduct);

// 🔥 IMPORTANT: recommendations must be BEFORE /:id
router.get("/recommendations/:id", getRecommendedProducts);

// get all products
router.get("/", getProducts);

// get single product
router.get("/:id", getProductById);

module.exports = router;
