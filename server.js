import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';

import authRoutes from './routes/auth.js';
import invoiceRoutes from './routes/invoice.js';

dotenv.config();
const app = express();

// --- CORS Middleware: ALLOW BOTH LOCALHOST AND DEPLOYED FRONTEND ---
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://invoice-frontend-beta-neon.vercel.app'
  ],
  credentials: true
}));

// --- Session Middleware: for login persistence ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// --- Body Parser ---
app.use(express.json());

// --- Your Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
