import mongoose from 'mongoose';

const aiEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  type: {
    type: String,
    enum: ['stock-prediction', 'portfolio-analysis', 'market-insights', 'risk-assessment', 'general-query'],
    default: 'general-query'
  },
  query: {
    type: String,
    default: null
  },
  responseTime: {
    type: Number, // in milliseconds
    default: 0
  },
  success: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

aiEventSchema.index({ createdAt: -1 });
aiEventSchema.index({ type: 1, createdAt: -1 });

const AIEvent = mongoose.model('AIEvent', aiEventSchema);

export default AIEvent;
