import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
    platformName: { type: String, default: 'TradeSim' },
    maintenanceMode: { type: Boolean, default: false },
    smtpHost: { type: String, default: '' },
    smtpPort: { type: String, default: '' },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },
    smtpFrom: { type: String, default: '' },
    razorpayKey: { type: String, default: '' },
    razorpaySecret: { type: String, default: '' },
    aiApiKey: { type: String, default: '' },
    aiModel: { type: String, default: 'llama-3.3-70b-versatile' },
    aiEnabled: { type: Boolean, default: true }
}, { timestamps: true });

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);

export default SystemSetting;
