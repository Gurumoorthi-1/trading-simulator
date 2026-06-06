import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import RefreshToken from '../models/RefreshToken.js';
import SecurityEvent from '../models/SecurityEvent.js';
import { generateAccessToken, generateRefreshToken } from '../middleware/authMiddleware.js';
import { AppError } from '../middleware/errorHandler.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import crypto from 'crypto';

// ==================== Helper: Generate 6-digit OTP ====================
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

import { sendOTPEmail } from '../utils/emailService.js';

// ==================== Helper: Send Response with Token ====================
const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  const accessToken = generateAccessToken(user._id);
  const refreshTokenString = generateRefreshToken(user._id);

  // Revoke all existing tokens for this user
  await RefreshToken.updateMany(
    { user: user._id, revokedAt: null },
    { revokedAt: Date.now() }
  );

  // Store refresh token in MongoDB
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 7 days

  await RefreshToken.create({
    user: user._id,
    token: refreshTokenString,
    expiresAt: expiryDate
  });

  res.status(statusCode).json({
    success: true,
    message,
    accessToken,
    refreshToken: refreshTokenString,
    user: user.getPublicProfile(),
  });
};

// ==================== @POST /api/auth/register ====================
// For new user registration
export const register = async (req, res, next) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('Email already registered. Please login.', 409));
    }

    const role = email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user';

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      isEmailVerified: true, // Auto verify on register
      role,
      lastLogin: new Date(),
      lastActivity: new Date()
    });

    // Create empty portfolio for new user
    await Portfolio.create({
      user: user._id,
      holdings: [],
    });

    // Create welcome transaction (initial balance)
    await Transaction.create({
      user: user._id,
      type: 'deposit',
      amount: user.balance,
      status: 'completed',
      details: 'Initial virtual funding - Welcome to StockSim!',
      balanceAfter: user.balance,
    });

    // Create welcome notification
    await Notification.create({
      user: user._id,
      title: 'Welcome to StockSim!',
      message: `Hi ${name}! Your account has been created with $${user.balance.toLocaleString()} virtual money. Start trading now!`,
      type: 'system',
    });

    // Return token and log in immediately
    await sendTokenResponse(user, 201, res, 'Account created successfully! Welcome to the platform.');

  } catch (error) {
    next(error);
  }
};

// ==================== @POST /api/auth/login ====================
// User login
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      await SecurityEvent.create({
        type: 'failed-login',
        email: email.toLowerCase(),
        ip: req.ip || req.socket.remoteAddress
      });
      return next(new AppError('Invalid email or password.', 401));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Contact support.', 401));
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      await SecurityEvent.create({
        type: 'failed-login',
        email: email.toLowerCase(),
        ip: req.ip || req.socket.remoteAddress
      });
      return next(new AppError('Invalid email or password.', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Emit event to admin dashboard
    const adminNamespace = req.app.get('adminNamespace');
    if (adminNamespace) {
      adminNamespace.emit('user-login', {
        userId: user._id,
        name: user.name,
        email: user.email,
        timestamp: new Date()
      });
      adminNamespace.emit('statsUpdate');
    }

    await sendTokenResponse(user, 200, res, 'Login successful! Welcome back.');
  } catch (error) {
    next(error);
  }
};

// ==================== @POST /api/auth/verify-otp ====================
// Email OTP verification

// ==================== @POST /api/auth/forgot-password ====================
// Forgot password - sends OTP
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Email is required.', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Security: Don't reveal if email exists or not
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, you will receive a reset OTP.',
      });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    user.otp = {
      code: otpCode,
      expiresAt: otpExpiry,
      purpose: 'password_reset',
    };
    await user.save({ validateBeforeSave: false });

    const emailSent = await sendOTPEmail(email, otpCode, 'reset');

    if (!emailSent) {
      return next(new AppError('Failed to send password reset email. Please try again later.', 500));
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email.',
      ...(process.env.NODE_ENV === 'development' && { devOTP: otpCode }),
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @POST /api/auth/reset-password ====================
// Reset password with OTP
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return next(new AppError('Email, OTP, and new password are required.', 400));
    }

    if (newPassword.length < 8) {
      return next(new AppError('Password must be at least 8 characters.', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+otp.code +otp.expiresAt +otp.purpose +password'
    );

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    // Validate OTP
    if (!user.isOTPValid(otp) || user.otp.purpose !== 'password_reset') {
      return next(new AppError('Invalid or expired OTP.', 400));
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined;

    // Explicitly let mongoose know password was modified so pre-save fires perfectly
    user.markModified('password');
    await user.save();

    // Log password reset event
    await SecurityEvent.create({
      type: 'password-reset',
      email: email.toLowerCase(),
      userId: user._id,
      ip: req.ip || req.socket.remoteAddress
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now login.',
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @GET /api/auth/me ====================
// Get current logged in user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @PUT /api/auth/update-profile ====================
// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    // Only allow specific fields to be updated
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @PUT /api/auth/change-password ====================
// Change password (logged in user)
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Current and new password are required.', 400));
    }

    if (newPassword.length < 8) {
      return next(new AppError('New password must be at least 8 characters.', 400));
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect.', 401));
    }

    user.password = newPassword;
    await user.save();

    await sendTokenResponse(user, 200, res, 'Password changed successfully!');
  } catch (error) {
    next(error);
  }
};


// ==================== @POST /api/auth/refresh-token ====================
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      console.log('Refresh token missing in request body');
      return next(new AppError('Refresh token is required.', 400));
    }

    // Cleanup expired tokens first
    await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });

    const refreshTokenDoc = await RefreshToken.findOne({ token });

    if (!refreshTokenDoc) {
      console.log('Refresh token not found in database');
      return next(new AppError('Invalid or expired refresh token.', 401));
    }

    if (!refreshTokenDoc.isActive) {
      console.log('Refresh token is not active (revoked or expired)');
      return next(new AppError('Invalid or expired refresh token.', 401));
    }

    // Token Rotation
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found for refresh token');
      return next(new AppError('Session invalid. Please login again.', 401));
    }

    // Revoke old token
    refreshTokenDoc.revokedAt = Date.now();

    // Generate new set of tokens
    const newAccessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);

    // Save replacement link for audit
    refreshTokenDoc.replacedByToken = newRefreshToken;
    await refreshTokenDoc.save();

    // Store new refresh token
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    await RefreshToken.create({
      user: userId,
      token: newRefreshToken,
      expiresAt: expiryDate
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error.message, error.stack);
    next(new AppError('Session invalid. Please login again.', 401));
  }
};

// ==================== @POST /api/auth/logout ====================
export const logout = async (req, res, next) => {
  try {
    const { refreshToken: token, userId } = req.body;

    if (token) {
      await RefreshToken.findOneAndUpdate({ token }, { revokedAt: Date.now() });
    }

    // Update lastActivity to mark as offline
    if (userId) {
      await User.findByIdAndUpdate(userId, { lastActivity: new Date(Date.now() - 25 * 60 * 60 * 1000) }); // Set to 25h ago (offline)
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};
