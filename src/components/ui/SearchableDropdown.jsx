import React, { useState, useRef, useEffect } from 'react';

const SearchableDropdown = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option...',
  className = '',
  disabled = false,
  required = false,
  label = '',
  emptyMessage = 'No options available'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the selected option label
  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredOptions, highlightedIndex]);

  const handleOptionSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
      setHighlightedIndex(-1);
      // Focus the input after a short delay to ensure the dropdown is open
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-admin-slate-700 dark:text-admin-slate-300 mb-1.5">
          {label}
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-admin-slate-800 text-left text-sm
            ${disabled 
              ? 'border-admin-slate-200 dark:border-admin-slate-700 text-admin-slate-400 dark:text-admin-slate-500 cursor-not-allowed' 
              : 'border-admin-slate-200 dark:border-admin-slate-700 text-admin-slate-900 dark:text-admin-slate-100 hover:border-admin-ucla-500 focus:border-admin-ucla-500 focus:outline-none focus:ring-2 focus:ring-admin-ucla-500'
            }
            transition-colors
          `}
        >
          <span className={`block truncate ${!displayValue && !placeholder ? 'text-admin-slate-400 dark:text-admin-slate-500' : ''}`}>
            {displayValue || placeholder}
          </span>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg 
              className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-admin-slate-800 border border-admin-slate-200 dark:border-admin-slate-700 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-admin-slate-200 dark:border-admin-slate-700">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm border border-admin-slate-200 dark:border-admin-slate-700 rounded-md bg-white dark:bg-admin-slate-800 text-admin-slate-900 dark:text-admin-slate-100 focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500"
                autoComplete="off"
              />
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-admin-slate-500 dark:text-admin-slate-400 text-center">
                  {searchTerm ? 'No options match your search' : emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    className={`
                      w-full px-4 py-2 text-left text-sm hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700
                      ${highlightedIndex === index ? 'bg-admin-ucla-50 dark:bg-admin-ucla-900/20 text-admin-ucla-900 dark:text-admin-ucla-100' : 'text-admin-slate-900 dark:text-admin-slate-100'}
                      ${option.value === value ? 'bg-admin-ucla-100 dark:bg-admin-ucla-800 text-admin-ucla-900 dark:text-admin-ucla-100' : ''}
                      transition-colors
                    `}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableDropdown; 