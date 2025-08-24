import React, { useState } from 'react';
import MediaLibraryModal from './MediaLibraryModal';

const DocumentUploadButton = ({ onSelect, selectedDocument = null, className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDocumentSelect = (selectedItems) => {
    // Filter for only document files (Excel and Word)
    const documentItems = selectedItems.filter(item => {
      const fileName = item.name.toLowerCase();
      return fileName.endsWith('.xlsx') || 
             fileName.endsWith('.xls') || 
             fileName.endsWith('.docx') || 
             fileName.endsWith('.doc') ||
             item.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
             item.type === 'application/vnd.ms-excel' ||
             item.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
             item.type === 'application/msword';
    });
    
    // Take the first document if multiple are selected
    const selectedDocument = documentItems.length > 0 ? documentItems[0] : null;
    onSelect(selectedDocument);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center px-4 py-2.5 border border-admin-slate-300 dark:border-admin-slate-600 text-sm font-medium rounded-lg text-admin-slate-700 dark:text-admin-slate-200 bg-white dark:bg-admin-slate-800 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 ${className}`}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Select Document
      </button>

      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleDocumentSelect}
        maxSelect={1}
        currentSelections={selectedDocument ? [selectedDocument] : []}
        fileTypeFilter="documents"
      />
    </>
  );
};

export default DocumentUploadButton; 