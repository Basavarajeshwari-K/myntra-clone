const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    products: [
      {
        productId: { type: String, required: true }, // frontend id
        quantity: { type: Number, default: 1 }
      }
    ],

    totalPrice: { type: Number, required: true },

    // payment method
    paymentType: {
      type: String,
      default: "COD" // COD, UPI, CARD
    },

    status: {
      type: String,
      default: "placed"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);