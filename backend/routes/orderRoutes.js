const express = require("express");
const router = express.Router();
const { placeOrder, getOrders, updateOrderStatus } = require("../controllers/orderController");

// place order
router.post("/", placeOrder);

// get user orders
router.get("/:userId", getOrders);

// update order status
router.put("/:id", updateOrderStatus);

module.exports = router;
