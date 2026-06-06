import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { encryptData, decryptData } from '../utils/encryption.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password in queries by default
    },

    // Account Status
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['user', 'premium', 'admin'],
      default: 'user',
    },

    // Virtual Wallet
    balance: {
      type: Number,
      default: parseFloat(process.env.INITIAL_BALANCE) || 100000,
      min: [0, 'Balance cannot be negative'],
    },

    // OTP for Email Verification / Password Reset
    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false },
      purpose: {
        type: String,
        enum: ['email_verify', 'password_reset'],
        select: false,
      },
    },

    // Profile
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
      get: decryptData,
      set: encryptData,
    },

    // Premium subscription
    isPremium: {
      type: Boolean,
      default: false,
    },
    subscriptionPlan: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      default: null,
    },
    premiumActivatedAt: {
      type: Date,
      default: null,
    },
    premiumExpiresAt: {
      type: Date,
      default: null,
    },

    // Last login timestamp
  lastLogin: {
    type: Date,
    default: null,
  },
  // Last activity timestamp (any API request)
  lastActivity: {
    type: Date,
    default: null,
  },

    // Password reset token (JWT-based OTP)
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto-add
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// ==================== MIDDLEWARE ====================

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ==================== METHODS ====================

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if OTP is valid
userSchema.methods.isOTPValid = function (code) {
  return (
    this.otp &&
    this.otp.code === code &&
    this.otp.expiresAt &&
    this.otp.expiresAt > new Date()
  );
};

// Get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    balance: this.balance,
    isEmailVerified: this.isEmailVerified,
    isActive: this.isActive,
    isPremium: this.isPremium,
    subscriptionPlan: this.subscriptionPlan,
    premiumActivatedAt: this.premiumActivatedAt,
    premiumExpiresAt: this.premiumExpiresAt,
    avatar: this.avatar,
    phone: this.phone,
    role: this.role,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
    lastActivity: this.lastActivity,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
