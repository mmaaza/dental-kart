import React, { useState } from 'react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedTab, setSelectedTab] = useState('create');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage push notifications for your users
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-mobile rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setSelectedTab('create')}
              className={`${
                selectedTab === 'create'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Create Notification
            </button>
            <button
              onClick={() => setSelectedTab('history')}
              className={`${
                selectedTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Notification History
            </button>
          </nav>
        </div>

        {/* Create Notification Form */}
        {selectedTab === 'create' && (
          <div className="p-6">
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1">
                    Notification Title
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="title"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm py-3 px-4 bg-white hover:bg-gray-50 transition-colors duration-200"
                      placeholder="Enter notification title"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-1">
                    Message
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      rows={4}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm py-3 px-4 bg-white hover:bg-gray-50 transition-colors duration-200"
                      placeholder="Enter notification message"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="target" className="block text-sm font-medium text-gray-900 mb-1">
                    Target Audience
                  </label>
                  <div className="relative">
                    <select
                      id="target"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm py-3 pl-4 pr-10 bg-white hover:bg-gray-50 transition-colors duration-200 appearance-none"
                    >
                      <option value="" disabled>Select target audience</option>
                      <option value="all">All Users</option>
                      <option value="active">Active Users</option>
                      <option value="inactive">Inactive Users</option>
                      <option value="specific">Specific User Groups</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="schedule" className="block text-sm font-medium text-gray-900 mb-1">
                    Schedule
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      id="schedule"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm py-3 px-4 bg-white hover:bg-gray-50 transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Notification
                </button>
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Save as Draft
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notification History */}
        {selectedTab === 'history' && (
          <div className="p-6">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new notification.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setSelectedTab('create')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Notification
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${notification.status === 'sent' ? 'bg-green-100 text-green-800' :
                          notification.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                          {notification.status}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex space-x-4 text-sm text-gray-500">
                          <span>{notification.date}</span>
                          <span>•</span>
                          <span>{notification.target}</span>
                        </div>
                        <button className="text-sm font-medium text-primary-600 hover:text-primary-900">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;