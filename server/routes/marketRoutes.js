import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMarketMovers } from '../controllers/marketController.js';

const router = express.Router();

router.use(protect);

router.get('/movers', getMarketMovers);

export default router;
