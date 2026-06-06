import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    revokedAt: {
        type: Date,
        default: null,
    },
    replacedByToken: {
        type: String,
        default: null,
    },
}, { timestamps: true });

// Check if token is expired
refreshTokenSchema.virtual('isExpired').get(function () {
    return Date.now() >= this.expiresAt;
});

// Check if token is active (not revoked, not expired)
refreshTokenSchema.virtual('isActive').get(function () {
    return !this.revokedAt && !this.isExpired;
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
