import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Create page numbers array with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= 7) {
      // If 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first and last page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Show 1, 2, 3, 4, 5, ..., n
        pages.push(2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show 1, ..., n-4, n-3, n-2, n-1, n
        pages.push('...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Show 1, ..., currentPage-1, currentPage, currentPage+1, ..., n
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        <svg className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Prev
      </button>
      
      {pageNumbers.map((page, index) => (
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex items-center px-3 py-1 text-sm text-gray-700"
          >
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            disabled={page === currentPage}
            className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${
              page === currentPage
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }`}
      >
        Next
        <svg className="w-5 h-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
