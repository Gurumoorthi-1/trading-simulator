// ==================== Load Environment Variables FIRST ====================
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import { Server } from 'socket.io';
import http from 'http';

// Config
import connectDB from './config/db.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import tradeRoutes from './routes/tradeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Middleware
import errorHandler, { notFound } from './middleware/errorHandler.js';
import User from './models/User.js';

// ==================== Connect to MongoDB ====================
connectDB().then(async () => {
  // Create default admin user if not exists
  const adminEmail = 'admin@gmail.com';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    try {
      const adminUser = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: 'Admin@123', // Default password - should be changed in production!
        role: 'admin',
        isEmailVerified: true
      });
      console.log('✅ Default admin user created!');
      console.log('Email:', adminEmail);
      console.log('Password: Admin@123');
    } catch (error) {
      console.error('❌ Error creating admin user:', error.message);
    }
  }
});

// ==================== Initialize Express App ====================
const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173'),
    credentials: true,
  },
});
app.set('io', io);

// Admin Socket Namespace
const adminNamespace = io.of('/admin');
adminNamespace.use(async (socket, next) => {
  // Simple auth check for now - in production use JWT
  // For this demo, we'll just trust that the user is admin
  next();
});
adminNamespace.on('connection', (socket) => {
  console.log('✅ Admin connected to real-time updates');
  socket.on('disconnect', () => {
    console.log('❌ Admin disconnected');
  });
});
app.set('adminNamespace', adminNamespace);

// Main Socket.io Namespace
io.on('connection', (socket) => {
  console.log('✅ User connected to socket');

  // Join user-specific room
  socket.on('joinUserRoom', (userId) => {
    socket.join(userId.toString());
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected from socket');
  });
});

// ==================== Global Middleware ====================

// 1. CORS
const corsOrigin = process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173');
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// 2. Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Cookie Parser
app.use(cookieParser());

// 4. Sanitize against NoSQL injection
app.use(mongoSanitize());

// 5. Security Headers (Helmet)
app.use(helmet());

// 6. XSS Protection
app.use(xss());

// 7. Prevent HTTP Parameter Pollution
app.use(hpp());

// 8. Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ==================== Rate Limiting ====================

const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many auth attempts. Please try again after a minute.' },
});

const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many payment requests. Please try again after a minute.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/payment', paymentLimiter);

// ==================== CSRF Protection ====================

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// CSRF Token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// State-changing routes are protected by JWT 'protect' middleware in their respective routers
// CSRF is not required here as we use JWT in Authorization headers which are not automatically sent by browsers

// ==================== API Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ==================== Production Setup ====================
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy (e.g. Heroku, Nginx)

  const clientPath = path.join(__dirname, '../client/dist');
  if (fs.existsSync(clientPath)) {
    app.use(express.static(clientPath));
    app.get('*', (req, res, next) => {
      // If it's an API route, let it pass to notFound handler
      if (req.url.startsWith('/api')) return next();
      res.sendFile(path.resolve(clientPath, 'index.html'));
    });
  }
}

// ==================== Error Handling ====================
app.use(notFound);
app.use(errorHandler);

// ==================== Start Server ====================
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
