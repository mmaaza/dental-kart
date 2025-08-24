const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get user's chat with admin
// @route   GET /api/chat
// @access  Private (user/vendor)
const getUserChat = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // Only allow users and vendors to access their chat with admin
  if (userRole === 'admin') {
    throw new ApiError(403, 'Admins cannot access user chat endpoint');
  }

  // Find or create chat with admin
  const chat = await Chat.findOrCreateChat(userId, userRole);
  
  // Populate sender information for messages
  await chat.populate('messages.sender', '_id name email role');
  await chat.populate('participants', '_id name email role');

  res.status(200).json(
    new ApiResponse(200, chat, 'Chat retrieved successfully')
  );
});

// @desc    Send message to admin
// @route   POST /api/chat/message
// @access  Private (user/vendor)
const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { content, messageType = 'text', fileUrl = null } = req.body;

  if (!content || content.trim().length === 0) {
    throw new ApiError(400, 'Message content is required');
  }

  // Only allow users and vendors to send messages
  if (userRole === 'admin') {
    throw new ApiError(403, 'Admins cannot send messages from user endpoint');
  }

  // Find or create chat with admin
  const chat = await Chat.findOrCreateChat(userId, userRole);
  
  // Add message to chat
  await chat.addMessage(userId, content.trim(), messageType, fileUrl);
  
  // Populate sender information
  await chat.populate('messages.sender', '_id name email role');

  res.status(201).json(
    new ApiResponse(201, chat, 'Message sent successfully')
  );
});

// @desc    Get all chats for admin
// @route   GET /api/admin/chat
// @access  Private (admin only)
const getAdminChats = asyncHandler(async (req, res) => {
  const adminId = req.user.id;

  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can access admin chat endpoint');
  }

  // Get all chats where admin is a participant
  const chats = await Chat.find({
    participants: adminId,
    isActive: true
  })
  .populate('participants', '_id name email role')
  .populate('messages.sender', '_id name email role')
  .sort({ lastMessage: -1 });

  res.status(200).json(
    new ApiResponse(200, chats, 'Admin chats retrieved successfully')
  );
});

// @desc    Get specific chat for admin
// @route   GET /api/admin/chat/:chatId
// @access  Private (admin only)
const getAdminChat = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { chatId } = req.params;

  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can access admin chat endpoint');
  }

  const chat = await Chat.findOne({
    _id: chatId,
    participants: adminId,
    isActive: true
  })
  .populate('participants', '_id name email role')
  .populate('messages.sender', '_id name email role');

  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  res.status(200).json(
    new ApiResponse(200, chat, 'Chat retrieved successfully')
  );
});

// @desc    Admin sends message to user/vendor
// @route   POST /api/admin/chat/:chatId/message
// @access  Private (admin only)
const adminSendMessage = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { chatId } = req.params;
  const { content, messageType = 'text', fileUrl = null } = req.body;

  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can send messages from admin endpoint');
  }

  if (!content || content.trim().length === 0) {
    throw new ApiError(400, 'Message content is required');
  }

  const chat = await Chat.findOne({
    _id: chatId,
    participants: adminId,
    isActive: true
  });

  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  // Add message to chat
  await chat.addMessage(adminId, content.trim(), messageType, fileUrl);
  
  // Populate sender information
  await chat.populate('messages.sender', '_id name email role');

  res.status(201).json(
    new ApiResponse(201, chat, 'Message sent successfully')
  );
});

// @desc    Mark messages as read
// @route   PUT /api/chat/:chatId/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;

  const chat = await Chat.findOne({
    _id: chatId,
    participants: userId,
    isActive: true
  });

  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  await chat.markAsRead(userId);

  res.status(200).json(
    new ApiResponse(200, chat, 'Messages marked as read')
  );
});

// @desc    Get unread message count
// @route   GET /api/chat/unread
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const chats = await Chat.find({
    participants: userId,
    isActive: true
  });

  let totalUnread = 0;
  
  for (const chat of chats) {
    const unreadMessages = chat.messages.filter(
      message => !message.isRead && message.sender.toString() !== userId.toString()
    );
    totalUnread += unreadMessages.length;
  }

  res.status(200).json(
    new ApiResponse(200, { unreadCount: totalUnread }, 'Unread count retrieved')
  );
});

// @desc    Test admin access
// @route   GET /api/chat/admin/test
// @access  Private (admin only)
const testAdminAccess = asyncHandler(async (req, res) => {
  console.log('Backend - testAdminAccess called');
  console.log('Backend - req.user:', req.user);
  console.log('Backend - req.user.role:', req.user.role);
  
  res.status(200).json(
    new ApiResponse(200, { 
      message: 'Admin access test successful',
      user: req.user,
      role: req.user.role 
    }, 'Admin access test')
  );
});

module.exports = {
  getUserChat,
  sendMessage,
  getAdminChats,
  getAdminChat,
  adminSendMessage,
  markAsRead,
  getUnreadCount,
  testAdminAccess
}; 