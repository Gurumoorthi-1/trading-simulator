import mongoose from 'mongoose';

const portfolioItemSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  shares: { type: Number, required: true, min: 0 },
  averagePrice: { type: Number, required: true, min: 0 },
  // When this holding was first acquired
  firstBoughtAt: { type: Date, default: Date.now },
  // Last updated (buy/sell)
  lastUpdatedAt: { type: Date, default: Date.now },
});

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One portfolio per user
    },
    holdings: [portfolioItemSchema],
    // Total invested amount (cost basis)
    totalInvested: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
portfolioSchema.index({ user: 1 });
portfolioSchema.index({ 'holdings.symbol': 1 });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
