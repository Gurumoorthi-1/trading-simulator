import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ==================== Protect Route Middleware ====================
// JWT token verify பண்ணி, user-ஐ request-ல attach பண்ணும்

export const protect = async (req, res, next) => {
  let token;

  // Check Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Alternatively check cookie (if using cookies)
  // else if (req.cookies?.jwt) {
  //   token = req.cookies.jwt;
  // }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to continue.',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from DB (exclude password)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.',
      });
    }

    // Update last activity
    user.lastActivity = new Date();
    await user.save({ validateBeforeSave: false });
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
};

// ==================== Authorization Middleware ====================
// Specific role-base access logic
export const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires ${roles.join(' or ')} permissions.`
      });
    }
    next();
  };
};

// ==================== Token Generation ====================

// Access Token: Short-lived (15m)
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  });
};

// Refresh Token: Long-lived (7d)
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  });
};

// Legacy support (to avoid breaking other files immediately)
export const generateToken = generateAccessToken;
