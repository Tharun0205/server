import express from 'express';
import Invoice from '../models/Invoice.js';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import puppeteer from 'puppeteer';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JWT authentication middleware
const requireLogin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token payload (userId, email, etc.)
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
  }
};

const router = express.Router();

// @route   POST /api/invoices/
// @desc    Create invoice, generate PDF (with Puppeteer), and respond with invoice and PDF filename
// @access  Protected (requires JWT)
router.post('/', requireLogin, async (req, res) => {
  try {
    // Create new invoice document with userId from the JWT middleware
    const invoice = new Invoice({
      ...req.body,
      userId: req.user.userId
    });
    await invoice.save();

    // Render EJS template to HTML with invoice data
    const templatePath = path.join(__dirname, '../templates/invoice-template.ejs');
    const html = await ejs.renderFile(templatePath, { invoice });

    // Ensure the pdf directory exists
    const pdfDir = path.join(__dirname, '../pdfs');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

    // Define the PDF filename & path
    const pdfPath = path.join(pdfDir, `invoice-${invoice._id}.pdf`);

    // ==== Puppeteer PDF generation ====
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: pdfPath, format: 'A4' });
    await browser.close();
    // ==================================

    const justFilename = path.basename(pdfPath);
    res.status(201).json({
      message: 'Invoice saved and PDF generated',
      invoice,
      pdfFilename: justFilename
    });

  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/invoices/my
// @desc    Get invoices belonging to logged-in user
// @access  Protected (requires JWT)
router.get('/my', requireLogin, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.userId });
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ message: 'Error fetching invoices', error: err.message });
  }
});

// @route GET /api/invoices/pdf/:filename
// @desc  Download invoice PDF by filename (public access or secured as you prefer)
router.get('/pdf/:filename', (req, res) => {
  const filename = req.params.filename;
  const pdfPath = path.join(__dirname, '../pdfs', filename);

  if (fs.existsSync(pdfPath)) {
    res.download(pdfPath, filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  } else {
    res.status(404).json({ message: 'PDF not found' });
  }
});

export default router;
