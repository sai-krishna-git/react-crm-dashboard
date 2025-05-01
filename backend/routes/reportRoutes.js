const express = require("express");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const User = require("../models/User");
const Order = require("../models/Order"); // Collection name: orders
const Product = require("../models/Product"); // Collection name: products

const router = express.Router();

// Helper function to generate CSV reports
const generateCSV = async (data, filePath, header) => {
  const csvWriter = createCsvWriter({
    path: filePath,
    header: header,
  });

  await csvWriter.writeRecords(data);
};

// Helper function to generate PDF reports
const generatePDF = (data, filePath, title, formatData) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text(title, { align: "center" });
  doc.moveDown();

  data.forEach((item) => {
    doc.fontSize(12).text(formatData(item));
    doc.moveDown();
  });

  doc.end();
};

// Generate CSV Report for All Data (Users, Orders, Products)
router.get("/generate-csv-all", async (req, res) => {
  console.log("CSV report generation triggered...");

  try {
    // Fetch Users, Orders, and Products
    const users = await User.find({});
    const orders = await Order.find({}); // Collection name: orders
    const products = await Product.find({}); // Collection name: products

    const header = [
      { id: "type", title: "Type" },
      { id: "id", title: "ID" },
      { id: "name", title: "Name/Email/Order" },
      { id: "details", title: "Details" },
    ];

    // Combine data from Users, Orders, and Products into one array
    const combinedData = [
      ...users.map((user) => ({
        type: "User",
        id: user.email,
        name: user.email,
        details: `Email Opened: ${user.emailOpened ? "Yes" : "No"}`,
      })),
      ...orders.map((order) => ({
        type: "Order",
        id: order._id.toString(),
        name: order.customer,
        details: `Total: $${order.total || "N/A"}, Status: ${order.status || "N/A"}`, // Ensure `order.total` exists
      })),
      ...products.map((product) => ({
        type: "Product",
        id: product._id.toString(),
        name: product.name,
        details: `Price: $${product.price || "N/A"}`, // Ensure `product.price` exists
      })),
    ];

    // Generate CSV report with combined data
    await generateCSV(combinedData, "reports/all_data_report.csv", header);
    res.download("reports/all_data_report.csv");
  } catch (error) {
    console.error("Error generating CSV report:", error);
    res.status(500).send("Error generating CSV report.");
  }
});

// Generate PDF Report for All Data (Users, Orders, Products)
router.get("/generate-pdf-all", async (req, res) => {
  console.log("PDF report generation triggered...");

  try {
    // Fetch Users, Orders, and Products
    const users = await User.find({});
    const orders = await Order.find({}); // Collection name: orders
    const products = await Product.find({}); // Collection name: products
    const pdfPath = "reports/all_data_report.pdf";

    // Combine data from Users, Orders, and Products into one array
    const combinedData = [
      ...users.map((user) => ({
        type: "User",
        id: user.email,
        details: `Email Opened: ${user.emailOpened ? "Yes" : "No"}`,
      })),
      ...orders.map((order) => ({
        type: "Order",
        id: order._id.toString(),
        details: `Customer: ${order.customer}, Total: $${order.total || "N/A"}, Status: ${order.status || "N/A"}`, // Ensure `order.total` exists
      })),
      ...products.map((product) => ({
        type: "Product",
        id: product._id.toString(),
        details: `Name: ${product.name}, Price: $${product.price || "N/A"}`, // Ensure `product.price` exists
      })),
    ];

    // Generate PDF report with combined data
    generatePDF(combinedData, pdfPath, "Combined Reports (Users, Orders, Products)", (item) => {
      return `${item.type} - ID: ${item.id}, Details: ${item.details}`;
    });

    res.download(pdfPath);
  } catch (error) {
    console.error("Error generating PDF report:", error);
    res.status(500).send("Error generating PDF report.");
  }
});

module.exports = router;
