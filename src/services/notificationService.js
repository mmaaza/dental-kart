import api from './api';

class NotificationService {
  constructor() {
    this.pollingInterval = null;
    this.lastCheck = null;
  }

  // Fetch notifications from API
  async fetchNotifications() {
    try {
      console.log('Fetching notifications...');
      const response = await api.get('/notifications');
      console.log('Notifications API response:', response.data);
      return response.data.data; // Access the data property from ApiResponse
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.data.count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Start polling for notifications
  startPolling(callback, interval = 30000) { // 30 seconds default
    this.stopPolling();
    
    this.pollingInterval = setInterval(async () => {
      try {
        const notifications = await this.fetchNotifications();
        callback(notifications);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Create a new notification (for testing or admin use)
  async createNotification(notificationData) {
    try {
      const response = await api.post('/notifications', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
}

export default new NotificationService(); 