import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';

import authRoutes from './routes/auth.js';
import invoiceRoutes from './routes/invoice.js';

dotenv.config();
const app = express();

// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));
app.use(cors());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));