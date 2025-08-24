import React, { useEffect, useState } from 'react';

const Notification = ({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 3000,
  title,
  showClose = true,
  persistent = false 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration && !persistent) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, persistent]);

  if (!isVisible) return null;

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          text: 'text-red-800',
          border: 'border-red-300',
          icon: 'text-red-400',
          hover: 'hover:bg-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          icon: 'text-yellow-400',
          hover: 'hover:bg-yellow-100'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-800',
          border: 'border-blue-300',
          icon: 'text-blue-400',
          hover: 'hover:bg-blue-100'
        };
      case 'success':
      default:
        return {
          bg: 'bg-green-50',
          text: 'text-green-800',
          border: 'border-green-300',
          icon: 'text-green-400',
          hover: 'hover:bg-green-100'
        };
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'error':
        return (
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'success':
      default:
        return (
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const styles = getNotificationStyles(type);

  return (
    <div className={`rounded-md ${styles.bg} p-4 mb-4 border ${styles.border}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={`${styles.icon}`}>
            {getIcon(type)}
          </div>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.text}`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${styles.text}`}>{message}</p>
        </div>
        {showClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={() => {
                  setIsVisible(false);
                  onClose?.();
                }}
                className={`inline-flex rounded-md p-1.5 ${styles.text} ${styles.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : type === 'info' ? 'blue' : 'green'}-500`}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;