const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    trackingId: { type: String, required: true, unique: true },
    recipientEmail: { type: String, required: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ['Sent', 'Seen'], default: 'Sent' },
}, { timestamps: true });

module.exports = mongoose.model('Email', emailSchema);
