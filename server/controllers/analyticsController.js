import Transaction from '../models/Transaction.js';
import Portfolio from '../models/Portfolio.js';
import User from '../models/User.js';
import AIEvent from '../models/AIEvent.js';

// Dummy stock data for the market page simulation
const allStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 2.15, changePercent: 1.22, sector: 'Technology', volume: '52.3M', marketCap: '2.81T', pe: 29.4, high52: 199.62, low52: 124.17, sparkline: [170, 172, 168, 174, 171, 175, 178] },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 4.52, changePercent: 1.21, sector: 'Technology', volume: '21.1M', marketCap: '2.81T', pe: 35.2, high52: 384.30, low52: 245.61, sparkline: [365, 370, 368, 372, 374, 376, 378] },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: -0.95, changePercent: -0.67, sector: 'Technology', volume: '18.7M', marketCap: '1.77T', pe: 25.1, high52: 153.78, low52: 102.21, sparkline: [145, 143, 144, 142, 140, 141, 141] },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.25, change: 3.40, changePercent: 1.95, sector: 'Consumer', volume: '45.6M', marketCap: '1.84T', pe: 62.3, high52: 189.77, low52: 118.35, sparkline: [168, 170, 172, 175, 174, 176, 178] },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 238.45, change: -8.12, changePercent: -3.29, sector: 'Automotive', volume: '98.2M', marketCap: '757B', pe: 72.1, high52: 299.29, low52: 152.37, sparkline: [252, 248, 245, 242, 240, 239, 238] },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 12.80, changePercent: 2.65, sector: 'Technology', volume: '38.4M', marketCap: '1.22T', pe: 64.8, high52: 502.66, low52: 108.13, sparkline: [470, 475, 480, 485, 488, 492, 495] },
    { symbol: 'META', name: 'Meta Platforms', price: 326.49, change: 5.67, changePercent: 1.77, sector: 'Technology', volume: '14.2M', marketCap: '838B', pe: 28.9, high52: 340.54, low52: 198.05, sparkline: [315, 318, 320, 322, 324, 325, 326] },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 148.35, change: 1.20, changePercent: 0.82, sector: 'Finance', volume: '8.9M', marketCap: '428B', pe: 10.2, high52: 157.34, low52: 123.17, sparkline: [145, 146, 147, 146, 147, 148, 148] },
    { symbol: 'V', name: 'Visa Inc.', price: 252.10, change: -1.85, changePercent: -0.73, sector: 'Finance', volume: '5.4M', marketCap: '518B', pe: 30.5, high52: 261.46, low52: 218.73, sparkline: [256, 255, 254, 253, 252, 253, 252] },
    { symbol: 'JNJ', name: 'Johnson & Johnson', price: 156.82, change: 0.45, changePercent: 0.29, sector: 'Healthcare', volume: '6.1M', marketCap: '378B', pe: 15.8, high52: 175.97, low52: 150.26, sparkline: [155, 156, 155, 156, 156, 157, 156] },
    { symbol: 'UNH', name: 'UnitedHealth Group', price: 524.30, change: -6.20, changePercent: -1.17, sector: 'Healthcare', volume: '3.2M', marketCap: '488B', pe: 22.4, high52: 558.10, low52: 445.68, sparkline: [535, 532, 530, 528, 526, 525, 524] },
    { symbol: 'PG', name: 'Procter & Gamble', price: 152.45, change: 0.80, changePercent: 0.53, sector: 'Consumer', volume: '4.8M', marketCap: '358B', pe: 25.1, high52: 165.35, low52: 141.45, sparkline: [150, 151, 151, 152, 151, 152, 152] },
    { symbol: 'XOM', name: 'Exxon Mobil Corp.', price: 104.50, change: -2.30, changePercent: -2.15, sector: 'Energy', volume: '12.5M', marketCap: '416B', pe: 9.8, high52: 120.70, low52: 95.77, sparkline: [110, 108, 107, 106, 105, 105, 104] },
    { symbol: 'CVX', name: 'Chevron Corp.', price: 148.90, change: -1.65, changePercent: -1.10, sector: 'Energy', volume: '7.3M', marketCap: '282B', pe: 10.5, high52: 189.68, low52: 140.95, sparkline: [153, 152, 151, 150, 149, 149, 148] },
    { symbol: 'KO', name: 'Coca-Cola Co.', price: 57.82, change: 0.32, changePercent: 0.56, sector: 'Consumer', volume: '9.1M', marketCap: '250B', pe: 23.7, high52: 64.99, low52: 51.55, sparkline: [57, 57, 57, 58, 57, 58, 57] },
    { symbol: 'DIS', name: 'Walt Disney Co.', price: 85.40, change: 1.95, changePercent: 2.34, sector: 'Entertainment', volume: '11.8M', marketCap: '156B', pe: 68.2, high52: 123.74, low52: 78.73, sparkline: [80, 81, 82, 83, 84, 84, 85] },
];

// ==================== @GET /api/analytics/portfolio-growth ====================
export const getPortfolioGrowth = async (req, res, next) => {
    try {
        const { period = '1M' } = req.query; // 1D, 1W, 1M, 3M, 6M, 1Y, ALL
        const user = await User.findById(req.user._id);
        const portfolio = await Portfolio.findOne({ user: req.user._id });
        const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: 1 });

        const now = new Date();
        let startDate = new Date(0); // Epoch

        if (period === '1D') startDate.setHours(now.getHours() - 24);
        if (period === '1W') startDate.setDate(now.getDate() - 7);
        if (period === '1M') startDate.setMonth(now.getMonth() - 1);
        if (period === '3M') startDate.setMonth(now.getMonth() - 3);
        if (period === '6M') startDate.setMonth(now.getMonth() - 6);
        if (period === '1Y') startDate.setFullYear(now.getFullYear() - 1);

        // Helper functions to get stock current price
        const getStockCurrentPrice = (symbol, avgPrice) => {
            const stock = allStocks.find(s => s.symbol === symbol.toUpperCase());
            return stock ? stock.price : avgPrice;
        };

        // Calculate current portfolio value
        const holdings = portfolio?.holdings || [];
        const currentPortfolioValue = holdings.reduce((sum, item) => {
            const currentPrice = getStockCurrentPrice(item.symbol, item.averagePrice);
            return sum + (item.shares * currentPrice);
        }, 0);

        const currentWorth = user.balance + currentPortfolioValue;

        // Generate data points for chart
        const dataPoints = [];
        const daysStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const dataCount = period === '1D' ? 24 : period === '1W' ? 7 : period === '1M' ? 30 : period === '3M' ? 90 : period === '6M' ? 180 : period === '1Y' ? 365 : 365;
        const interval = dataCount > 30 ? Math.floor(dataCount / 30) : 1;

        // We generate a curve leading up to currentWorth.
        // In a real app, this would query a historical balance table.
        for (let i = dataCount; i >= 0; i -= interval) {
            const d = new Date(now);
            if (period === '1D') {
                d.setHours(now.getHours() - i);
            } else {
                d.setDate(now.getDate() - i);
            }

            // Simulate historical value based on actual transactions and current worth
            // Reconstructing a growth curve based on time ratio
            const timeRatio = (dataCount - i) / dataCount;
            const baseStart = user.balance;
            const simulatedGrowth = (currentWorth - baseStart) * (Math.pow(timeRatio, 0.8)); // Power curve for more realistic growth look
            const simulatedValue = baseStart + simulatedGrowth;

            let dateLabel;
            if (period === '1D') {
                dateLabel = `${d.getHours()}:00`;
            } else {
                dateLabel = `${daysStr[d.getMonth()]} ${d.getDate()}`;
            }

            dataPoints.push({
                date: dateLabel,
                value: Math.max(0, parseFloat(simulatedValue.toFixed(2))),
            });
        }

        res.status(200).json({
            success: true,
            growth: dataPoints,
            currentWorth,
        });
    } catch (error) {
        next(error);
    }
};

// ==================== @GET /api/analytics/cash-flow ====================
export const getCashFlow = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id, status: 'completed' });

        let totalDeposits = 0;
        let totalWithdrawals = 0;
        let totalInvested = 0; // Buying stocks
        let totalRealized = 0; // Selling stocks

        transactions.forEach(tx => {
            if (tx.type === 'deposit') totalDeposits += tx.amount;
            if (tx.type === 'withdrawal') totalWithdrawals += tx.amount;
            if (tx.type === 'trade_buy') totalInvested += tx.amount;
            if (tx.type === 'trade_sell') totalRealized += tx.amount;
        });

        res.status(200).json({
            success: true,
            cashFlow: {
                totalDeposits,
                totalWithdrawals,
                totalInvested,
                totalRealized,
                netCashFlow: totalDeposits - totalWithdrawals + totalRealized - totalInvested
            }
        });
    } catch (error) {
        next(error);
    }
};
