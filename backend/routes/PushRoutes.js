const express = require("express");
const router = express.Router();
const PushToken = require("../models/PushToken");
const Order = require("../models/orderModel"); // order model

// Use global fetch in Node 18+ or fallback to node-fetch
const fetchFn = global.fetch || require("node-fetch").default;

// --- Helper: send push notifications to Expo ---
async function sendPushNotification(tokens, title, body, data = {}) {
  if (!tokens.length) return;

  const messages = tokens.map(t => ({
    to: t.token,
    title,
    body,
    sound: "default",
    data,
    channelId: "default",
  }));

  try {
    const response = await fetchFn("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    // Remove invalid tokens
    if (result.data && Array.isArray(result.data)) {
      result.data.forEach((res, index) => {
        if (res.status === "error" && res.details?.error === "DeviceNotRegistered") {
          PushToken.deleteOne({ token: messages[index].to }).catch(err =>
            console.error("Failed to remove invalid token:", err)
          );
        }
      });
    }

    console.log("Push send result:", result);
    return result;
  } catch (err) {
    console.error("Push send error:", err);
    return { error: err.message };
  }
}

// Register a new device token
router.post("/register", async (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) return res.status(400).json({ error: "userId and token are required" });

  try {
    const existing = await PushToken.findOne({ token });
    if (existing) return res.json({ success: true, message: "Token already registered" });

    const newToken = new PushToken({ userId, token });
    await newToken.save();
    res.json({ success: true, token: newToken });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Optional: get all tokens
router.get("/", async (req, res) => {
  try {
    const tokens = await PushToken.find();
    res.json(tokens);
  } catch (err) {
    console.error("Get tokens error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Send notification to all registered tokens
router.post("/send", async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: "Title and body are required" });

  try {
    const tokens = await PushToken.find().select("token -_id");
    if (!tokens.length) return res.status(400).json({ error: "No tokens registered" });

    const result = await sendPushNotification(tokens, title, body, { test: "123" });
    res.json({ success: true, response: result });
  } catch (err) {
    console.error("Push send error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Cart reminder
router.post("/cart-reminder", async (req, res) => {
  const { userId, cartItems } = req.body;
  if (!userId || !cartItems?.length) return res.status(400).json({ error: "userId and cartItems required" });

  try {
    const tokens = await PushToken.find({ userId });
    if (!tokens.length) return res.status(400).json({ error: "No tokens found for user" });

    const result = await sendPushNotification(
      tokens,
      "Your bag is waiting!",
      `You have ${cartItems.length} item(s) in your bag. Complete your purchase now.`,
      { cartItems, type: "CART_UPDATE" }
    );

    res.json({ success: true, message: "Cart reminder sent via backend", response: result });
  } catch (err) {
    console.error("Cart reminder route error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Order update notification
router.post("/order-update", async (req, res) => {
  const { userId, orderId, status } = req.body;
  if (!userId || !orderId || !status) return res.status(400).json({ error: "userId, orderId, and status required" });

  try {
    const tokens = await PushToken.find({ userId });
    if (!tokens.length) return res.status(400).json({ error: "No tokens found for user" });

    const result = await sendPushNotification(
      tokens,
      "Order Update",
      `Your order #${orderId} is now ${status}.`,
      { orderId, status, type: "ORDER_UPDATE" }
    );

    res.json({ success: true, message: "Order update notification sent", response: result });
  } catch (err) {
    console.error("Order update route error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update order status and trigger shipped notification
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();

    let result;
    if (status === "shipped") {
      const tokens = await PushToken.find({ userId: order.userId });
      if (tokens.length) {
        result = await sendPushNotification(
          tokens,
          "Order Shipped 🚚",
          "Your order is on the way!",
          { orderId: order._id, type: "ORDER_UPDATE", status: "SHIPPED" }
        );
      }
    }

    res.json({ success: true, order, response: result || null });
  } catch (err) {
    console.error("Order status update error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Promotion notification
router.post("/promotion", async (req, res) => {
  const { userId, title, message } = req.body;
  if (!title || !message) return res.status(400).json({ error: "Title and message required" });

  try {
    let tokens = [];
    if (userId) tokens = await PushToken.find({ userId });
    else tokens = await PushToken.find();

    if (!tokens.length) return res.status(400).json({ error: "No tokens found" });

    const result = await sendPushNotification(tokens, title, message, { promo: true });
    res.json({ success: true, message: "Promotion notification sent", response: result });
  } catch (err) {
    console.error("Promotion route error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Current token for testing
const CURRENT_TOKEN = "ExponentPushToken[l6heX6H4MNikD-eg2HDhEc]";

// Test route (dynamic title/body)
router.post("/test", async (req, res) => {
  const { title, body } = req.body;
  const notificationTitle = title || "Test Notification";
  const notificationBody = body || "This should appear on your device";

  try {
    const result = await sendPushNotification(
      [{ token: CURRENT_TOKEN }],
      notificationTitle,
      notificationBody,
      { test: true }
    );

    res.json({ success: true, message: "Test push sent", response: result });
  } catch (err) {
    console.error("Test push error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;  