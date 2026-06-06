import api from './api.js';

// ==================== AUTH SERVICES ====================

// Register new user
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// Login
export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// Verify OTP (email verification)
export const verifyOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data;
};

// Resend OTP
export const resendOTP = async (email) => {
  const response = await api.post('/auth/resend-otp', { email });
  return response.data;
};

// Forgot password
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// Reset password
export const resetPassword = async (email, otp, newPassword) => {
  const response = await api.post('/auth/reset-password', {
    email,
    otp,
    newPassword,
  });
  return response.data;
};

// Get current user profile
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Update profile
export const updateProfile = async (data) => {
  const response = await api.put('/auth/update-profile', data);
  return response.data;
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.put('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

// Logout
export const logoutUser = async (userId, refreshToken) => {
  const response = await api.post('/auth/logout', { userId, refreshToken });
  return response.data;
};

// ==================== WALLET SERVICES ====================

// Get balance
export const getBalance = async () => {
  const response = await api.get('/wallet/balance');
  return response.data;
};

// Get wallet summary (analytics)
export const getWalletSummary = async () => {
  const response = await api.get('/wallet/summary');
  return response.data;
};

// Get transactions
export const getTransactions = async (page = 1, limit = 20, type = null) => {
  const params = { page, limit };
  if (type) params.type = type;
  const response = await api.get('/wallet/transactions', { params });
  return response.data;
};

// Deposit
export const depositFunds = async (amount) => {
  const response = await api.post('/wallet/deposit', { amount });
  return response.data;
};

// Withdraw
export const withdrawFunds = async (amount) => {
  const response = await api.post('/wallet/withdraw', { amount });
  return response.data;
};

// ==================== TRADE SERVICES ====================

// Get portfolio
export const getPortfolio = async () => {
  const response = await api.get('/trade/portfolio');
  return response.data;
};

// Buy stock
export const buyStock = async (symbol, name, quantity, price) => {
  const response = await api.post('/trade/buy', {
    symbol,
    name,
    quantity,
    price,
  });
  return response.data;
};

// Sell stock
export const sellStock = async (symbol, quantity, price) => {
  const response = await api.post('/trade/sell', { symbol, quantity, price });
  return response.data;
};

// Get trade history
export const getTradeHistory = async (page = 1, limit = 20) => {
  const response = await api.get('/trade/history', { params: { page, limit } });
  return response.data;
};

// Get weekly P&L data for the dashboard chart
export const getWeeklyPnL = async () => {
  const response = await api.get('/trade/weekly-pnl');
  return response.data;
};

// Get trending stocks (user's portfolio with simulated live prices)
export const getTrendingStocks = async () => {
  const response = await api.get('/trade/trending');
  return response.data;
};

// Get recent trades for dashboard (last 5)
export const getRecentTrades = async () => {
  const response = await api.get('/trade/recent');
  return response.data;
};

// ==================== NOTIFICATION SERVICES ====================

// Get all notifications
export const getNotifications = async (page = 1, limit = 20) => {
  const response = await api.get('/notifications', { params: { page, limit } });
  return response.data;
};

// Mark single notification as read
export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

// Mark all as read
export const markAllNotificationsRead = async () => {
  const response = await api.put('/notifications/mark-all-read');
  return response.data;
};

// Delete notification
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

// Clear all notifications
export const clearAllNotifications = async () => {
  const response = await api.delete('/notifications/clear-all');
  return response.data;
};

// ==================== ANALYTICS & MARKET SERVICES ====================

export const getPortfolioGrowth = async (period = '1M') => {
  const response = await api.get('/analytics/portfolio-growth', { params: { period } });
  return response.data;
};

export const getCashFlow = async () => {
  const response = await api.get('/analytics/cash-flow');
  return response.data;
};

export const getMarketMovers = async () => {
  const response = await api.get('/market/movers');
  return response.data;
};

export const getAiSuggestions = async () => {
  const response = await api.get('/ai/suggestions');
  return response.data;
};

export const getRiskAnalysis = async () => {
  const response = await api.get('/risk/analysis');
  return response.data;
};

export const getRiskChatResponse = async (messages, riskData) => {
  const response = await api.post('/ai/risk-chat', { messages, riskData });
  return response.data;
};

