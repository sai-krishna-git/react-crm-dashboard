// Order model (models/Order.js)
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: String,
  total: Number,
  status: String,
  // other fields
});

const Order = mongoose.model("Order", orderSchema, "orders"); // "orders" is the collection name
module.exports = Order;
