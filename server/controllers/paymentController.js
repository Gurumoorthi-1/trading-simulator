import Razorpay from 'razorpay';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import User from '../models/User.js';
import PaymentHistory from '../models/PaymentHistory.js';

// Lazy initialized Razorpay instance
let razorpayInstance = null;

const getRazorpayInstance = () => {
  // Always create a fresh instance to pick up latest env vars
  const key_id = process.env.RAZORPAY_KEY_ID?.trim();
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();

  razorpayInstance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
  });
  return razorpayInstance;
};

// Plan prices in INR paise (since Razorpay uses smallest currency unit)
const PLAN_PRICES = {
  basic: 0,
  pro: 19900,   // ₹199
  enterprise: 99900 // ₹999
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    console.log('=== Entering createOrder function');
    console.log('req.user:', req.user);
    console.log('req.user._id:', req.user?._id);
    console.log('req.body:', req.body);

    const { plan } = req.body;
    console.log('Plan received:', plan);

    if (!plan || !PLAN_PRICES[plan]) {
      console.log('Invalid plan selected:', plan);
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }

    const amount = PLAN_PRICES[plan];
    console.log('Amount in paise:', amount);

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-10)}`, // Shorter receipt (<=40 chars)
      notes: {
        userId: req.user._id.toString(),
        plan: plan
      }
    };

    console.log('Razorpay order options:', options);

    const razorpay = getRazorpayInstance();
    console.log('Calling razorpay.orders.create');
    const razorpayOrder = await razorpay.orders.create(options);
    console.log('Razorpay order created successfully:', razorpayOrder);

    // Create payment history record
    const paymentHistory = await PaymentHistory.create({
      userId: req.user._id,
      orderId: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      plan: plan,
      status: 'created'
    });

    const keyId = process.env.RAZORPAY_KEY_ID;
    console.log('Sending order to client with Key ID:', keyId);
    console.log('Key ID Hex:', Buffer.from(keyId).toString('hex'));
    res.status(200).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        plan: plan
      },
      paymentHistoryId: paymentHistory._id
    });

  } catch (error) {
    // Extract actual razorpay error message if possible
    let errorMessage = 'Failed to create payment order';
    if (error && error.error && error.error.description) {
      errorMessage = error.error.description;
    } else if (error && error.message) {
      errorMessage = error.message;
    }

    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    // Generate signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    // Verify signature
    if (generatedSignature !== razorpay_signature) {
      // Update payment history as failed
      await PaymentHistory.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          status: 'failed',
          paymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          failureReason: 'Invalid signature'
        }
      );

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update payment history
    const paymentHistory = await PaymentHistory.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        status: 'success',
        paymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      },
      { new: true }
    );

    if (!paymentHistory) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update user's premium status
    const activatedAt = new Date();
    const expiresAt = new Date(activatedAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        isPremium: true,
        role: 'premium',
        subscriptionPlan: plan,
        premiumActivatedAt: activatedAt,
        premiumExpiresAt: expiresAt
      },
      { new: true }
    );

    // Emit event to admin dashboard
    const adminNamespace = req.app.get('adminNamespace');
    if (adminNamespace) {
      adminNamespace.emit('statsUpdate');
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    next(error);
  }
};

// @desc    Handle payment failure
// @route   POST /api/payment/failure
// @access  Private
export const handlePaymentFailure = async (req, res, next) => {
  try {
    const { razorpay_order_id, error } = req.body;

    await PaymentHistory.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        status: 'failed',
        failureReason: error ? error.description || 'Payment failed' : 'Payment failed'
      }
    );

    // Emit event to admin dashboard
    const adminNamespace = req.app.get('adminNamespace');
    if (adminNamespace) {
      adminNamespace.emit('statsUpdate');
    }

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded'
    });

  } catch (error) {
    console.error('Error handling payment failure:', error);
    next(error);
  }
};

// @desc    Get payment history for user
// @route   GET /api/payment/history
// @access  Private
export const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await PaymentHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Convert amounts from paise to rupees
    const formattedPayments = payments.map(p => ({
      ...p.toObject(),
      amount: p.amount / 100
    }));

    res.status(200).json({
      success: true,
      payments: formattedPayments
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    next(error);
  }
};

// @desc    Get invoice details by ID
// @route   GET /api/payment/invoice/:id
// @access  Private/Admin
export const getInvoice = async (req, res, next) => {
  try {
    const payment = await PaymentHistory.findById(req.params.id).populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Convert amount from paise to rupees
    const formattedPayment = {
      ...payment.toObject(),
      amount: payment.amount / 100
    };

    res.status(200).json({
      success: true,
      payment: formattedPayment
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    next(error);
  }
};

// @desc    Download invoice as PDF
// @route   GET /api/payment/invoice/:id/download
// @access  Private/Admin
export const downloadInvoice = async (req, res, next) => {
  try {
    const payment = await PaymentHistory.findById(req.params.id).populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const amountInRupees = payment.amount / 100;
    const invoiceDate = new Date(payment.createdAt);

    // Create a PDF document
    const doc = new PDFDocument({ margin: 40 });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${payment.orderId}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // --------------------------
    // Header Section
    // --------------------------
    // Top bar with company info
    doc
      .rect(40, 40, 530, 80)
      .fill('#1e40af')
      .fillColor('#ffffff')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('TradeSim', 50, 55, { width: 250 })
      .fontSize(12)
      .font('Helvetica')
      .text('Stock Trading Simulation Platform', 50, 90)
      .fillColor('#dbeafe')
      .fontSize(12)
      .text('Invoice', 320, 55, { width: 250, align: 'right' })
      .fontSize(11)
      .text(`Date: ${invoiceDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 320, 75, { width: 250, align: 'right' })
      .text(`Order #${payment.orderId}`, 320, 95, { width: 250, align: 'right' })
      .moveDown(2);

    // --------------------------
    // Billing & Payment Details
    // --------------------------
    doc
      .fillColor('#111827')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Bill To:', 50, 140)
      .fillColor('#4b5563')
      .fontSize(12)
      .font('Helvetica')
      .text(payment.userId?.name || 'N/A', 50, 160)
      .text(payment.userId?.email || 'N/A', 50, 178)
      .moveDown();

    doc
      .fillColor('#111827')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Payment Details', 320, 140)
      .fillColor('#4b5563')
      .fontSize(12)
      .font('Helvetica');

    const detailsStartY = 160;
    doc.text('Payment ID:', 320, detailsStartY);
    doc.text(payment.paymentId || 'N/A', 420, detailsStartY);

    doc.text('Status:', 320, detailsStartY + 18);
    doc
      .fillColor(payment.status === 'success' ? '#10b981' : '#ef4444')
      .text(payment.status.toUpperCase(), 420, detailsStartY + 18)
      .fillColor('#4b5563');

    doc.text('Plan:', 320, detailsStartY + 36);
    doc.text(payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1), 420, detailsStartY + 36);

    // --------------------------
    // Line Items Table
    // --------------------------
    const tableTop = 230;

    // Table header background
    doc
      .rect(50, tableTop, 510, 30)
      .fill('#f3f4f6')
      .fillColor('#111827')
      .fontSize(12)
      .font('Helvetica-Bold');

    doc.text('Description', 60, tableTop + 10);
    doc.text('Quantity', 350, tableTop + 10, { width: 60, align: 'center' });
    doc.text('Amount', 430, tableTop + 10, { width: 120, align: 'right' });

    // Table row
    doc
      .fillColor('#4b5563')
      .fontSize(12)
      .font('Helvetica');

    doc.text('Premium Subscription Plan', 60, tableTop + 50);
    doc.text('1', 350, tableTop + 50, { width: 60, align: 'center' });
    doc.text(`₹${amountInRupees.toFixed(2)}`, 430, tableTop + 50, { width: 120, align: 'right' });

    // Divider
    doc
      .moveTo(50, tableTop + 75)
      .lineTo(560, tableTop + 75)
      .strokeColor('#e5e7eb')
      .stroke();

    // --------------------------
    // Total Section
    // --------------------------
    doc
      .fillColor('#111827')
      .fontSize(14)
      .font('Helvetica-Bold');

    doc.text('Total:', 380, tableTop + 100, { width: 50, align: 'right' });
    doc
      .fillColor('#1e40af')
      .fontSize(18)
      .text(`₹${amountInRupees.toFixed(2)}`, 430, tableTop + 98, { width: 120, align: 'right' });

    // --------------------------
    // Footer Section
    // --------------------------
    doc
      .fillColor('#9ca3af')
      .fontSize(10)
      .font('Helvetica')
      .moveDown(8)
      .text('Thank you for choosing TradeSim!', { align: 'center' })
      .text('For any queries, contact us at support@tradesim.com', { align: 'center' })
      .moveDown()
      .text('© 2026 TradeSim. All rights reserved.', { align: 'center' });

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error('Error downloading invoice:', error);
    next(error);
  }
};
