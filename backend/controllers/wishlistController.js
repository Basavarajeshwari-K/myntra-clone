const Wishlist = require("../models/wishlistModel");

// add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const item = new Wishlist({ userId, productId });
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get wishlist for user
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ userId: req.params.userId });
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.id);
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
