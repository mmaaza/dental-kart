import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import Notification from './Notification';
import { 
  MdNotifications, 
  MdNotificationsNone, 
  MdCheckCircle,
  MdShoppingCart,
  MdChat,
  MdClose
} from 'react-icons/md';

const AdminNotificationsPanel = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handlePanelClick = (e) => {
    // Prevent clicks inside the panel from closing it
    e.stopPropagation();
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking on the backdrop itself
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <MdShoppingCart className="h-5 w-5" />;
      case 'chat':
        return <MdChat className="h-5 w-5" />;
      default:
        return <MdNotifications className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return 'text-admin-ucla-600 dark:text-admin-ucla-400 bg-admin-ucla-50 dark:bg-admin-ucla-900/30';
      case 'chat':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
      default:
        return 'text-admin-slate-600 dark:text-admin-slate-400 bg-admin-slate-50 dark:bg-admin-slate-800/50';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end lg:justify-end"
      onClick={handleBackdropClick}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-25" />
      {/* Notification Panel */}
      <div
        className="relative mt-16 mr-4 w-80 bg-white dark:bg-admin-slate-800 rounded-lg shadow-lg border border-admin-slate-200 dark:border-admin-slate-700 max-h-96 overflow-hidden"
        onClick={handlePanelClick}
        style={{ zIndex: 60 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
          <div className="flex items-center gap-2">
            <MdNotifications className="h-5 w-5 text-admin-slate-600 dark:text-admin-slate-400" />
            <h2 className="text-base font-semibold text-admin-slate-900 dark:text-admin-slate-100">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-admin-slate-400 dark:text-admin-slate-500 hover:text-admin-slate-600 dark:hover:text-admin-slate-300 transition-colors"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>
        {/* Actions */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-admin-slate-200 dark:border-admin-slate-700">
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll || unreadCount === 0}
              className="text-sm text-admin-ucla-600 dark:text-admin-ucla-400 hover:text-admin-ucla-700 dark:hover:text-admin-ucla-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <MdCheckCircle className="h-4 w-4" />
              {isMarkingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          </div>
        )}
        {/* Notifications List */}
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-admin-ucla-500 mx-auto mb-2"></div>
              <p className="text-admin-slate-500 dark:text-admin-slate-400 text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <MdNotificationsNone className="h-10 w-10 text-admin-slate-300 dark:text-admin-slate-600 mx-auto mb-2" />
              <p className="text-admin-slate-500 dark:text-admin-slate-400 text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-admin-slate-200 dark:divide-admin-slate-700">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-admin-ucla-50 dark:bg-admin-ucla-900/20' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!notification.isRead) {
                      markAsRead(notification._id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-admin-slate-900 dark:text-admin-slate-100' : 'text-admin-slate-600 dark:text-admin-slate-400'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-admin-slate-400 dark:text-admin-slate-500 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-admin-ucla-500 dark:bg-admin-ucla-400 rounded-full ml-2 mt-1"></div>
                        )}
                      </div>
                      {notification.data && (
                        <div className="mt-2 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                          {notification.data.orderNumber && (
                            <span className="inline-block bg-admin-slate-100 dark:bg-admin-slate-700 px-2 py-1 rounded mr-2">
                              Order #{notification.data.orderNumber}
                            </span>
                          )}
                          {notification.data.userName && (
                            <span className="inline-block bg-admin-slate-100 dark:bg-admin-slate-700 px-2 py-1 rounded">
                              {notification.data.userName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPanel;
