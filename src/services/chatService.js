import api from './api';

// Chat service for users and vendors
export const chatService = {
  // Get user's chat with admin
  getUserChat: async () => {
    const response = await api.get('/chat');
    return response.data;
  },

  // Send message to admin
  sendMessage: async (content, messageType = 'text', fileUrl = null) => {
    const response = await api.post('/chat/message', {
      content,
      messageType,
      fileUrl
    });
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (chatId) => {
    const response = await api.put(`/chat/${chatId}/read`);
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get('/chat/unread');
    return response.data;
  }
};

// Chat service for admins
export const adminChatService = {
  // Get all chats for admin
  getAdminChats: async () => {
    try {
      const response = await api.get('/chat/admin');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get specific chat for admin
  getAdminChat: async (chatId) => {
    const response = await api.get(`/chat/admin/${chatId}`);
    return response.data;
  },

  // Admin sends message to user/vendor
  sendMessage: async (chatId, content, messageType = 'text', fileUrl = null) => {
    const response = await api.post(`/chat/admin/${chatId}/message`, {
      content,
      messageType,
      fileUrl
    });
    return response.data;
  }
}; 