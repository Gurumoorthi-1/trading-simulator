import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getPortfolio,
  buyStock,
  sellStock,
  getTradeHistory,
  getWeeklyPnL,
  getTrendingStocks,
  getRecentTrades,
} from '../controllers/tradeController.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

const tradeValidation = [
  body('symbol').trim().notEmpty().withMessage('Symbol is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('price').isFloat({ min: 0.01 }).withMessage('Invalid price'),
];

// All trade routes need authentication
router.use(protect);

// Portfolio
router.get('/portfolio', getPortfolio);

// Trade actions
router.post('/buy', tradeValidation, validate, buyStock);
router.post('/sell', tradeValidation, validate, sellStock);

// Trade history
router.get('/history', getTradeHistory);

// Dashboard data endpoints
router.get('/weekly-pnl', getWeeklyPnL);
router.get('/trending', getTrendingStocks);
router.get('/recent', getRecentTrades);

export default router;
