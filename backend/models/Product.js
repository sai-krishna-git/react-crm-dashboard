// Product model (models/Product.js)
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  // other fields
});

const Product = mongoose.model("Product", productSchema, "products"); // "products" is the collection name
module.exports = Product;
