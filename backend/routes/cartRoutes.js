const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

// use fetch for calling push route
const fetchFn = global.fetch || require("node-fetch").default;

// ================= ADD TO CART =================
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    const existing = cart.products.find(p => p.productId === productId);

    if (existing) {
      existing.quantity += quantity || 1;
      existing.status = "active"; // if coming from save later → move back to bag
    } else {
      cart.products.push({
        productId,
        quantity: quantity || 1,
        status: "active"
      });
    }

    await cart.save();

    // ===== Trigger Push Notification =====
    try {
      await fetchFn("http://192.168.1.2:5000/api/push/cart-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          cartItems: cart.products.filter(p => p.status === "active")
        })
      });
    } catch (err) {
      console.log("Cart notification error:", err.message);
    }
    // =====================================

    res.json({ message: "Added to cart" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET USER CART =================
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
      return res.json({
        userId: req.params.userId,
        products: []
      });
    }

    res.json(cart);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SAVE FOR LATER / MOVE TO BAG =================
router.put("/status", async (req, res) => {
  try {
    const { userId, productId, status } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.products.find(p => p.productId === productId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Update status: "active" → in cart, "saveForLater" → saved items
    if (status === "saveForLater") {
      item.status = "saveForLater";
    } else if (status === "active") {
      item.status = "active";
    }

    await cart.save();

    res.json({ message: `Item moved to ${status === "saveForLater" ? "saved items" : "cart"}` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= REMOVE ITEM =================
router.delete("/remove/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(p => p.productId !== productId);

    await cart.save();

    res.json({ message: "Item removed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET SAVED ITEMS =================
router.get("/saved/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const savedItems = cart.products.filter(p => p.status === "saveForLater");

    res.json({ savedItems });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DELETE SAVED ITEM =================
router.delete("/saved/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(
      p => !(p.productId === productId && p.status === "saveForLater")
    );

    await cart.save();

    res.json({ message: "Saved item removed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;