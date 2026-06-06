import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'trade_buy', 'trade_sell'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed',
    },
    details: {
      type: String,
      default: '',
    },
    // For trade transactions
    stockSymbol: {
      type: String,
      default: null,
    },
    stockName: {
      type: String,
      default: null,
    },
    quantity: {
      type: Number,
      default: null,
    },
    pricePerShare: {
      type: Number,
      default: null,
    },
    // Balance snapshot after transaction
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
