import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {/* Header Skeleton */}
    <div className="flex justify-between items-center mb-4">
      <div className="h-6 w-32 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
      <div className="flex items-center space-x-2">
        <div className="h-10 w-32 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
        <div className="h-10 w-24 bg-admin-slate-200 dark:bg-admin-slate-700 rounded"></div>
      </div>
    </div>

    {/* Grid Skeleton */}
    <div className="border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg p-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-admin-slate-200 dark:bg-admin-slate-700 animate-pulse"></div>
        ))}
      </div>
    </div>
  </div>
);

const MediaLibraryModal = ({ isOpen, onClose, onSelect, maxSelect = 1, currentSelections = [], fileTypeFilter = null }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [view, setView] = useState("grid");
  const [selectedResizeOption, setSelectedResizeOption] = useState("original");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const resizeOptions = [
    { value: "original", label: "Original Size" },
    { value: "product", label: "Product Photo (800x800)" },
    { value: "thumbnail", label: "Thumbnail (300x300)" }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchMediaItems();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (isOpen) {
      // Initialize selected items based on the current context
      if (Array.isArray(currentSelections)) {
        setSelectedItems(currentSelections);
      } else if (currentSelections) {
        // Handle single item that's not in an array
        setSelectedItems([currentSelections]);
      } else {
        setSelectedItems([]);
      }
    }
  }, [isOpen, currentSelections]);

  const fetchMediaItems = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/media", { timeout: 10000 });
      if (response.data && response.data.media) {
        setMediaItems(response.data.media);
      } else {
        // Handle unexpected response format
        console.error("Unexpected API response format:", response.data);
        setMediaItems([]);
      }
    } catch (error) {
      console.error("Error fetching media items:", error);
      // Initialize with empty array on error
      setMediaItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });
    formData.append("resize", selectedResizeOption);

    try {
      const response = await api.post("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      // Fetch media items only after successful upload
      try {
        const mediaResponse = await api.get("/media", { timeout: 10000 });
        if (mediaResponse.data && mediaResponse.data.media) {
          setMediaItems(mediaResponse.data.media);
        }
      } catch (mediaError) {
        console.error("Error fetching media after upload:", mediaError);
      }
      
      setIsUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error uploading files:", error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleItemClick = (item) => {
    if (maxSelect === 1) {
      setSelectedItems([item]);
      // For single selection, we'll now pass the item in an array for consistency
      onSelect([item]);
      onClose();
    } else {
      setSelectedItems(prev => {
        const isSelected = prev.some(i => i._id === item._id);
        if (isSelected) {
          return prev.filter(i => i._id !== item._id);
        }
        if (prev.length < maxSelect) {
          return [...prev, item];
        }
        return prev;
      });
    }
  };

  const handleConfirmSelection = () => {
    // For multiple selection, pass the array
    onSelect(selectedItems);
    onClose();
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[1200] flex items-center justify-center">
        <div className="fixed inset-0 z-[1190] bg-admin-slate-500 opacity-75"></div>
        <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-xl flex flex-col max-h-[90vh] w-full max-w-3xl z-[1200]">
          <div className="bg-white dark:bg-admin-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-1 flex flex-col justify-center">
            <LoadingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center">
      <div className="fixed inset-0 z-[1190] bg-admin-slate-500 opacity-75" onClick={onClose}></div>
      <div className="bg-white dark:bg-admin-slate-800 rounded-lg shadow-xl flex flex-col max-h-[90vh] w-full max-w-3xl z-[1200]">
        {/* Fixed Header */}
        <div className="flex justify-between items-center px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-4 flex-shrink-0 border-b border-admin-slate-200 dark:border-admin-slate-700">
          <h3 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100">Media Library</h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedResizeOption}
              onChange={(e) => setSelectedResizeOption(e.target.value)}
              className="block px-3 py-2 text-sm border border-admin-slate-200 dark:border-admin-slate-700 rounded-md bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 focus:ring-admin-ucla-500 focus:border-admin-ucla-500"
            >
              {resizeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="px-4 py-2 bg-admin-ucla-500 text-white rounded-md hover:bg-admin-ucla-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 dark:focus:ring-offset-admin-slate-800 transition-colors duration-200"
            >
              {isUploading ? `Uploading ${uploadProgress}%` : fileTypeFilter === 'documents' ? "Upload Document" : "Upload New"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              multiple
              accept={fileTypeFilter === 'documents' ? '.xlsx,.xls,.docx,.doc' : undefined}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg p-4">
            {fileTypeFilter === 'documents' && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Showing only Excel and Word documents
                </p>
              </div>
            )}
            <div className={view === "grid" 
              ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 place-items-stretch"
              : "space-y-2"
            }>
              {mediaItems
                .filter(item => {
                  if (fileTypeFilter === 'documents') {
                    const fileName = item.name.toLowerCase();
                    return fileName.endsWith('.xlsx') || 
                           fileName.endsWith('.xls') || 
                           fileName.endsWith('.docx') || 
                           fileName.endsWith('.doc') ||
                           item.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                           item.type === 'application/vnd.ms-excel' ||
                           item.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                           item.type === 'application/msword';
                  }
                  return true;
                })
                .map(item => (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className={`
                    ${view === "grid" 
                      ? "relative group aspect-square overflow-hidden rounded-lg border cursor-pointer"
                      : "flex items-center space-x-4 p-4 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 rounded-lg cursor-pointer"}
                    ${selectedItems.some(i => i._id === item._id) 
                      ? "border-admin-ucla-500 ring-2 ring-admin-ucla-500" 
                      : "border-admin-slate-200 dark:border-admin-slate-700"}
                  `}
                >
                  <div className={view === "grid" ? "h-full w-full" : "flex-shrink-0 h-16 w-16"}>
                    {item.type.startsWith("image/") && (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                    {item.type.startsWith("video/") && (
                      <video
                        src={item.url}
                        className="h-full w-full object-cover"
                      />
                    )}
                    {!item.type.startsWith("image/") && !item.type.startsWith("video/") && (
                      <div className="h-full w-full flex items-center justify-center bg-admin-slate-100 dark:bg-admin-slate-700">
                        <svg
                          className="h-8 w-8 text-admin-slate-400 dark:text-admin-slate-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {view === "grid" && (
                    <div className="absolute inset-0 bg-admin-slate-900 bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-1.5">
                        <p className="text-white text-xs truncate">{item.name}</p>
                      </div>
                    </div>
                  )}

                  {view === "list" && (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">{item.name}</p>
                      <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="bg-admin-slate-50 dark:bg-admin-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-admin-slate-200 dark:border-admin-slate-700 flex-shrink-0">
          {maxSelect > 1 && (
            <button
              type="button"
              onClick={handleConfirmSelection}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-admin-ucla-500 text-base font-medium text-white hover:bg-admin-ucla-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 dark:focus:ring-offset-admin-slate-800 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
            >
              Select {selectedItems.length} items
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-admin-slate-300 dark:border-admin-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-admin-slate-700 text-base font-medium text-admin-slate-700 dark:text-admin-slate-300 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-ucla-500 dark:focus:ring-offset-admin-slate-800 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaLibraryModal;