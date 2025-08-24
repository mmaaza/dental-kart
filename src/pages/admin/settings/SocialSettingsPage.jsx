import React from 'react';

const SocialSettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">Social Media Settings</h1>
        <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
          Manage your social media presence and sharing options
        </p>
      </div>

      <div className="bg-white dark:bg-admin-slate-800 shadow-sm rounded-lg">
        <div className="p-6 space-y-6">
          {/* Social Media Accounts */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Social Media Accounts</h3>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  Instagram Profile
                </label>
                <input
                  type="url"
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                  placeholder="https://instagram.com/youraccount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  Twitter/X Profile
                </label>
                <input
                  type="url"
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                  placeholder="https://twitter.com/youraccount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-2">
                  LinkedIn Page
                </label>
                <input
                  type="url"
                  className="block w-full rounded-md border-admin-slate-300 shadow-sm focus:border-admin-ucla-500 focus:ring-admin-ucla-500 sm:text-sm dark:bg-admin-slate-700 dark:border-admin-slate-600 dark:text-admin-slate-100 py-3 px-4"
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
            </div>
          </section>

          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700 my-8"></div>

          {/* Social Sharing Settings */}
          <section>
            <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Social Sharing</h3>
            <div className="mt-6 space-y-6">
              <div className="relative flex items-start">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-admin-ucla-600 border-admin-slate-300 rounded focus:ring-admin-ucla-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-admin-slate-700 dark:text-admin-slate-300">
                    Enable Social Share Buttons
                  </label>
                  <p className="text-admin-slate-500 dark:text-admin-slate-400 mt-1">
                    Display social media sharing buttons on product pages
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
                <div className="ml-3 text-sm">
                  <label className="font-medium text-admin-slate-700 dark:text-admin-slate-300">
                    Enable Social Follow Buttons
                  </label>
                  <p className="text-admin-slate-500 dark:text-admin-slate-400 mt-1">
                    Display social media follow buttons in the footer
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

export default SocialSettingsPage;