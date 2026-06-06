import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';

// ==================== @GET /api/portfolio ====================
// Fetch user portfolio
export const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      // Create empty portfolio if not exists
      const newPortfolio = await Portfolio.create({
        user: req.user._id,
        holdings: [],
      });
      return res.status(200).json({
        success: true,
        portfolio: newPortfolio,
        totalHoldings: 0,
      });
    }

    res.status(200).json({
      success: true,
      portfolio,
      totalHoldings: portfolio.holdings.length,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @POST /api/trade/buy ====================
// Buy stock
export const buyStock = async (req, res, next) => {
  try {
    const { symbol, name, quantity, price } = req.body;

    // Validate inputs
    if (!symbol || !name || !quantity || !price) {
      return next(new AppError('Symbol, name, quantity, and price are required.', 400));
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return next(new AppError('Quantity must be a positive whole number.', 400));
    }

    if (price <= 0) {
      return next(new AppError('Price must be greater than 0.', 400));
    }

    const totalCost = quantity * price;

    // Get user and check balance
    const user = await User.findById(req.user._id);

    if (user.balance < totalCost) {
      return next(
        new AppError(
          `Insufficient balance. Required: $${totalCost.toLocaleString()}, Available: $${user.balance.toLocaleString()}`,
          400
        )
      );
    }

    // Get or create portfolio
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user._id, holdings: [] });
    }

    // Check if stock already in portfolio
    const existingIndex = portfolio.holdings.findIndex(
      (h) => h.symbol === symbol.toUpperCase()
    );

    if (existingIndex >= 0) {
      // Already holding - update average price (Weighted Average)
      const existing = portfolio.holdings[existingIndex];
      const totalInvested = existing.shares * existing.averagePrice + totalCost;
      const newTotalShares = existing.shares + quantity;

      portfolio.holdings[existingIndex] = {
        ...existing.toObject(),
        shares: newTotalShares,
        averagePrice: totalInvested / newTotalShares,
        lastUpdatedAt: new Date(),
      };
    } else {
      // New stock - add to portfolio
      portfolio.holdings.push({
        symbol: symbol.toUpperCase(),
        name,
        shares: quantity,
        averagePrice: price,
        firstBoughtAt: new Date(),
        lastUpdatedAt: new Date(),
      });
    }

    // Update totalInvested
    portfolio.totalInvested = (portfolio.totalInvested || 0) + totalCost;
    await portfolio.save();

    // Deduct balance from user
    const newBalance = user.balance - totalCost;
    user.balance = newBalance;
    await user.save({ validateBeforeSave: false });

    // Record transaction
    const transaction = await Transaction.create({
      user: user._id,
      type: 'trade_buy',
      amount: totalCost,
      status: 'completed',
      details: `Bought ${quantity} shares of ${symbol.toUpperCase()} at $${price.toFixed(2)}`,
      stockSymbol: symbol.toUpperCase(),
      stockName: name,
      quantity,
      pricePerShare: price,
      balanceAfter: newBalance,
    });

    // Create notification
    await Notification.create({
      user: user._id,
      title: `Bought ${symbol.toUpperCase()} 📈`,
      message: `Successfully purchased ${quantity} shares of ${name} at $${price.toFixed(2)} each. Total: $${totalCost.toLocaleString()}`,
      type: 'trade',
    });

    // Emit Socket.io event
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('tradeUpdate', {
      type: 'buy',
      newBalance,
      portfolio,
    });
    
    // Emit event to admin dashboard
    const adminNamespace = req.app.get('adminNamespace');
    if (adminNamespace) {
      adminNamespace.emit('newTrade', {
        userId: user._id,
        userName: user.name,
        type: 'buy',
        symbol: symbol.toUpperCase(),
        name,
        quantity,
        price,
        total: totalCost,
        timestamp: new Date()
      });
      // Also emit stats update
      adminNamespace.emit('statsUpdate');
    }

    res.status(200).json({
      success: true,
      message: `Successfully bought ${quantity} shares of ${symbol.toUpperCase()}!`,
      trade: {
        symbol: symbol.toUpperCase(),
        name,
        type: 'buy',
        quantity,
        price,
        totalCost,
        newBalance,
      },
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @POST /api/trade/sell ====================
// Sell stock
export const sellStock = async (req, res, next) => {
  try {
    const { symbol, quantity, price } = req.body;

    // Validate inputs
    if (!symbol || !quantity || !price) {
      return next(new AppError('Symbol, quantity, and price are required.', 400));
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return next(new AppError('Quantity must be a positive whole number.', 400));
    }

    const totalValue = quantity * price;

    // Get portfolio
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      return next(new AppError('Portfolio not found.', 404));
    }

    // Find the stock holding
    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.symbol === symbol.toUpperCase()
    );

    if (holdingIndex < 0) {
      return next(
        new AppError(`You don't own any shares of ${symbol.toUpperCase()}.`, 400)
      );
    }

    const holding = portfolio.holdings[holdingIndex];

    if (holding.shares < quantity) {
      return next(
        new AppError(
          `Insufficient shares. You have ${holding.shares} shares of ${symbol.toUpperCase()}.`,
          400
        )
      );
    }

    // Update or remove holding
    if (holding.shares === quantity) {
      // Sell all - remove from portfolio
      portfolio.holdings.splice(holdingIndex, 1);
    } else {
      // Partial sell - reduce shares
      portfolio.holdings[holdingIndex] = {
        ...holding.toObject(),
        shares: holding.shares - quantity,
        lastUpdatedAt: new Date(),
      };
    }

    // Update totalInvested (reduce by cost basis)
    const costBasis = quantity * holding.averagePrice;
    portfolio.totalInvested = Math.max(0, (portfolio.totalInvested || 0) - costBasis);
    await portfolio.save();

    // Add money to user balance
    const user = await User.findById(req.user._id);
    const newBalance = user.balance + totalValue;
    user.balance = newBalance;
    await user.save({ validateBeforeSave: false });

    // Calculate profit/loss
    const profitLoss = totalValue - costBasis;
    const profitLossPercent = ((profitLoss / costBasis) * 100).toFixed(2);

    // Record transaction
    const transaction = await Transaction.create({
      user: user._id,
      type: 'trade_sell',
      amount: totalValue,
      status: 'completed',
      details: `Sold ${quantity} shares of ${symbol.toUpperCase()} at $${price.toFixed(2)}`,
      stockSymbol: symbol.toUpperCase(),
      stockName: holding.name,
      quantity,
      pricePerShare: price,
      balanceAfter: newBalance,
    });

    // Create notification
    const isProfit = profitLoss >= 0;
    await Notification.create({
      user: user._id,
      title: `Sold ${symbol.toUpperCase()} ${isProfit ? '💚' : '🔴'}`,
      message: `Sold ${quantity} shares of ${holding.name} at $${price.toFixed(2)}. ${isProfit ? 'Profit' : 'Loss'}: $${Math.abs(profitLoss).toFixed(2)} (${profitLossPercent}%)`,
      type: 'trade',
    });

    // Emit Socket.io event
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('tradeUpdate', {
      type: 'sell',
      newBalance,
      portfolio,
    });
    
    // Emit event to admin dashboard
    const adminNamespace = req.app.get('adminNamespace');
    if (adminNamespace) {
      adminNamespace.emit('newTrade', {
        userId: user._id,
        userName: user.name,
        type: 'sell',
        symbol: symbol.toUpperCase(),
        name: holding.name,
        quantity,
        price,
        total: totalValue,
        profitLoss,
        timestamp: new Date()
      });
      // Also emit stats update
      adminNamespace.emit('statsUpdate');
    }

    res.status(200).json({
      success: true,
      message: `Successfully sold ${quantity} shares of ${symbol.toUpperCase()}!`,
      trade: {
        symbol: symbol.toUpperCase(),
        name: holding.name,
        type: 'sell',
        quantity,
        price,
        totalValue,
        profitLoss,
        profitLossPercent,
        newBalance,
      },
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @GET /api/trade/history ====================
// Trade history only (buy/sell transactions)
export const getTradeHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [trades, total] = await Promise.all([
      Transaction.find({
        user: req.user._id,
        type: { $in: ['trade_buy', 'trade_sell'] },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({
        user: req.user._id,
        type: { $in: ['trade_buy', 'trade_sell'] },
      }),
    ]);

    res.status(200).json({
      success: true,
      trades,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTrades: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @GET /api/trade/weekly-pnl ====================
// Compute weekly Profit & Loss from real trade data
export const getWeeklyPnL = async (req, res, next) => {
  try {
    // Get all trade transactions for the past 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trades = await Transaction.find({
      user: req.user._id,
      type: { $in: ['trade_buy', 'trade_sell'] },
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: 1 });

    // Group by day of week
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = {};

    // Initialize all 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayKey = d.toISOString().split('T')[0];
      weeklyData[dayKey] = {
        name: dayNames[d.getDay()],
        date: dayKey,
        buyTotal: 0,
        sellTotal: 0,
        net: 0,
      };
    }

    // Aggregate trade amounts by day
    trades.forEach((trade) => {
      const dayKey = trade.createdAt.toISOString().split('T')[0];
      if (weeklyData[dayKey]) {
        if (trade.type === 'trade_buy') {
          weeklyData[dayKey].buyTotal += trade.amount;
        } else if (trade.type === 'trade_sell') {
          weeklyData[dayKey].sellTotal += trade.amount;
        }
      }
    });

    // Calculate net P&L per day (sell revenue - buy cost)
    const result = Object.values(weeklyData).map((day) => ({
      name: day.name,
      date: day.date,
      net: parseFloat((day.sellTotal - day.buyTotal).toFixed(2)),
      buyTotal: parseFloat(day.buyTotal.toFixed(2)),
      sellTotal: parseFloat(day.sellTotal.toFixed(2)),
    }));

    res.status(200).json({
      success: true,
      weeklyPnL: result,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @GET /api/trade/trending ====================
// Get user's portfolio holdings as "trending" stocks with simulated price movement
export const getTrendingStocks = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio || portfolio.holdings.length === 0) {
      return res.status(200).json({
        success: true,
        trending: [],
      });
    }

    // For each holding, simulate a current price with a small random fluctuation
    // In production, replace this with a real market API (e.g., Alpha Vantage)
    const trending = portfolio.holdings.map((h) => {
      const fluctuation = (Math.random() - 0.45) * 0.06; // slight upward bias
      const currentPrice = parseFloat((h.averagePrice * (1 + fluctuation)).toFixed(2));
      const changePercent = parseFloat((fluctuation * 100).toFixed(2));
      return {
        symbol: h.symbol,
        name: h.name,
        price: currentPrice,
        averagePrice: h.averagePrice,
        change: `${changePercent >= 0 ? '+' : ''}${changePercent}%`,
        isPositive: changePercent >= 0,
        shares: h.shares,
      };
    });

    // Sort by absolute change percentage (most volatile first)
    trending.sort((a, b) => Math.abs(parseFloat(b.change)) - Math.abs(parseFloat(a.change)));

    res.status(200).json({
      success: true,
      trending: trending.slice(0, 8), // Return top 8
    });
  } catch (error) {
    next(error);
  }
};

// ==================== @GET /api/trade/recent ====================
// Get recent trades for dashboard (simplified, last 5)
export const getRecentTrades = async (req, res, next) => {
  try {
    const trades = await Transaction.find({
      user: req.user._id,
      type: { $in: ['trade_buy', 'trade_sell'] },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      trades,
    });
  } catch (error) {
    next(error);
  }
};
