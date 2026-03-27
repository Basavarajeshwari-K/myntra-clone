const mongoose = require("mongoose");
const express = require("express");
const app = express();

app.use(express.json());

const cartItemSchema = new mongoose.Schema({
  productId: String,
  quantity: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ["active", "saved", "saveForLater"],
    default: "active"
  }
});

const cartSchema = new mongoose.Schema({
  userId: String,
  products: [cartItemSchema]
});

const Cart = mongoose.model("Cart", cartSchema);

// Move item from saveForLater back to active cart
app.post("/api/cart/moveToCart", async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.products.find(
      (p) => p.productId === productId && p.status === "saveForLater"
    );

    if (!item)
      return res
        .status(404)
        .json({ message: "Item not found in saved items" });

    item.status = "active";
    await cart.save();

    res.json({ message: "Item moved back to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = Cart;
