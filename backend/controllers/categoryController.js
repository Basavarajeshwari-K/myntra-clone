const Category = require("../models/categoryModel");

// create category
const createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const category = new Category({ name, image });
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCategory, getCategories };
