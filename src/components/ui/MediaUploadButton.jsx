import React, { useState } from 'react';
import MediaLibraryModal from './MediaLibraryModal';

const MediaUploadButton = ({ onSelect, selectedMedia = [], maxSelect = 1, className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMediaSelect = (selectedItems) => {
    // The MediaLibraryModal now returns a single item when maxSelect = 1
    // and an array of items when maxSelect > 1, so we can directly pass it on
    onSelect(selectedItems);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center px-4 py-2.5 border border-admin-slate-300 dark:border-admin-slate-600 text-sm font-medium rounded-lg text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 ${className}`}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Select Media
      </button>

      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleMediaSelect}
        maxSelect={maxSelect}
        currentSelections={selectedMedia}
      />
    </>
  );
};

export default MediaUploadButton;