const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const bagRoutes = require("./routes/bagRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const historyRoutes = require("./routes/historyRoutes");

/* ===== ADDED TRANSACTION ROUTE ===== */
const transactionRoutes = require("./routes/transactionRoutes");

/* ===== ADDED PUSH NOTIFICATION ROUTE ===== */
const pushRoutes = require("./routes/PushRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   FIX: Serve uploads folder
   ========================= */
const uploadsPath = path.resolve(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));
console.log("Uploads folder path:", uploadsPath);

/* =========================
   ROUTES
   ========================= */
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/bag", bagRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/history", historyRoutes);

/* ===== ADDED TRANSACTIONS ROUTE ===== */
app.use("/api/transactions", transactionRoutes);

/* ===== PUSH NOTIFICATION ROUTE ===== */
app.use("/api/push", pushRoutes);

/* =========================
   TEST ROUTE
   ========================= */
app.get("/", (req, res) => {
  res.send("Myntra backend is working");
});

/* =========================
   DATABASE CONNECTION
   ========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

/* =========================
   SERVER START
   ========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on network port ${PORT}`);
});