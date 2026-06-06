import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getRiskAnalysis } from '../controllers/riskController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get risk analysis of portfolio
router.get('/', getRiskAnalysis);
router.get('/analysis', getRiskAnalysis);

export default router;
