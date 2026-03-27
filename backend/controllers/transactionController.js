const Transaction = require("../models/transactionModel");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get user transactions with optional filters
exports.getUserTransactions = async (req, res) => {
  const { userId } = req.params;
  const { type, dateFrom, dateTo } = req.query;

  const filter = { userId };

  if (type) filter.transactionType = type;

  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  try {
    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Helper: normalize transaction documents for export
const normalizeTransactions = (transactions) => {
  return transactions.map((tx) => ({
    productName: tx.productName || "",
    amount: tx.amount || 0,
    transactionType: tx.transactionType || "",
    paymentMethod: tx.paymentMethod || "",
    status: tx.status || "",
    createdAt: tx.createdAt ? tx.createdAt.toISOString() : "",
  }));
};

// Export CSV
exports.exportTransactionsCSV = async (req, res) => {
  const { userId } = req.params;

  try {
    const transactions = await Transaction.find({ userId });
    const normalized = normalizeTransactions(transactions);

    const parser = new Parser();
    const csv = parser.parse(normalized);

    res.header("Content-Type", "text/csv");
    res.attachment(`transactions_${userId}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Export PDF with table headers and automatic page breaks
exports.exportTransactionsPDF = async (req, res) => {
  const { userId } = req.params;

  try {
    const transactions = await Transaction.find({ userId });
    const normalized = normalizeTransactions(transactions);

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transactions_${userId}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.fontSize(18).text("Transaction History", { align: "center" });
    doc.moveDown();

    // Table headers
    const headers = ["#", "Date", "Product", "Amount", "Type", "Payment", "Status"];
    const columnWidths = [30, 90, 160, 60, 80, 80, 60];
    const rowHeight = 20;
    let y = doc.y;

    const drawHeaders = () => {
      headers.forEach((header, i) => {
        doc.font("Helvetica-Bold").text(header, doc.x, y, {
          width: columnWidths[i],
          continued: i < headers.length - 1,
        });
      });
      y += rowHeight;
      doc.moveDown(0.5);
    };

    drawHeaders();

    // Draw rows with automatic page breaks
    normalized.forEach((tx, idx) => {
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.y;
        drawHeaders();
      }

      const values = [
        (idx + 1).toString(),
        new Date(tx.createdAt).toDateString(),
        tx.productName,
        tx.amount.toString(),
        tx.transactionType,
        tx.paymentMethod,
        tx.status,
      ];

      let x = doc.x;
      values.forEach((val, i) => {
        doc.font("Helvetica").text(val, x, y, { width: columnWidths[i], continued: i < values.length - 1 });
        x += columnWidths[i];
      });

      y += rowHeight;
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Download single transaction receipt
exports.downloadReceipt = async (req, res) => {
  const { transactionId } = req.params;
  try {
    const tx = await Transaction.findById(transactionId);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    const doc = new PDFDocument();
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${transactionId}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(18).text("Transaction Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Product: ${tx.productName}`);
    doc.text(`Amount: ${tx.amount}`);
    doc.text(`Payment Mode: ${tx.paymentMethod}`);
    doc.text(`Transaction Type: ${tx.transactionType}`);
    doc.text(`Status: ${tx.status}`);
    doc.text(`Date: ${tx.createdAt.toDateString()}`);

    doc.end();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};