import express from 'express';
import mongoose from 'mongoose';
import { protect, authorize } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import PaymentHistory from '../models/PaymentHistory.js';
import SecurityEvent from '../models/SecurityEvent.js';
import Notification from '../models/Notification.js';
import AdminNotification from '../models/AdminNotification.js';
import AIEvent from '../models/AIEvent.js';
import SystemSetting from '../models/SystemSetting.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(protect);
router.use(authorize(['admin']));

// ==================== Dashboard Stats ====================

// @desc    Get dashboard overview stats
// @route   GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total counts (exclude admin users)
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      $or: [
        { lastActivity: { $gte: twentyFourHoursAgo } },
        { lastLogin: { $gte: twentyFourHoursAgo } }
      ],
      role: { $ne: 'admin' }
    });
    const premiumUsers = await User.countDocuments({ isPremium: true, role: { $ne: 'admin' } });
    const totalTrades = await Transaction.countDocuments({ $or: [{ type: 'trade_buy' }, { type: 'trade_sell' }] });
    const todaysTrades = await Transaction.countDocuments({ $or: [{ type: 'trade_buy' }, { type: 'trade_sell' }], createdAt: { $gte: today } });

    // Revenue (convert from paise to rupees)
    const totalRevenuePayments = await PaymentHistory.find({ status: 'success' });
    const totalRevenue = totalRevenuePayments.reduce((sum, p) => sum + (p.amount / 100), 0);

    const monthlyRevenuePayments = await PaymentHistory.find({ status: 'success', createdAt: { $gte: thisMonth } });
    const monthlyRevenue = monthlyRevenuePayments.reduce((sum, p) => sum + (p.amount / 100), 0);

    // AI requests
    const aiRequests = await AIEvent.countDocuments();

    // User growth (last 7 days) - exclude admin users
    const userGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const count = await User.countDocuments({ createdAt: { $gte: start, $lt: end }, role: { $ne: 'admin' } });
      userGrowth.push({ date: start.toISOString().split('T')[0], count });
    }

    // Revenue growth (last 7 days) (convert from paise to rupees)
    const revenueGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const payments = await PaymentHistory.find({ status: 'success', createdAt: { $gte: start, $lt: end } });
      const dayRevenue = payments.reduce((sum, p) => sum + (p.amount / 100), 0);
      revenueGrowth.push({ date: start.toISOString().split('T')[0], amount: dayRevenue });
    }

    // Trades trend (last 7 days)
    const tradesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const count = await Transaction.countDocuments({ $or: [{ type: 'trade_buy' }, { type: 'trade_sell' }], createdAt: { $gte: start, $lt: end } });
      tradesTrend.push({ date: start.toISOString().split('T')[0], count });
    }

    // Premium conversion (simple) - exclude admin users
    const premiumConversion = [
      { label: 'Free', count: totalUsers - premiumUsers },
      { label: 'Premium', count: premiumUsers }
    ];

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        premiumUsers,
        totalTrades,
        todaysTrades,
        totalRevenue,
        monthlyRevenue,
        aiRequests,
        userGrowth,
        revenueGrowth,
        tradesTrend,
        premiumConversion
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== Subscription Management ====================

// @desc    Get subscription stats
// @route   GET /api/admin/subscriptions/stats
router.get('/subscriptions/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const freeUsers = await User.countDocuments({ subscriptionPlan: null, isPremium: false, role: { $ne: 'admin' } });
    const proUsers = await User.countDocuments({ subscriptionPlan: 'pro', role: { $ne: 'admin' } });
    const enterpriseUsers = await User.countDocuments({ subscriptionPlan: 'enterprise', role: { $ne: 'admin' } });
    const activeSubscriptions = await User.countDocuments({ isPremium: true, isActive: true, role: { $ne: 'admin' } });
    const expiringSubscriptions = await User.countDocuments({
      isPremium: true,
      premiumExpiresAt: { $gte: now, $lte: next30Days },
      role: { $ne: 'admin' }
    });

    const totalRevenuePayments = await PaymentHistory.find({ status: 'success' });
    const totalRevenue = totalRevenuePayments.reduce((sum, p) => sum + (p.amount / 100), 0);

    res.status(200).json({
      success: true,
      data: {
        freeUsers,
        proUsers,
        enterpriseUsers,
        activeSubscriptions,
        expiringSubscriptions,
        renewals: 0, // placeholder
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all subscriptions
// @route   GET /api/admin/subscriptions
router.get('/subscriptions', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPremium: true, role: { $ne: 'admin' } };
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ],
        role: { $ne: 'admin' }
      }).select('_id');
      query._id = { $in: users.map(u => u._id) };
    }

    const users = await User.find(query)
      .sort({ premiumActivatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({ isPremium: true, role: { $ne: 'admin' } });

    const subscriptions = users.map(u => {
      const planPrices = { pro: 199, enterprise: 999, basic: 0 };
      const now = new Date();
      const expiry = u.premiumExpiresAt;

      let status = 'expired';
      if (u.isActive && expiry && expiry > now) {
        status = 'active';
      } else if (u.isActive && !expiry && u.isPremium) {
        // Fallback for older records without expiry date
        status = 'active';
      }

      return {
        user: u.getPublicProfile(),
        plan: u.subscriptionPlan,
        startDate: u.premiumActivatedAt,
        expiryDate: expiry || 'N/A',
        amount: planPrices[u.subscriptionPlan] || 0,
        status: status
      };
    });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      subscriptions
    });
  } catch (error) {
    next(error);
  }
});

// ==================== Payment Management ====================

// @desc    Get payment stats
// @route   GET /api/admin/payments/stats
router.get('/payments/stats', async (req, res, next) => {
  try {
    const successfulPayments = await PaymentHistory.countDocuments({ status: 'success' });
    const failedPayments = await PaymentHistory.countDocuments({ status: 'failed' });
    const pendingPayments = await PaymentHistory.countDocuments({ status: 'created' });

    const totalRevenuePayments = await PaymentHistory.find({ status: 'success' });
    const totalRevenue = totalRevenuePayments.reduce((sum, p) => sum + (p.amount / 100), 0);

    res.status(200).json({
      success: true,
      data: {
        successfulPayments,
        failedPayments,
        pendingPayments,
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all payments
// @route   GET /api/admin/payments
router.get('/payments', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    const query = {};
    if (status) query.status = status;

    const payments = await PaymentHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email');

    // Convert amounts from paise to rupees
    const formattedPayments = payments.map(p => ({
      ...p.toObject(),
      amount: p.amount / 100
    }));

    const total = await PaymentHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      count: formattedPayments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      payments: formattedPayments
    });
  } catch (error) {
    next(error);
  }
});

// ==================== Trading Analytics ====================

// @desc    Get trading analytics
// @route   GET /api/admin/trading-analytics
router.get('/trading-analytics', async (req, res, next) => {
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Most Traded Stocks (last 7 days)
    const stockTrades = await Transaction.aggregate([
      { $match: { $or: [{ type: 'trade_buy' }, { type: 'trade_sell' }], createdAt: { $gte: last7Days } } },
      { $group: { _id: '$stockSymbol', count: { $sum: 1 }, volume: { $sum: '$quantity' }, totalValue: { $sum: '$amount' }, stockName: { $first: '$stockName' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Buy vs Sell Ratio
    const buyCount = await Transaction.countDocuments({ type: 'trade_buy', createdAt: { $gte: last7Days } });
    const sellCount = await Transaction.countDocuments({ type: 'trade_sell', createdAt: { $gte: last7Days } });

    // Trading Volume per day (last 7 days)
    const volumeTrend = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const dayTrades = await Transaction.aggregate([
        { $match: { $or: [{ type: 'trade_buy' }, { type: 'trade_sell' }], createdAt: { $gte: start, $lt: end } } },
        { $group: { _id: null, volume: { $sum: '$quantity' }, tradeCount: { $sum: 1 }, totalValue: { $sum: '$amount' } } }
      ]);
      const dayData = dayTrades[0] || { volume: 0, tradeCount: 0, totalValue: 0 };
      volumeTrend.push({
        date: start.toISOString().split('T')[0],
        volume: dayData.volume,
        trades: dayData.tradeCount,
        value: Math.round(dayData.totalValue * 100) / 100
      });
    }

    // Top Gainers & Top Losers - calculated from per-stock P&L
    // For each stock, calculate: total sell revenue - total buy cost
    const stockPnL = await Transaction.aggregate([
      { $match: { $or: [{ type: 'trade_buy' }, { type: 'trade_sell' }], stockSymbol: { $ne: null } } },
      {
        $group: {
          _id: '$stockSymbol',
          stockName: { $first: '$stockName' },
          totalBought: { $sum: { $cond: [{ $eq: ['$type', 'trade_buy'] }, '$amount', 0] } },
          totalSold: { $sum: { $cond: [{ $eq: ['$type', 'trade_sell'] }, '$amount', 0] } },
          sharesBought: { $sum: { $cond: [{ $eq: ['$type', 'trade_buy'] }, '$quantity', 0] } },
          sharesSold: { $sum: { $cond: [{ $eq: ['$type', 'trade_sell'] }, '$quantity', 0] } },
          lastTradePrice: { $last: '$pricePerShare' },
          tradeCount: { $sum: 1 }
        }
      },
      { $match: { tradeCount: { $gte: 2 } } } // Need at least 2 trades to calculate P&L
    ]);

    const stockPerformance = stockPnL.map(stock => {
      const avgBuyPrice = stock.sharesBought > 0 ? stock.totalBought / stock.sharesBought : 0;
      const pnl = stock.totalSold - stock.totalBought;
      const pnlPercent = stock.totalBought > 0 ? ((stock.totalSold - stock.totalBought) / stock.totalBought * 100) : 0;
      return {
        symbol: stock._id,
        name: stock.stockName || stock._id,
        avgBuyPrice: Math.round(avgBuyPrice * 100) / 100,
        lastPrice: stock.lastTradePrice || 0,
        pnl: Math.round(pnl * 100) / 100,
        pnlPercent: Math.round(pnlPercent * 100) / 100,
        totalBought: Math.round(stock.totalBought * 100) / 100,
        totalSold: Math.round(stock.totalSold * 100) / 100,
        tradeCount: stock.tradeCount
      };
    });

    const topGainers = stockPerformance.filter(s => s.pnl > 0).sort((a, b) => b.pnlPercent - a.pnlPercent).slice(0, 5);
    const topLosers = stockPerformance.filter(s => s.pnl < 0).sort((a, b) => a.pnlPercent - b.pnlPercent).slice(0, 5);

    // Most Active Traders
    const activeTraders = await Transaction.aggregate([
      { $match: { $or: [{ type: 'trade_buy' }, { type: 'trade_sell' }], createdAt: { $gte: last7Days } } },
      { $group: { _id: '$user', count: { $sum: 1 }, totalValue: { $sum: '$amount' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          tradeCount: '$count',
          totalValue: { $round: ['$totalValue', 2] }
        }
      }
    ]);

    // Summary stats
    const totalTradeValue = await Transaction.aggregate([
      { $match: { $or: [{ type: 'trade_buy' }, { type: 'trade_sell' }], createdAt: { $gte: last7Days } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 }, avgSize: { $avg: '$amount' } } }
    ]);
    const tradeStats = totalTradeValue[0] || { total: 0, count: 0, avgSize: 0 };

    res.status(200).json({
      success: true,
      data: {
        mostTradedStocks: stockTrades,
        topGainers,
        topLosers,
        mostActiveTraders: activeTraders,
        buySellRatio: { buy: buyCount, sell: sellCount },
        volumeTrend,
        totalTradeValue: Math.round(tradeStats.total * 100) / 100,
        totalTradeCount: tradeStats.count,
        avgTradeSize: Math.round((tradeStats.avgSize || 0) * 100) / 100
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== AI Analytics ====================

// @desc    Get AI analytics
// @route   GET /api/admin/ai-analytics
router.get('/ai-analytics', async (req, res, next) => {
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total AI requests (fast)
    const totalAIRequests = await AIEvent.countDocuments();

    // Aggregated stats (Daily usage trend & Feature distribution & Avg Response Time)
    const analyticsData = await AIEvent.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $facet: {
          usageTrend: [
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                requests: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          featureUsage: [
            { $group: { _id: "$type", count: { $sum: 1 } } }
          ],
          performance: [
            {
              $group: {
                _id: null,
                avgResponseTime: { $avg: "$responseTime" }
              }
            }
          ]
        }
      }
    ]);

    const stats = analyticsData[0];

    // Format usage trend to ensure all 7 days are present even with 0 requests
    const aiUsageTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = stats.usageTrend.find(d => d._id === dateStr);
      aiUsageTrend.push({
        date: dateStr,
        requests: dayData ? dayData.requests : 0
      });
    }

    // Format feature usage with readable names
    const featureUsageMap = {
      'stock-prediction': 'Stock Prediction',
      'portfolio-analysis': 'Portfolio Analysis',
      'market-insights': 'Market Insights',
      'risk-assessment': 'Risk Assessment',
      'general-query': 'General Query'
    };
    const featureUsage = stats.featureUsage.map(item => ({
      name: featureUsageMap[item._id] || 'Other',
      count: item.count
    }));

    const avgResponseTimeMs = stats.performance[0]?.avgResponseTime || 0;
    const averageResponseTime = (avgResponseTimeMs / 1000).toFixed(2) + 's';

    // Popular questions aggregation (last 30 days)
    const popularQuestionsData = await AIEvent.aggregate([
      { $match: { query: { $ne: null }, createdAt: { $gte: last30Days } } },
      { $group: { _id: "$query", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const popularQuestions = popularQuestionsData.map(item => item._id);

    res.status(200).json({
      success: true,
      data: {
        totalAIRequests,
        aiUsageTrend,
        popularQuestions,
        averageResponseTime,
        aiRequestsPerDay: aiUsageTrend, // For backward compatibility
        featureUsage
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== Notification Center ====================

// @desc    Send broadcast notification
// @route   POST /api/admin/notifications/broadcast
router.post('/notifications/broadcast', async (req, res, next) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return next(new AppError('Title and message are required', 400));
    }

    // Get all users
    const allUsers = await User.find({ isActive: true }).select('_id');

    // Create notifications for all users
    const notifications = allUsers.map(user => ({
      user: user._id,
      title,
      message,
      type: 'system'
    }));

    await Notification.insertMany(notifications);

    // Also record as admin notification in history
    const adminNotification = await AdminNotification.create({
      title,
      message,
      type: 'broadcast',
      status: 'delivered',
      sentTo: allUsers.length
    });

    const io = req.app.get('io');
    if (io) io.emit('notificationUpdate');

    const adminNamespace = req.app.get('adminNamespace');
    if (adminNamespace) adminNamespace.emit('statsUpdate');

    res.status(200).json({
      success: true,
      message: `Broadcast notification sent to ${allUsers.length} users!`
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send premium user notification
// @route   POST /api/admin/notifications/premium
router.post('/notifications/premium', async (req, res, next) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return next(new AppError('Title and message are required', 400));
    }

    // Get all premium users
    const premiumUsers = await User.find({ isPremium: true, isActive: true }).select('_id');

    // Create notifications for premium users
    const notifications = premiumUsers.map(user => ({
      user: user._id,
      title,
      message,
      type: 'system'
    }));

    await Notification.insertMany(notifications);

    // Record in admin history
    const adminNotification = await AdminNotification.create({
      title,
      message,
      type: 'premium',
      status: 'delivered',
      sentTo: premiumUsers.length
    });

    const io = req.app.get('io');
    if (io) {
      premiumUsers.forEach(u => {
        io.to(u._id.toString()).emit('notificationUpdate');
      });
    }

    const adminNamespace = req.app.get('adminNamespace');
    if (adminNamespace) adminNamespace.emit('statsUpdate');

    res.status(200).json({
      success: true,
      message: `Premium notification sent to ${premiumUsers.length} users!`
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send single user notification
// @route   POST /api/admin/notifications/user
router.post('/notifications/user', async (req, res, next) => {
  try {
    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
      return next(new AppError('User ID, title and message are required', 400));
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Create notification for user
    await Notification.create({
      user: userId,
      title,
      message,
      type: 'system'
    });

    // Record in admin history
    const adminNotification = await AdminNotification.create({
      title,
      message,
      type: 'single',
      status: 'delivered',
      sentTo: 1,
      recipientEmail: user.email
    });

    const io = req.app.get('io');
    if (io) io.to(userId.toString()).emit('notificationUpdate');

    const adminNamespace = req.app.get('adminNamespace');
    if (adminNamespace) adminNamespace.emit('statsUpdate');

    res.status(200).json({
      success: true,
      message: `Notification sent to ${user.name}!`
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get notification history
// @route   GET /api/admin/notifications/history
router.get('/notifications/history', async (req, res, next) => {
  try {
    const history = await AdminNotification.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
});

// ==================== System Monitoring ====================

// @desc    Get system status
// @route   GET /api/admin/system-status
router.get('/system-status', async (req, res, next) => {
  try {
    // Get server uptime
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (60 * 60 * 24));
    const hours = Math.floor((uptimeSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((uptimeSeconds % (60 * 60)) / 60);
    const uptime = `${days}d ${hours}h ${minutes}m`;

    // Check database status
    let databaseStatus = 'online';
    try {
      await mongoose.connection.db.admin().ping();
    } catch (dbErr) {
      databaseStatus = 'offline';
    }

    // Get socket connections count
    const io = req.app.get('io');
    let socketConnections = 0;
    if (io) {
      const sockets = await io.fetchSockets();
      socketConnections = sockets.length;
    }

    // Get CPU and Memory usage (simple method)
    const os = await import('node:os');
    const cpus = os.cpus();
    const totalCpuTime = cpus.reduce((acc, cpu) => acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle, 0);
    const idleCpuTime = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const cpuUsagePercent = Math.round(100 - (idleCpuTime / totalCpuTime) * 100);
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsagePercent = Math.round(((totalMemory - freeMemory) / totalMemory) * 100);

    // Check services (simple mock checks for now - in real app you'd ping actual endpoints)
    const services = [
      { name: 'Auth Service', status: 'online' },
      { name: 'Trading Service', status: 'online' },
      { name: 'Payment Service', status: 'online' },
      { name: 'AI Service', status: 'online' },
      { name: 'Notification Service', status: 'online' }
    ];

    res.status(200).json({
      success: true,
      data: {
        apiStatus: 'online',
        databaseStatus,
        socketConnections,
        cpuUsage: `${cpuUsagePercent}%`,
        memoryUsage: `${memoryUsagePercent}%`,
        uptime,
        services
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== Security Center ====================

// @desc    Get security analytics
// @route   GET /api/admin/security-analytics
router.get('/security-analytics', async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total counts
    const failedLoginAttempts = await mongoose.model('SecurityEvent').countDocuments({ type: 'failed-login', createdAt: { $gte: last7Days } });
    const blockedRequests = await mongoose.model('SecurityEvent').countDocuments({ type: 'blocked-request', createdAt: { $gte: last7Days } });
    const rateLimitHits = await mongoose.model('SecurityEvent').countDocuments({ type: 'rate-limit-hit', createdAt: { $gte: last7Days } });
    const passwordResetRequests = await mongoose.model('SecurityEvent').countDocuments({ type: 'password-reset', createdAt: { $gte: last7Days } });

    // Login activity per day
    const loginActivity = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);

      const successfulLogins = await mongoose.model('User').countDocuments({ lastLogin: { $gte: start, $lt: end } });
      const failedLogins = await mongoose.model('SecurityEvent').countDocuments({ type: 'failed-login', createdAt: { $gte: start, $lt: end } });

      loginActivity.push({
        date: start.toISOString().split('T')[0],
        successful: successfulLogins,
        failed: failedLogins
      });
    }

    // Security events per day
    const securityEvents = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);

      const blockedReqCount = await mongoose.model('SecurityEvent').countDocuments({ type: 'blocked-request', createdAt: { $gte: start, $lt: end } });
      const rateLimitCount = await mongoose.model('SecurityEvent').countDocuments({ type: 'rate-limit-hit', createdAt: { $gte: start, $lt: end } });
      const passwordResetCount = await mongoose.model('SecurityEvent').countDocuments({ type: 'password-reset', createdAt: { $gte: start, $lt: end } });

      securityEvents.push({
        date: start.toISOString().split('T')[0],
        blockedRequests: blockedReqCount,
        rateLimitHits: rateLimitCount,
        passwordResets: passwordResetCount
      });
    }

    res.status(200).json({
      success: true,
      data: {
        failedLoginAttempts,
        blockedRequests,
        rateLimitHits,
        passwordResetRequests,
        loginActivity,
        securityEvents
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==================== Admin Settings ====================

// @desc    Get admin settings
// @route   GET /api/admin/settings
router.get('/settings', async (req, res, next) => {
  try {
    let settings = await SystemSetting.findOne();

    // Create default settings if not exists
    if (!settings) {
      settings = await SystemSetting.create({});
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update admin settings
// @route   PUT /api/admin/settings
router.put('/settings', async (req, res, next) => {
  try {
    let settings = await SystemSetting.findOne();

    if (!settings) {
      settings = new SystemSetting(req.body);
    } else {
      // Update fields
      Object.assign(settings, req.body);
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings saved successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

// ==================== User Management ====================

// @desc    Get all users (with search/filter)
// @route   GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const { search, role, isActive, isPremium, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined && isActive !== '') query.isActive = isActive === 'true';
    if (isPremium !== undefined && isPremium !== '') query.isPremium = isPremium === 'true';

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      users: users.map(u => u.getPublicProfile())
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
router.put('/users/:id', async (req, res, next) => {
  try {
    const { name, email, role, isActive, isPremium, subscriptionPlan } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (isPremium !== undefined) user.isPremium = isPremium;
    if (subscriptionPlan) user.subscriptionPlan = subscriptionPlan;

    await user.save();

    // Emit event to admin dashboard
    const adminNamespace = req.app.get('adminNamespace');
    if (adminNamespace) {
      adminNamespace.emit('statsUpdate');
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await User.findByIdAndDelete(req.params.id);

    // Emit event to admin dashboard
    const adminNamespace = req.app.get('adminNamespace');
    if (adminNamespace) {
      adminNamespace.emit('statsUpdate');
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
