const History = require("../models/historyModel");

// save viewed product
const addToHistory = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const history = new History({ userId, productId });
    await history.save();

    res.status(200).json({ message: "History saved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addToHistory };
