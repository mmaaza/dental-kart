import React, { useState } from 'react';
import { useSearch } from '../../contexts/SearchContext';

const SearchFilters = ({ onFilterChange }) => {
  const { searchCategories, totalResults } = useSearch();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto pb-1">
          <button
            className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium ${
              selectedFilter === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => handleFilterChange('all')}
          >
            All Results <span className="ml-1 text-gray-400">({totalResults || 0})</span>
          </button>
          
          {Object.entries(searchCategories).map(([key, label]) => (
            <button
              key={key}
              className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium ${
                selectedFilter === key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => handleFilterChange(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SearchFilters;
