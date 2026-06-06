import mongoose from 'mongoose';

const securityEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['failed-login', 'blocked-request', 'rate-limit-hit', 'password-reset'],
    required: true
  },
  ip: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  details: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

const SecurityEvent = mongoose.model('SecurityEvent', securityEventSchema);

export default SecurityEvent;
