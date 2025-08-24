const express = require('express');
const router = express.Router();
const {
  getUserChat,
  sendMessage,
  getAdminChats,
  getAdminChat,
  adminSendMessage,
  markAsRead,
  getUnreadCount
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// User/Vendor chat routes (only for users and vendors)
router.get('/', protect, getUserChat);
router.post('/message', protect, sendMessage);
router.put('/:chatId/read', protect, markAsRead);
router.get('/unread', protect, getUnreadCount);

// Admin chat routes (only for admins)
router.get('/admin', protect, getAdminChats);
router.get('/admin/:chatId', protect, getAdminChat);
router.post('/admin/:chatId/message', protect, adminSendMessage);

module.exports = router; 