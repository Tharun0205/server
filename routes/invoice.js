import express from 'express';
import Invoice from '../models/Invoice.js';
import ejs from 'ejs';
import pdf from 'html-pdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

// JWT middleware (can be imported if in its own file)
const requireLogin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
  }
};

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create invoice + PDF (now uses req.user.userId)
router.post('/', requireLogin, async (req, res) => {
  try {
    const invoice = new Invoice({
      ...req.body,
      userId: req.user.userId
    });
    await invoice.save();

    const templatePath = path.join(__dirname, '../templates/invoice-template.ejs');
    const html = await ejs.renderFile(templatePath, { invoice });
    const pdfDir = path.join(__dirname, '../pdfs');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);
    const pdfPath = path.join(pdfDir, `invoice-${invoice._id}.pdf`);
    pdf.create(html).toFile(pdfPath, (err, result) => {
      if (err) {
        console.error("PDF generation error:", err);
        return res.status(500).json({ message: 'Failed to generate PDF' });
      }
      const justFilename = path.basename(result.filename);
      res.status(201).json({
        message: 'Invoice saved and PDF generated',
        invoice,
        pdfFilename: justFilename
      });
    });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get logged-in user's invoices - use req.user.userId
router.get('/my', requireLogin, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.userId });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching invoices', error: err.message });
  }
});

router.get('/pdf/:filename', (req, res) => {
  const filename = req.params.filename;
  const pdfPath = path.join(__dirname, '../pdfs', filename);

  if (fs.existsSync(pdfPath)) {
    res.download(pdfPath, filename);
  } else {
    res.status(404).json({ message: 'PDF not found' });
  }
});

export default router;
