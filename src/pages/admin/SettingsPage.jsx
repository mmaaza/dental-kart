import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const SettingsPage = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  const tabs = [
    { name: 'Homepage', path: 'homepage' },
    { name: 'Attributes', path: 'attributes' },
    { name: 'SEO', path: 'seo' },
    { name: 'Social Media', path: 'social' },
    { name: 'Contact', path: 'contact' },
  ];

  return (
    <div className="min-h-screen">
      <div className="border-b border-admin-slate-200 dark:border-admin-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Settings">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${currentPath === tab.path
                  ? 'border-admin-ucla-500 text-admin-ucla-600 dark:border-admin-ucla-600 dark:text-admin-ucla-600'
                  : 'border-transparent text-admin-slate-500 hover:text-admin-slate-700 hover:border-admin-slate-300 dark:text-admin-slate-400 dark:hover:text-admin-slate-300'
                }
              `}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsPage;