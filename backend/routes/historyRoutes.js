const express = require("express");
const router = express.Router();
const { addToHistory } = require("../controllers/historyController");

router.post("/", addToHistory);

module.exports = router;
