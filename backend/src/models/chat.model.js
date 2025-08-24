const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  chatType: {
    type: String,
    enum: ['user-admin', 'vendor-admin'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add a message to the chat
chatSchema.methods.addMessage = function(senderId, content, messageType = 'text', fileUrl = null) {
  const message = {
    sender: senderId,
    content,
    messageType,
    fileUrl,
    createdAt: new Date()
  };
  
  this.messages.push(message);
  this.lastMessage = new Date();
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString() && !message.isRead) {
      message.isRead = true;
    }
  });
  return this.save();
};

// Static method to find or create chat between user/vendor and admin
chatSchema.statics.findOrCreateChat = async function(userId, userRole) {
  // Find admin users
  const User = mongoose.model('User');
  const adminUsers = await User.find({ role: 'admin' });
  
  if (adminUsers.length === 0) {
    throw new Error('No admin users found');
  }
  
  // Use the first admin for now (you can implement admin selection logic later)
  const adminId = adminUsers[0]._id;
  
  // Determine chat type
  const chatType = userRole === 'vendor' ? 'vendor-admin' : 'user-admin';
  
  // Check if chat already exists
  let chat = await this.findOne({
    participants: { $all: [userId, adminId] },
    chatType,
    isActive: true
  });
  
  if (!chat) {
    // Create new chat
    chat = new this({
      participants: [userId, adminId],
      chatType,
      messages: []
    });
    await chat.save();
  }
  
  return chat;
};

module.exports = mongoose.model('Chat', chatSchema); 