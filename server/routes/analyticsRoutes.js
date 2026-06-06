import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getPortfolioGrowth, getCashFlow } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect);

router.get('/portfolio-growth', getPortfolioGrowth);
router.get('/cash-flow', getCashFlow);

export default router;
