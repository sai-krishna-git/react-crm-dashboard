const Email = require('../models/Email');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

/**
 * Utility to safely delete a file
 */
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("❌ Error deleting file:", filePath, err);
        } else {
            console.log("🗑️ Temporary file deleted:", filePath);
        }
    });
};

/**
 * @desc Generate and download CSV report
 * @route GET /api/email/generate-csv
 */
const generateCSV = async (req, res) => {
    try {
        const emails = await Email.find();
        if (!emails.length) {
            return res.status(404).json({ error: "❌ No email data found" });
        }

        const fields = ['recipientEmail', 'subject', 'status', 'createdAt'];
        const parser = new Parser({ fields });
        const csv = parser.parse(emails);

        const fileName = `email_report_${Date.now()}.csv`;
        const filePath = path.join(__dirname, fileName);
        fs.writeFileSync(filePath, csv);

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'text/csv');

        res.download(filePath, (err) => {
            if (err) {
                console.error("❌ File download error:", err);
            }
            deleteFile(filePath);
        });

    } catch (error) {
        console.error("❌ Error generating CSV:", error);
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
};

/**
 * @desc Generate and download PDF report
 * @route GET /api/email/generate-pdf
 */
const generatePDF = async (req, res) => {
    try {
        const emails = await Email.find();
        if (!emails.length) {
            return res.status(404).json({ error: "❌ No email data found" });
        }

        res.setHeader('Content-Disposition', 'attachment; filename=email_report.pdf');
        res.setHeader('Content-Type', 'application/pdf');

        const doc = new PDFDocument();
        doc.pipe(res); // Stream PDF directly to response

        doc.fontSize(20).text('📧 Email Report', { align: 'center' }).moveDown();

        emails.forEach(email => {
            doc.fontSize(12).text(`Recipient: ${email.recipientEmail}`);
            doc.text(`Subject: ${email.subject}`);
            doc.text(`Status: ${email.status}`);
            doc.text(`Sent At: ${email.createdAt.toLocaleString()}`);
            doc.moveDown().text('----------------------------------------------').moveDown();
        });

        doc.end();
    } catch (error) {
        console.error("❌ Error generating PDF:", error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

module.exports = { generateCSV, generatePDF };
