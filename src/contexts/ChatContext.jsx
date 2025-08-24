import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { chatService, adminChatService } from '../services/chatService';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { currentUser: user, isAuthenticated } = useAuth();
  const [chat, setChat] = useState(null);
  const [adminChats, setAdminChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user's chat with admin
  const loadUserChat = useCallback(async () => {
    if (!isAuthenticated || user?.role === 'admin') return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await chatService.getUserChat();
      setChat(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load chat');
      console.error('Error loading chat:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  // Load admin chats
  const loadAdminChats = useCallback(async (isBackgroundUpdate = false) => {
    console.log('ChatContext - loadAdminChats called');
    console.log('ChatContext - isAuthenticated:', isAuthenticated);
    console.log('ChatContext - user role:', user?.role);
    
    if (!isAuthenticated || user?.role !== 'admin') {
      console.log('ChatContext - Skipping loadAdminChats - not authenticated or not admin');
      return;
    }

    try {
      if (isBackgroundUpdate) {
        setIsLoading(true);
      } else {
        setIsInitialLoading(true);
      }
      setError(null);
      const response = await adminChatService.getAdminChats();
      setAdminChats(response.data);
      console.log('ChatContext - Admin chats loaded:', response.data);
    } catch (err) {
      setError(err.message || 'Failed to load admin chats');
      console.error('Error loading admin chats:', err);
    } finally {
      if (isBackgroundUpdate) {
        setIsLoading(false);
      } else {
        setIsInitialLoading(false);
      }
    }
  }, [isAuthenticated, user?.role]);

  // Load specific admin chat
  const loadAdminChat = useCallback(async (chatId) => {
    if (!isAuthenticated || user?.role !== 'admin') return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await adminChatService.getAdminChat(chatId);
      setSelectedChat(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load chat');
      console.error('Error loading admin chat:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  // Send message (for users/vendors)
  const sendMessage = useCallback(async (content, messageType = 'text', fileUrl = null) => {
    if (!isAuthenticated || user?.role === 'admin') return;

    try {
      setError(null);
      const response = await chatService.sendMessage(content, messageType, fileUrl);
      setChat(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to send message');
      console.error('Error sending message:', err);
      throw err;
    }
  }, [isAuthenticated, user?.role]);

  // Admin sends message
  const adminSendMessage = useCallback(async (chatId, content, messageType = 'text', fileUrl = null) => {
    if (!isAuthenticated || user?.role !== 'admin') return;

    try {
      setError(null);
      const response = await adminChatService.sendMessage(chatId, content, messageType, fileUrl);
      
      // Update the selected chat
      setSelectedChat(response.data);
      
      // Update the chat in admin chats list
      setAdminChats(prevChats => 
        prevChats.map(chat => 
          chat._id === chatId ? response.data : chat
        )
      );
      
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to send message');
      console.error('Error sending admin message:', err);
      throw err;
    }
  }, [isAuthenticated, user?.role]);

  // Mark messages as read
  const markAsRead = useCallback(async (chatId) => {
    if (!isAuthenticated) return;

    try {
      setError(null);
      const response = await chatService.markAsRead(chatId);
      
      if (user?.role === 'admin') {
        setSelectedChat(response.data);
        setAdminChats(prevChats => 
          prevChats.map(chat => 
            chat._id === chatId ? response.data : chat
          )
        );
      } else {
        setChat(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to mark messages as read');
      console.error('Error marking messages as read:', err);
    }
  }, [isAuthenticated, user?.role]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await chatService.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  }, [isAuthenticated]);

  // Auto-refresh chat data
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        loadAdminChats();
      } else {
        loadUserChat();
      }
      loadUnreadCount();
    }
  }, [isAuthenticated, user?.role, loadUserChat, loadAdminChats, loadUnreadCount]);

  // Set up polling for real-time updates (every 15 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (user?.role === 'admin') {
        loadAdminChats(true); // Pass true for background update
        // If there's a selected chat, also refresh it
        if (selectedChat?._id) {
          loadAdminChat(selectedChat._id);
        }
      } else {
        loadUserChat();
      }
      loadUnreadCount();
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.role, loadUserChat, loadAdminChats, loadAdminChat, loadUnreadCount, selectedChat?._id]);

  // More frequent polling for selected chat (every 8 seconds)
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin' || !selectedChat?._id) return;

    const interval = setInterval(() => {
      loadAdminChat(selectedChat._id);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.role, selectedChat?._id, loadAdminChat]);

  const value = {
    // State
    chat,
    adminChats,
    selectedChat,
    unreadCount,
    isLoading,
    isInitialLoading,
    error,
    
    // Actions
    sendMessage,
    adminSendMessage,
    markAsRead,
    loadUserChat,
    loadAdminChats,
    loadAdminChat,
    setSelectedChat,
    clearError: () => setError(null)
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 