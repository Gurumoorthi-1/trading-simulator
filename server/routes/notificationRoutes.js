import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../controllers/notificationController.js';

const router = express.Router();

// All notification routes need authentication
router.use(protect);

router.get('/', getNotifications);
router.put('/mark-all-read', markAllAsRead);
router.delete('/clear-all', clearAllNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
