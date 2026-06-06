import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentHistory,
  getInvoice,
  downloadInvoice
} from '../controllers/paymentController.js';

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Create Razorpay order
router.post('/create-order', createOrder);

// Verify payment
router.post('/verify', verifyPayment);

// Handle payment failure
router.post('/failure', handlePaymentFailure);

// Get payment history
router.get('/history', getPaymentHistory);

// Get invoice
router.get('/invoice/:id', getInvoice);

// Download invoice
router.get('/invoice/:id/download', downloadInvoice);

// Download invoice
router.get('/invoice/:id/download', downloadInvoice);

// Debug route (Temporary)
router.get('/debug-config', (req, res) => {
  res.json({
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'LOADED (' + process.env.RAZORPAY_KEY_ID.substring(0, 8) + '...)' : 'MISSING',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'LOADED' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV
  });
});

export default router;
