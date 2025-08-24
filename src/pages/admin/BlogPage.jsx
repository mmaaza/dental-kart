import React, { useState } from 'react';
import { useLoading } from '../../contexts/LoadingContext';

const BlogPage = () => {
  const { startLoading, stopLoading } = useLoading();
  const [posts, setPosts] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">
            Blog Management
          </h1>
          <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
            Create and manage your blog posts to keep your customers informed
          </p>
        </div>
        <div className="mt-4 sm:mt-0"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-admin-ucla-100 dark:bg-admin-ucla-900/30">
              <svg className="w-6 h-6 text-admin-ucla-600 dark:text-admin-ucla-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-admin-slate-900 dark:text-admin-slate-100">Total Posts</h3>
              <p className="mt-1 text-2xl font-bold text-admin-ucla-600 dark:text-admin-ucla-900">
                {posts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-admin-slate-900 dark:text-admin-slate-100">Published</h3>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                0
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-admin-slate-900 dark:text-admin-slate-100">Drafts</h3>
              <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                0
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-admin-cerulean-100 dark:bg-admin-cerulean-900/30">
              <svg className="w-6 h-6 text-admin-cerulean-600 dark:text-admin-cerulean-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-admin-slate-900 dark:text-admin-slate-100">Total Views</h3>
              <p className="mt-1 text-2xl font-bold text-admin-cerulean-600 dark:text-admin-cerulean-900">
                0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-admin-ucla-500 hover:bg-admin-ucla-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 dark:focus:ring-offset-admin-slate-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Post
        </button>
        
        <button className="inline-flex items-center px-4 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-md shadow-sm text-sm font-medium text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 dark:focus:ring-offset-admin-slate-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Categories
        </button>

        <button className="inline-flex items-center px-4 py-2 border border-admin-slate-300 dark:border-admin-slate-600 rounded-md shadow-sm text-sm font-medium text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 dark:focus:ring-offset-admin-slate-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Tags
        </button>
      </div>

      {/* No Posts State */}
      <div className="bg-white dark:bg-admin-slate-800 rounded-xl shadow-sm p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">No posts</h3>
          <p className="mt-1 text-sm text-admin-slate-500 dark:text-admin-slate-400">
            Get started by creating your first blog post
          </p>
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-admin-ucla-500 hover:bg-admin-ucla-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 dark:focus:ring-offset-admin-slate-800">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create your first post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;