import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';

// ==================== @GET /api/wallet/balance ====================
// Get user's current balance
export const getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      balance: user.balance,
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @POST /api/wallet/deposit ====================
// Deposit virtual money
export const deposit = async (req, res, next) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return next(new AppError('Please provide a valid deposit amount greater than 0.', 400));
    }

    if (amount < 100) {
      return next(new AppError('Minimum deposit amount is $100.', 400));
    }

    if (amount > 1000000) {
      return next(new AppError('Maximum deposit amount is $1,000,000.', 400));
    }

    // Update user balance
    const user = await User.findById(req.user._id);
    const newBalance = user.balance + amount;

    user.balance = newBalance;
    await user.save({ validateBeforeSave: false });

    // Record transaction
    await Transaction.create({
      user: user._id,
      type: 'deposit',
      amount,
      status: 'completed',
      details: 'Bank Transfer - Virtual Deposit',
      balanceAfter: newBalance,
    });

    // Create notification
    await Notification.create({
      user: user._id,
      title: 'Deposit Successful 💰',
      message: `$${amount.toLocaleString()} has been added to your wallet. New balance: $${newBalance.toLocaleString()}`,
      type: 'wallet',
    });

    // Emit Socket.io event
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('walletUpdate', {
      type: 'deposit',
      newBalance,
    });

    // Emit event to admin dashboard
    const adminNamespace = req.app.get('adminNamespace');
    if (adminNamespace) {
      adminNamespace.emit('statsUpdate');
    }

    res.status(200).json({
      success: true,
      message: `Successfully deposited $${amount.toLocaleString()}!`,
      balance: newBalance,
      transaction: {
        type: 'deposit',
        amount,
        balanceAfter: newBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @POST /api/wallet/withdraw ====================
// Withdraw virtual money
export const withdraw = async (req, res, next) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return next(new AppError('Please provide a valid withdrawal amount.', 400));
    }

    if (amount < 100) {
      return next(new AppError('Minimum withdrawal amount is $100.', 400));
    }

    const user = await User.findById(req.user._id);

    // Check sufficient balance
    if (user.balance < amount) {
      return next(
        new AppError(
          `Insufficient balance. Available: $${user.balance.toLocaleString()}`,
          400
        )
      );
    }

    const newBalance = user.balance - amount;
    user.balance = newBalance;
    await user.save({ validateBeforeSave: false });

    // Record transaction
    await Transaction.create({
      user: user._id,
      type: 'withdrawal',
      amount,
      status: 'completed',
      details: 'Transfer to Bank - Virtual Withdrawal',
      balanceAfter: newBalance,
    });

    // Create notification
    await Notification.create({
      user: user._id,
      title: 'Withdrawal Processed 🏦',
      message: `$${amount.toLocaleString()} withdrawn from your wallet. Remaining balance: $${newBalance.toLocaleString()}`,
      type: 'wallet',
    });

    // Emit Socket.io event
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('walletUpdate', {
      type: 'withdrawal',
      newBalance,
    });

    // Emit event to admin dashboard
    const adminNamespace = req.app.get('adminNamespace');
    if (adminNamespace) {
      adminNamespace.emit('statsUpdate');
    }

    res.status(200).json({
      success: true,
      message: `Successfully withdrew $${amount.toLocaleString()}!`,
      balance: newBalance,
      transaction: {
        type: 'withdrawal',
        amount,
        balanceAfter: newBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @GET /api/wallet/transactions ====================
// Get transaction history
export const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type; // Optional filter by type
    const skip = (page - 1) * limit;

    // Build query
    const query = { user: req.user._id };
    if (type && ['deposit', 'withdrawal', 'trade_buy', 'trade_sell'].includes(type)) {
      query.type = type;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @GET /api/wallet/summary ====================
// Wallet analytics summary
export const getWalletSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate transaction data
    const summary = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Restructure summary
    const stats = {
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalBought: 0,
      totalSold: 0,
      depositCount: 0,
      withdrawalCount: 0,
      tradeCount: 0,
    };

    summary.forEach((item) => {
      switch (item._id) {
        case 'deposit':
          stats.totalDeposited = item.totalAmount;
          stats.depositCount = item.count;
          break;
        case 'withdrawal':
          stats.totalWithdrawn = item.totalAmount;
          stats.withdrawalCount = item.count;
          break;
        case 'trade_buy':
          stats.totalBought = item.totalAmount;
          stats.tradeCount += item.count;
          break;
        case 'trade_sell':
          stats.totalSold = item.totalAmount;
          stats.tradeCount += item.count;
          break;
      }
    });

    // Get current balance
    const user = await User.findById(userId);

    // Recent transactions (last 5)
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      balance: user.balance,
      stats,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};
