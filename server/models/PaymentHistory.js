import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    plan: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      required: true,
    },
    status: {
      type: String,
      enum: ['created', 'success', 'failed', 'refunded'],
      default: 'created',
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);

export default PaymentHistory;
