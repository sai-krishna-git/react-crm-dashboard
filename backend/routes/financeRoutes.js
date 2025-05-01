const express = require("express");
const Finance = require("../models/Finance");
const { authMiddleware } = require("../middleware/authMiddleware"); // ✅ fixed here

const router = express.Router();

// ✅ Get Total Income Report (Place FIRST)
router.get("/total", authMiddleware, async (req, res) => {
    try {
        const records = await Finance.find();
        const totalIncome = records.reduce((sum, r) => sum + r.paidAmount, 0);
        const totalPending = records.reduce((sum, r) => sum + r.pendingAmount, 0);
        const totalAmount = records.reduce((sum, r) => sum + r.totalAmount, 0);

        res.json({ totalAmount, totalIncome, totalPending });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ Add Finance Record
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { customer, totalAmount, paidAmount } = req.body;
        const pendingAmount = totalAmount - paidAmount;

        const record = await Finance.create({ customer, totalAmount, paidAmount, pendingAmount });
        res.json({ message: "Finance record created", record });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ Get All Financial Records
router.get("/", authMiddleware, async (req, res) => {
    try {
        const records = await Finance.find().populate("customer", "name email");
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ Delete Finance Record
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        await Finance.findByIdAndDelete(req.params.id);
        res.json({ message: "Finance record deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
