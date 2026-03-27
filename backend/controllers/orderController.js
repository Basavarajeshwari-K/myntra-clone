const Order = require("../models/orderModel");
const PushToken = require("../models/PushToken");

// Use global fetch or fallback
let fetchFn;
try {
  fetchFn = fetch;
} catch {
  fetchFn = require("node-fetch").default;
}

// ---------------- SEND PUSH FUNCTION ----------------
const sendOrderNotification = async (userId, title, body) => {
  try {
    const tokenEntry = await PushToken.findOne({ userId });
    if (!tokenEntry) {
      console.log("No push token found for user");
      return;
    }

    const message = {
      to: tokenEntry.token,
      title,
      body,
      sound: "default",
    };

    const response = await fetchFn("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([message]),
    });

    const data = await response.json();
    console.log("Order push response:", data);
  } catch (err) {
    console.log("Order push error:", err);
  }
};
// ----------------------------------------------------

// place order (receive from app)
const placeOrder = async (req, res) => {
  console.log("ORDER API HIT");
  console.log("BODY:", req.body);

  try {
    const { userId, products, totalPrice, address, paymentType } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId missing" });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    if (!totalPrice) {
      return res.status(400).json({ message: "Total price missing" });
    }

    const mergedProducts = [];

    products.forEach((item) => {
      const existing = mergedProducts.find(
        (p) => p.productId === item.productId
      );

      if (existing) {
        existing.quantity += item.quantity;
      } else {
        mergedProducts.push({
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    });

    const order = new Order({
      userId,
      products: mergedProducts,
      totalPrice,
      address: address || "Not Provided",
      paymentType: paymentType || "COD",
      status: "Placed",
    });

    await order.save();

    // ✅ Send Order Placed Notification
    await sendOrderNotification(
      userId,
      "Order Placed",
      "Your order has been placed successfully 🎉"
    );

    // ✅ Send Shipped Notification (delayed 5 seconds)
    setTimeout(async () => {
      await sendOrderNotification(
        userId,
        "Order Shipped 🚚",
        "Your order is on the way!"
      );
    }, 5000); // 5000 ms = 5 seconds

    res.status(200).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.log("ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// get all orders (latest first)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get orders for specific user
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // ✅ Send Status Update Notification
    if (order) {
      await sendOrderNotification(
        order.userId,
        "Order Update",
        `Your order is now ${status}`
      );
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { placeOrder, getOrders, getUserOrders, updateOrderStatus };