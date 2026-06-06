import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getBalance,
  deposit,
  withdraw,
  getTransactions,
  getWalletSummary,
} from '../controllers/walletController.js';

import { body } from 'express-validator';
import { validate } from '../middleware/validateMiddleware.js'; // Assuming it exists or I'll create it

const router = express.Router();

const amountValidation = [
  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 1 }).withMessage('Minimum amount is 1'),
];

// All wallet routes need authentication
router.use(protect);

router.get('/balance', getBalance);
router.get('/summary', getWalletSummary);
router.get('/transactions', getTransactions);
router.post('/deposit', amountValidation, validate, deposit);
router.post('/withdraw', amountValidation, validate, withdraw);

export default router;
