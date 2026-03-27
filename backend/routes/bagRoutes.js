const express = require("express");
const router = express.Router();
const { addToBag, getBag, removeFromBag, updateQuantity, addToBagDB } = require("../controllers/bagController");

// OLD bag
router.post("/", addToBag);
router.get("/:userId", getBag);
router.delete("/:id", removeFromBag);
router.put("/:id", updateQuantity);

// NEW database cart (save for later ready)
router.post("/db", addToBagDB);

module.exports = router;
