const Cart = require("../models/Cart");
const Bag = require("../models/bagModel");

// add item to bag (OLD SYSTEM)
const addToBag = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const item = new Bag({ userId, productId, quantity });
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get bag items for user
const getBag = async (req, res) => {
  try {
    const bag = await Bag.find({ userId: req.params.userId });
    res.json(bag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// remove item from bag
const removeFromBag = async (req, res) => {
  try {
    await Bag.findByIdAndDelete(req.params.id);
    res.json({ message: "Removed from bag" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update quantity
const updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Bag.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ---------- NEW DATABASE CART (SAVE FOR LATER SUPPORT) ----------

// add to cart database
const addToBagDB = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    const existing = cart.products.find(p => p.productId === productId);

    if (existing) {
      existing.quantity += quantity || 1;
      existing.status = "active";
    } else {
      cart.products.push({ productId, quantity, status: "active" });
    }

    await cart.save();

    res.json({ message: "Added to bag database" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// move item to Save for Later
const saveForLater = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.products.find(p => p.productId === productId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.status = "saved";

    await cart.save();

    res.json({ message: "Item moved to save for later" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  addToBag,
  getBag,
  removeFromBag,
  updateQuantity,
  addToBagDB,
  saveForLater
};
