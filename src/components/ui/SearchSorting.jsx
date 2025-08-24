import React, { useState } from 'react';

const SearchSorting = ({ onSortChange }) => {
  const [sortOption, setSortOption] = useState('relevance');
  
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
  ];
  
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };
  
  return (
    <div className="flex items-center justify-end mb-4">
      <label htmlFor="sort-by" className="mr-2 text-sm text-gray-600">
        Sort by:
      </label>
      <div className="relative">
        <select
          id="sort-by"
          value={sortOption}
          onChange={handleSortChange}
          className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-8 py-1.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SearchSorting;
