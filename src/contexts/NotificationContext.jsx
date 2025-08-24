import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || currentUser?.role !== 'admin') return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await notificationService.fetchNotifications();
      console.log('Fetched notifications data:', data);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentUser?.role]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, []);

  // Get unread count
  const getUnreadCount = useCallback(async () => {
    if (!isAuthenticated || currentUser?.role !== 'admin') return;

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error getting unread count:', err);
    }
  }, [isAuthenticated, currentUser?.role]);

  // Start polling for notifications
  const startPolling = useCallback(() => {
    if (!isAuthenticated || currentUser?.role !== 'admin') return;

    // Initial fetch
    fetchNotifications();
    
    // Start polling every 30 seconds
    notificationService.startPolling(fetchNotifications, 30000);
  }, [isAuthenticated, currentUser?.role, fetchNotifications]);

  // Stop polling
  const stopPolling = useCallback(() => {
    notificationService.stopPolling();
  }, []);

  // Effect to start/stop polling based on authentication and role
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'admin') {
      startPolling();
    } else {
      stopPolling();
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      stopPolling();
    };
  }, [isAuthenticated, currentUser?.role, startPolling, stopPolling]);

  // Effect to get unread count when user changes
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'admin') {
      getUnreadCount();
    }
  }, [isAuthenticated, currentUser?.role, getUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    startPolling,
    stopPolling
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 