const mongoose = require("mongoose");

const financeSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Finance", financeSchema);
