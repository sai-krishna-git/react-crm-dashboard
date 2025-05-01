const express = require("express");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const Email = require("../models/Email");
const OTP = require("../models/OTP");
const path = require("path");
require("dotenv").config();

const router = express.Router();

// Check required environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.BASE_URL) {
    console.error("❌ ERROR: Missing EMAIL_USER, EMAIL_PASS, or BASE_URL in environment variables.");
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * 📌 Send Marketing Emails to Multiple Recipients
 */
router.post("/send-marketing-email", async (req, res) => {
    const { recipients, subject, message } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !subject || !message) {
        return res.status(400).json({ error: "❌ 'recipients' (array), 'subject', and 'message' are required." });
    }

    let successCount = 0;
    let failureCount = 0;
    const failedRecipients = [];

    for (const to of recipients) {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                text: message
            });
            console.log(`✅ Marketing email sent to ${to}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Failed to send to ${to}:`, error.message);
            failureCount++;
            failedRecipients.push(to);
        }
    }

    return res.status(200).json({
        success: true,
        message: `✅ Sent to ${successCount}, ❌ Failed for ${failureCount}`,
        failedRecipients
    });
});

/**
 * 📌 Send Tracked Email
 */
router.post("/send", async (req, res) => {
    const { recipientEmail, subject, message } = req.body;

    if (!recipientEmail || !subject || !message) {
        return res.status(400).json({ error: "❌ All fields are required (recipientEmail, subject, message)." });
    }

    const trackingId = uuidv4();
    const trackingUrl = `${process.env.BASE_URL}/api/email/track/${trackingId}`;

    const emailHtml = `
        <p>${message}</p>
        <img src="${trackingUrl}" width="1" height="1" style="display: none;" alt="tracker"/>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject,
            html: emailHtml
        });

        await Email.create({
            trackingId,
            recipientEmail,
            subject,
            status: "Sent"
        });

        console.log(`✅ Email sent to ${recipientEmail} (Tracking ID: ${trackingId})`);
        res.json({ message: "✅ Email sent successfully!", trackingId });
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        res.status(500).json({ error: "❌ Failed to send email." });
    }
});

/**
 * 📌 Send OTP
 */
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "❌ Email is required." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`
        });

        await OTP.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        console.log(`✅ OTP sent to ${email}: ${otp}`);
        res.json({ message: "✅ OTP sent successfully!" });
    } catch (error) {
        console.error("❌ OTP sending failed:", error);
        res.status(500).json({ error: "❌ Failed to send OTP." });
    }
});

/**
 * 📌 Verify OTP
 */
router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "❌ Email and OTP are required." });
    }

    try {
        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({ error: "❌ OTP not found. Please request a new one." });
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ error: "❌ OTP expired. Request a new one." });
        }

        if (otpRecord.otp !== parseInt(otp, 10)) {
            return res.status(400).json({ error: "❌ Invalid OTP." });
        }

        await OTP.deleteOne({ email });

        console.log(`✅ OTP verified for ${email}`);
        res.json({ message: "✅ OTP verified successfully!" });
    } catch (error) {
        console.error("❌ OTP verification failed:", error);
        res.status(500).json({ error: "❌ OTP verification error." });
    }
});

/**
 * 📌 Email Open Tracker
 */
router.get("/track/:trackingId", async (req, res) => {
    const { trackingId } = req.params;

    try {
        const emailRecord = await Email.findOne({ trackingId });

        if (emailRecord) {
            emailRecord.status = "Seen";
            emailRecord.lastOpenedAt = new Date();
            await emailRecord.save();
            console.log(`📩 Email ${trackingId} marked as 'Seen'`);
        }

        res.sendFile(path.join(__dirname, "../public/transparent.png"));
    } catch (error) {
        console.error("❌ Tracking error:", error);
        res.status(500).send("Error tracking email.");
    }
});

module.exports = router;
