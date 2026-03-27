const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getUserTransactions,
  exportTransactionsCSV,
  exportTransactionsPDF,
  downloadReceipt,
} = require("../controllers/transactionController");

// POST - Create transaction
router.post("/", createTransaction);

// GET - Export CSV
router.get("/export/csv/:userId", exportTransactionsCSV);

// GET - Export PDF
router.get("/export/pdf/:userId", exportTransactionsPDF);

// GET - Get all transactions for a user (with optional filters: type, dateFrom, dateTo)
router.get("/:userId", getUserTransactions);

// GET - Download single transaction receipt
router.get("/:transactionId/receipt", downloadReceipt);

module.exports = router;