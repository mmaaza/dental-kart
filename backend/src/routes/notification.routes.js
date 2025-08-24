const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createNotification,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notification.controller');

// Apply authentication middleware to all routes
router.use(protect);

// Get notifications for current user
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

// Delete all notifications for current user
router.delete('/', deleteAllNotifications);

// Create notification (any authenticated user can create notifications for admins)
router.post('/', createNotification);

module.exports = router; 