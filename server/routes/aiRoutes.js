import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAiSuggestions, getRiskChatResponse } from '../controllers/aiController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get AI suggestions for portfolio (using Gemini API or our dummy AI)
router.get('/suggestions', getAiSuggestions);

// Get Risk chat response
router.post('/risk-chat', getRiskChatResponse);

export default router;
