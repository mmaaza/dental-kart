import { useState, useCallback } from 'react';

export const useMediaLibrary = (onSelect, maxSelect = 1) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openMediaLibrary = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeMediaLibrary = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSelect = useCallback((selectedMedia) => {
    onSelect(maxSelect === 1 ? selectedMedia[0] : selectedMedia);
  }, [onSelect, maxSelect]);

  return {
    isModalOpen,
    openMediaLibrary,
    closeMediaLibrary,
    handleSelect
  };
};