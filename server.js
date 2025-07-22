import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';   // <-- NEW: use cors package

import authRoutes from './routes/auth.js';
import invoiceRoutes from './routes/invoice.js';

dotenv.config();
const app = express();
app.set('trust proxy', 1);

app.use(express.json());

// --- Modern, secure CORS handling for JWT ---
app.use(cors({
  origin: 'https://client-eight-tawny-17.vercel.app',    // your frontend's origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- REMOVE the old manual CORS and session/cookie blocks below! ---

// app.use((req, res, next) => { ... })   <--- REMOVE ALL

// app.use(session({ ... }))             <--- REMOVE ALL

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
