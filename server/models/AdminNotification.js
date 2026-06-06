import mongoose from 'mongoose';

const adminNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['broadcast', 'premium', 'single'],
    required: true
  },
  status: {
    type: String,
    enum: ['delivered', 'queued', 'failed'],
    default: 'delivered'
  },
  sentTo: {
    type: Number,
    default: 0
  },
  recipientEmail: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const AdminNotification = mongoose.model('AdminNotification', adminNotificationSchema);

export default AdminNotification;
