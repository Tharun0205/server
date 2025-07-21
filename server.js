import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import authRoutes from './routes/auth.js';
import invoiceRoutes from './routes/invoice.js';

dotenv.config();
const app = express();

// ✅ Trust proxy for secure cookies behind Vercel proxy
app.set('trust proxy', 1);

// ✅ Body parser
app.use(express.json());

// ✅ CORS handling middleware (only allow client Vercel domain)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = 'https://client-eight-tawny-17.vercel.app';

  if (origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Use connect-mongo to persist session data
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions'
    }),
    cookie: {
      secure: true,
      sameSite: 'none'
    }
  })
);

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);

// ✅ Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
