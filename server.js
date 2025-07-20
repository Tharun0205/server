import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';

import authRoutes from './routes/auth.js';
import invoiceRoutes from './routes/invoice.js';

dotenv.config();
const app = express();
app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true,
    sameSite:'none'
   }
}));
app.use(cors({
  origin: ["https://client-eight-tawny-17.vercel.app","http://localhost:3000"],
  credentials: true
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
