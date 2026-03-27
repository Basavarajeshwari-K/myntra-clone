const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); // only if Node <18

let savedTokens = []; // temporary storage

// ========================
// REGISTER PUSH TOKEN
// ========================
router.post("/push/register", (req, res) => {
  const { userId, token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "Token missing" });
  }

  if (!savedTokens.find(t => t.token === token)) {
    savedTokens.push({ userId, token });
  }

  console.log("Saved Tokens:", savedTokens);

  res.json({
    success: true,
    message: "Token saved successfully",
  });
});

// ========================
// GET TOKENS (for testing)
// ========================
router.get("/push/tokens", (req, res) => {
  res.json(savedTokens);
});

// ========================
// TEST SHIPPED NOTIFICATION
// ========================
router.post("/push/test-shipped", async (req, res) => {
  const { token, orderId } = req.body;

  if (!token) return res.status(400).json({ success: false, error: "Missing token" });

  try {
    const message = {
      to: token,
      sound: "default",
      title: "Your order has shipped! 🚚",
      body: `Order #${orderId} is on its way.`,
      data: { type: "ORDER_UPDATE", status: "SHIPPED", orderId },
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    res.json({ success: true, expoResponse: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;