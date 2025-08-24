import React from 'react';

const EmailSettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">Email Settings</h1>
        <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
          Configure email notifications and templates
        </p>
      </div>

      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg">
        <div className="p-6 space-y-6">
          {/* SMTP Configuration */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">SMTP Configuration</h3>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                  placeholder="smtp.yourdomain.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                    placeholder="587"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                    Encryption Type
                  </label>
                  <select
                    className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  SMTP Username
                </label>
                <input
                  type="text"
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  SMTP Password
                </label>
                <input
                  type="password"
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                />
              </div>
            </div>
          </section>

          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700 my-8"></div>

          {/* Email Templates */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Email Templates</h3>
            <div className="mt-6 space-y-6">
              <div className="bg-admin-slate-50 dark:bg-admin-slate-900/50 p-6 rounded-lg">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">Order Confirmation</h4>
                      <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">Template for order confirmation emails</p>
                    </div>
                    <button
                      type="button"
                      className="text-admin-ucla-600 hover:text-admin-ucla-500 text-sm font-medium"
                    >
                      Edit Template
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">Welcome Email</h4>
                      <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">Template for new user welcome emails</p>
                    </div>
                    <button
                      type="button"
                      className="text-admin-ucla-600 hover:text-admin-ucla-500 text-sm font-medium"
                    >
                      Edit Template
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">Password Reset</h4>
                      <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">Template for password reset emails</p>
                    </div>
                    <button
                      type="button"
                      className="text-admin-ucla-600 hover:text-admin-ucla-500 text-sm font-medium"
                    >
                      Edit Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700 my-8"></div>

          {/* Notification Settings */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Notification Settings</h3>
            <div className="mt-6 space-y-6">
              <div className="relative flex items-start">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-admin-ucla-600 border-admin-slate-300 rounded focus:ring-admin-ucla-500"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                    Order Notifications
                  </label>
                  <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400 mt-1">
                    Receive email notifications for new orders
                  </p>
                </div>
              </div>

              <div className="relative flex items-start">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-admin-ucla-600 border-admin-slate-300 rounded focus:ring-admin-ucla-500"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300">
                    Customer Messages
                  </label>
                  <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400 mt-1">
                    Receive email notifications for customer inquiries
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EmailSettingsPage;