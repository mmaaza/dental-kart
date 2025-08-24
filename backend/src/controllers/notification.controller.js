const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Get all notifications for the current user
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  const skip = (page - 1) * limit;

  // Build query
  const query = { recipient: req.user._id };
  if (type) {
    query.type = type;
  }

  // Get notifications with pagination
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('createdBy', 'name email')
    .lean();

  // Get total count
  const total = await Notification.countDocuments(query);

  // Get unread count
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.status(200).json(
    new ApiResponse(200, {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    }, "Notifications retrieved successfully")
  );
});

// Mark a notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: req.user._id
    },
    {
      isRead: true
    },
    {
      new: true
    }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.status(200).json(
    new ApiResponse(200, notification, "Notification marked as read")
  );
});

// Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    {
      recipient: req.user._id,
      isRead: false
    },
    {
      isRead: true
    }
  );

  res.status(200).json(
    new ApiResponse(200, { updatedCount: result.modifiedCount }, "All notifications marked as read")
  );
});

// Get unread count
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.status(200).json(
    new ApiResponse(200, { count }, "Unread count retrieved")
  );
});

// Create a new notification (any authenticated user can create notifications for admins)
const createNotification = asyncHandler(async (req, res) => {
  const { type, title, message, data, recipientId } = req.body;

  // Validate required fields
  if (!type || !title || !message) {
    throw new ApiError(400, "Type, title, and message are required");
  }

  let recipients = [];
  
  if (recipientId) {
    // If specific recipient is provided, verify they exist
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      throw new ApiError(404, "Recipient not found");
    }
    recipients = [recipient._id];
  } else {
    // If no specific recipient, send to all admin users
    const adminUsers = await User.find({ role: 'admin' });
    recipients = adminUsers.map(user => user._id);
  }

  // Don't create notifications if no recipients found
  if (recipients.length === 0) {
    throw new ApiError(404, "No admin users found to receive notifications");
  }

  // Create notifications for all recipients
  const notifications = [];
  for (const recipientId of recipients) {
    const notification = new Notification({
      type,
      title,
      message,
      data: data || {},
      recipient: recipientId,
      createdBy: req.user._id
    });
    notifications.push(notification);
  }

  await Notification.insertMany(notifications);

  res.status(201).json(
    new ApiResponse(201, { count: notifications.length }, "Notifications created successfully")
  );
});

// Delete a notification
const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: req.user._id
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.status(200).json(
    new ApiResponse(200, {}, "Notification deleted successfully")
  );
});

// Delete all notifications for the current user
const deleteAllNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    recipient: req.user._id
  });

  res.status(200).json(
    new ApiResponse(200, { deletedCount: result.deletedCount }, "All notifications deleted successfully")
  );
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createNotification,
  deleteNotification,
  deleteAllNotifications
}; 