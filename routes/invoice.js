import express from 'express';
import Invoice from '../models/Invoice.js';
import ejs from 'ejs';
import pdf from 'html-pdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/', async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Please login' });
  }

  try {
    const invoice = new Invoice({
      ...req.body,
      userId: req.session.userId
    });

    await invoice.save();

    const templatePath = path.join(__dirname, '../templates/invoice-template.ejs');
    const html = await ejs.renderFile(templatePath, { invoice });

    const pdfDir = path.join(__dirname, '../pdfs');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

    const pdfPath = path.join(pdfDir, `invoice-${invoice._id}.pdf`);
   // in invoice.js backend
  pdf.create(html).toFile(pdfPath, (err, result) => {
  if (err) {
    console.error("PDF generation error:", err);
    return res.status(500).json({ message: 'Failed to generate PDF' });
  }

  const justFilename = path.basename(result.filename);

  res.status(201).json({
    message: 'Invoice saved and PDF generated',
    invoice,
    pdfFilename: justFilename                // <-- this change!
  });
});


  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized: Not logged in' });
  }

  try {
    const invoices = await Invoice.find({ userId: req.session.userId });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching invoices', error: err.message });
  }
});
router.get('/pdf/:filename', (req, res) => {
  const filename = req.params.filename;
  const pdfPath = path.join(__dirname, '../pdfs', filename);

  if (fs.existsSync(pdfPath)) {
    res.download(pdfPath, filename); // Triggers download in browser
  } else {
    res.status(404).json({ message: 'PDF not found' });
  }
});


export default router;