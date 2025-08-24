import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load reviews based on current filters
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const sortMap = {
          newest: '-createdAt',
          oldest: 'createdAt',
          ratingHigh: '-rating',
          ratingLow: 'rating'
        };

        const params = {
          page: currentPage,
          limit: 10,
          sort: sortMap[sort] || '-createdAt'
        };

        // Add status filter if not "all"
        if (filter !== 'all') {
          params.status = filter;
        }

        // Add flagged filter
        if (filter === 'flagged') {
          params.flagged = true;
          delete params.status;
        }

        // Add search query if present
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const response = await api.get('/admin/reviews', { params });
        setReviews(response.data.data);
        setTotalPages(response.data.pagination.pages);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentPage, filter, sort, searchQuery]);

  // Handle search input debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeoutId = setTimeout(() => {
      setSearchQuery(value);
      setCurrentPage(1); // Reset to first page for new search
    }, 500);
    
    setSearchTimeout(timeoutId);
  };

  // Handle review status update
  const handleStatusUpdate = async (reviewId, newStatus) => {
    try {
      await api.patch(`/admin/reviews/${reviewId}/status`, { status: newStatus });
      
      // Update the review in the current state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId 
            ? { ...review, status: newStatus, flaggedForReview: newStatus === 'approved' ? false : review.flaggedForReview } 
            : review
        )
      );
      
      toast.success(`Review ${newStatus === 'approved' ? 'approved' : newStatus === 'rejected' ? 'rejected' : 'set to pending'}`);
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Failed to update review status');
    }
  };

  // Handle review deletion
  const confirmDeleteReview = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteConfirm(true);
  };

  const deleteReview = async () => {
    if (!reviewToDelete) return;
    
    try {
      await api.delete(`/reviews/${reviewToDelete}`);
      
      // Remove the review from the list
      setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewToDelete));
      
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setShowDeleteConfirm(false);
      setReviewToDelete(null);
    }
  };

  // Rating Stars Component
  const RatingStars = ({ rating }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-4 h-4 ${i < Math.round(rating) ? 'text-accent-500' : 'text-admin-slate-600'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    let bgColor, textColor, text;
    
    switch(status) {
      case 'approved':
        bgColor = 'bg-green-900/30';
        textColor = 'text-green-400';
        text = 'Approved';
        break;
      case 'rejected':
        bgColor = 'bg-red-900/30';
        textColor = 'text-red-400';
        text = 'Rejected';
        break;
      case 'pending':
        bgColor = 'bg-amber-900/30';
        textColor = 'text-amber-400';
        text = 'Pending';
        break;
      default:
        bgColor = 'bg-admin-slate-700';
        textColor = 'text-admin-slate-300';
        text = status;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">
            Reviews Management
          </h1>
          <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
            Moderate and manage customer product reviews
          </p>
        </div>
        <div className="mt-4 sm:mt-0"></div>
      </div>
      
      {/* New Filter Bar Design */}
      <div className="bg-white dark:bg-admin-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-admin-slate-700">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => { setFilter('all'); setCurrentPage(1); }}
              className={`inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                filter === 'all'
                  ? 'border-admin-ucla-500 text-admin-ucla-500 dark:text-admin-ucla-400'
                  : 'border-transparent text-admin-slate-500 hover:text-admin-slate-700 hover:border-admin-slate-300 dark:text-admin-slate-400 dark:hover:text-white dark:hover:border-admin-slate-700'
              } transition-colors duration-200`}
            >
              All Reviews
            </button>
            <button 
              onClick={() => { setFilter('pending'); setCurrentPage(1); }}
              className={`inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                filter === 'pending'
                  ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                  : 'border-transparent text-admin-slate-500 hover:text-admin-slate-700 hover:border-admin-slate-300 dark:text-admin-slate-400 dark:hover:text-white dark:hover:border-admin-slate-700'
              } transition-colors duration-200`}
            >
              <svg className={`w-4 h-4 ${filter === 'pending' ? 'text-amber-500 dark:text-amber-400' : 'text-amber-400 dark:text-amber-500/70'} mr-1.5`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Pending
              {filter !== 'all' && filter !== 'pending' ? null : (
                <span className="ml-1.5 py-0.5 px-1.5 text-xs rounded-full bg-amber-500/20 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
                  {reviews.filter(r => r.status === 'pending').length || 0}
                </span>
              )}
            </button>
            <button 
              onClick={() => { setFilter('approved'); setCurrentPage(1); }}
              className={`inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                filter === 'approved'
                  ? 'border-green-500 text-green-500 dark:text-green-400'
                  : 'border-transparent text-admin-slate-500 hover:text-admin-slate-700 hover:border-admin-slate-300 dark:text-admin-slate-400 dark:hover:text-white dark:hover:border-admin-slate-700'
              } transition-colors duration-200`}
            >
              <svg className={`w-4 h-4 ${filter === 'approved' ? 'text-green-500 dark:text-green-400' : 'text-green-400 dark:text-green-500/70'} mr-1.5`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Approved
              {filter !== 'all' && filter !== 'approved' ? null : (
                <span className="ml-1.5 py-0.5 px-1.5 text-xs rounded-full bg-green-500/20 text-green-600 dark:bg-green-900/30 dark:text-green-500">
                  {reviews.filter(r => r.status === 'approved').length || 0}
                </span>
              )}
            </button>
            <button 
              onClick={() => { setFilter('rejected'); setCurrentPage(1); }}
              className={`inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                filter === 'rejected'
                  ? 'border-red-500 text-red-500 dark:text-red-400'
                  : 'border-transparent text-admin-slate-500 hover:text-admin-slate-700 hover:border-admin-slate-300 dark:text-admin-slate-400 dark:hover:text-white dark:hover:border-admin-slate-700'
              } transition-colors duration-200`}
            >
              <svg className={`w-4 h-4 ${filter === 'rejected' ? 'text-red-500 dark:text-red-400' : 'text-red-400 dark:text-red-500/70'} mr-1.5`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Rejected
              {filter !== 'all' && filter !== 'rejected' ? null : (
                <span className="ml-1.5 py-0.5 px-1.5 text-xs rounded-full bg-red-500/20 text-red-600 dark:bg-red-900/30 dark:text-red-500">
                  {reviews.filter(r => r.status === 'rejected').length || 0}
                </span>
              )}
            </button>
            <button 
              onClick={() => { setFilter('flagged'); setCurrentPage(1); }}
              className={`inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                filter === 'flagged'
                  ? 'border-red-500 text-red-500 dark:text-red-400'
                  : 'border-transparent text-admin-slate-500 hover:text-admin-slate-700 hover:border-admin-slate-300 dark:text-admin-slate-400 dark:hover:text-white dark:hover:border-admin-slate-700'
              } transition-colors duration-200`}
            >
              <svg className={`w-4 h-4 ${filter === 'flagged' ? 'text-red-500 dark:text-red-400' : 'text-red-400 dark:text-red-500/70'} mr-1.5`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
              </svg>
              Flagged
              {filter !== 'all' && filter !== 'flagged' ? null : (
                <span className="ml-1.5 py-0.5 px-1.5 text-xs rounded-full bg-red-500/20 text-red-600 dark:bg-red-900/30 dark:text-red-500">
                  {reviews.filter(r => r.flaggedForReview).length || 0}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="p-3 bg-admin-slate-900/30 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-admin-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by product, user, or review text..."
              onChange={handleSearchChange}
              className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-admin-slate-900 dark:text-admin-slate-100 bg-white dark:bg-admin-slate-700 ring-1 ring-inset ring-admin-slate-300 dark:ring-admin-slate-600 placeholder:text-admin-slate-400 focus:ring-2 focus:ring-inset focus:ring-admin-ucla-500 text-sm leading-6"
            />
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex gap-2 items-center">
            <label htmlFor="sort-select" className="text-xs font-medium text-admin-slate-400 whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
              className="rounded-md border-0 py-1.5 pl-3 pr-8 text-admin-slate-900 dark:text-admin-slate-100 bg-white dark:bg-admin-slate-700 ring-1 ring-inset ring-admin-slate-300 dark:ring-admin-slate-600 focus:ring-2 focus:ring-inset focus:ring-admin-ucla-500 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="ratingHigh">Highest Rating</option>
              <option value="ratingLow">Lowest Rating</option>
            </select>
          </div>
          
          {/* Reset Filters */}
          {(filter !== 'all' || searchQuery) && (
            <button 
              onClick={() => { setFilter('all'); setSearchQuery(''); setCurrentPage(1); }}
              className="inline-flex items-center py-1.5 px-2.5 rounded-md text-xs font-medium bg-admin-slate-800 text-admin-slate-400 hover:text-white transition-colors duration-200"
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Clear filters
            </button>
          )}
        </div>
        
        {/* Active Filter Tags */}
        {(filter !== 'all' || searchQuery) && (
          <div className="px-4 py-2.5">
            <div className="flex flex-wrap gap-2 items-center text-xs text-admin-slate-400 leading-none">
              <span className="font-medium">Active filters:</span>
              {filter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-admin-slate-700/50 text-admin-slate-300 gap-1.5">
                  <span>Status: <span className="font-medium">{filter.charAt(0).toUpperCase() + filter.slice(1)}</span></span>
                  <button 
                    onClick={() => { setFilter('all'); setCurrentPage(1); }}
                    className="hover:text-white"
                    title="Remove filter"
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-admin-slate-700/50 text-admin-slate-300 gap-1.5">
                  <span>Search: <span className="font-medium">"{searchQuery}"</span></span>
                  <button 
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                    className="hover:text-white"
                    title="Remove search"
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Reviews Table */}
      <div className="bg-white dark:bg-admin-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-slate-700">
              <thead className="bg-admin-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-admin-slate-400 uppercase tracking-wider">
                    Product & User
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-admin-slate-400 uppercase tracking-wider">
                    Review
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-admin-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-admin-slate-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium text-admin-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-slate-700">
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 w-32 bg-admin-slate-700 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-24 bg-admin-slate-700 rounded animate-pulse"></div>
                      <div className="h-3 w-20 bg-admin-slate-700 rounded animate-pulse mt-2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-36 bg-admin-slate-700 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-full max-w-xs bg-admin-slate-700 rounded animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-admin-slate-700 rounded animate-pulse mt-1"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 w-20 bg-admin-slate-700 rounded-full animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-20 bg-admin-slate-700 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-16 bg-admin-slate-700 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex space-x-2">
                        <div className="h-4 w-16 bg-admin-slate-700 rounded animate-pulse"></div>
                        <div className="h-4 w-12 bg-admin-slate-700 rounded animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reviews.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <svg className="mx-auto h-12 w-12 text-admin-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-sm text-admin-slate-400">
              {searchQuery ? 'No reviews match your search criteria' : 'No reviews found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-admin-slate-700">
              <thead className="bg-admin-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-admin-slate-400 uppercase tracking-wider">
                    Product & User
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-admin-slate-400 uppercase tracking-wider">
                    Review
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-admin-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-admin-slate-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium text-admin-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-slate-700">
                {reviews.map(review => (
                  <tr key={review._id} className={review.flaggedForReview ? 'bg-red-900/10' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-admin-slate-100">
                        {review.product?.name || 'Unknown Product'}
                      </div>
                      <div className="text-sm text-admin-slate-400">
                        by {review.user?.name || 'Anonymous'}
                      </div>
                      <div className="text-xs text-admin-slate-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-admin-slate-100 font-medium">
                        {review.title || 'No Title'}
                      </div>
                      <div className="text-sm text-admin-slate-400 line-clamp-2">
                        {review.comment}
                      </div>
                      {review.flaggedForReview && (
                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Flagged by users ({review.reported?.length || 0})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={review.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RatingStars rating={review.rating} />
                      <div className="text-xs text-admin-slate-500 mt-1">
                        {review.helpfulCount || 0} found helpful
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="inline-flex space-x-2">
                        {review.status !== 'approved' && (
                          <button 
                            onClick={() => handleStatusUpdate(review._id, 'approved')}
                            className="text-green-400 hover:text-green-300 transition duration-200"
                          >
                            Approve
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button 
                            onClick={() => handleStatusUpdate(review._id, 'rejected')}
                            className="text-red-400 hover:text-red-300 transition duration-200"
                          >
                            Reject
                          </button>
                        )}
                        <button 
                          onClick={() => confirmDeleteReview(review._id)}
                          className="text-admin-slate-400 hover:text-admin-slate-300 transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="bg-white dark:bg-admin-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'text-admin-slate-400 bg-admin-slate-800/50 cursor-not-allowed'
                  : 'text-admin-slate-100 bg-admin-slate-700 hover:bg-admin-slate-600'
              } transition duration-200`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'text-admin-slate-400 bg-admin-slate-800/50 cursor-not-allowed'
                  : 'text-admin-slate-100 bg-admin-slate-700 hover:bg-admin-slate-600'
              } transition duration-200`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-admin-slate-400">
                Showing page <span className="font-medium text-admin-slate-100">{currentPage}</span> of{' '}
                <span className="font-medium text-admin-slate-100">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-admin-slate-600 bg-admin-slate-800 text-sm font-medium ${
                    currentPage === 1
                      ? 'text-admin-slate-500 cursor-not-allowed'
                      : 'text-admin-slate-300 hover:bg-admin-slate-700'
                  } transition duration-200`}
                >
                  <span className="sr-only">First</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-admin-slate-600 bg-admin-slate-800 text-sm font-medium ${
                    currentPage === 1
                      ? 'text-admin-slate-500 cursor-not-allowed'
                      : 'text-admin-slate-300 hover:bg-admin-slate-700'
                  } transition duration-200`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Page numbers - dynamic based on total pages */}
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  // Calculate page numbers to show centered around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  // Only show if pageNum is valid
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-admin-ucla-500 border-admin-ucla-600 text-white'
                            : 'bg-admin-slate-800 border-admin-slate-600 text-admin-slate-300 hover:bg-admin-slate-700'
                        } transition duration-200`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-admin-slate-600 bg-admin-slate-800 text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-admin-slate-500 cursor-not-allowed'
                      : 'text-admin-slate-300 hover:bg-admin-slate-700'
                  } transition duration-200`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-admin-slate-600 bg-admin-slate-800 text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-admin-slate-500 cursor-not-allowed'
                      : 'text-admin-slate-300 hover:bg-admin-slate-700'
                  } transition duration-200`}
                >
                  <span className="sr-only">Last</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-admin-slate-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-admin-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-admin-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-admin-slate-100" id="modal-title">
                      Delete Review
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-admin-slate-400">
                        Are you sure you want to delete this review? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-admin-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  onClick={deleteReview}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition duration-200"
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-admin-slate-600 shadow-sm px-4 py-2 bg-admin-slate-800 text-base font-medium text-admin-slate-100 hover:bg-admin-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 sm:mt-0 sm:w-auto sm:text-sm transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;