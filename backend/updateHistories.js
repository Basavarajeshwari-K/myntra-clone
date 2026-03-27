// updateHistories.js
require("dotenv").config(); // Load .env variables
const mongoose = require("mongoose");
const History = require("./models/historyModel"); // Adjust path if needed

// Use the MONGO_URI from .env
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function updateUserId() {
  try {
    const result = await History.updateMany(
      { userId: "rajesh123" },         // old userId
      { $set: { userId: "rajeshwarik" } } // new userId
    );

    console.log("Updated records:", result.modifiedCount);
  } catch (err) {
    console.error("Error updating histories:", err);
  } finally {
    mongoose.connection.close();
  }
}

updateUserId();