import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const CategoryDropdown = ({ selectedCategories = [], onCategoriesChange, preloadedCategories = [], preloadedHierarchicalCategories = [], required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]);

  // Initialize with preloaded categories or use state categories
  useEffect(() => {
    if (preloadedCategories.length > 0) {
      setCategories(preloadedCategories);
    }
    
    if (preloadedHierarchicalCategories.length > 0) {
      console.log('Hierarchical Categories received:', preloadedHierarchicalCategories);
      setHierarchicalCategories(preloadedHierarchicalCategories);
    }
  }, [preloadedCategories, preloadedHierarchicalCategories]);

  // Log to check the structure whenever hierarchicalCategories changes to help debugging
  useEffect(() => {
    if (hierarchicalCategories.length > 0) {
      console.log('Hierarchical categories loaded with proper nesting structure:', 
        hierarchicalCategories.map(cat => ({
          id: cat._id,
          name: cat.name,
          level: cat.level,
          children: cat.children?.length || 0
        }))
      );
    }
  }, [hierarchicalCategories]);

  // Get display path for a category (including ancestors)
  const getDisplayPath = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    if (!category) return '';
    if (!category.ancestors || category.ancestors.length === 0) return category.name;
    
    // Get the names of all ancestors in the path
    const pathSegments = [];
    
    // Handle ancestors as array of objects or array of strings
    category.ancestors.forEach(ancestorId => {
      const ancestorObjectId = typeof ancestorId === 'object' ? ancestorId._id : ancestorId;
      const ancestor = categories.find(c => c._id === ancestorObjectId);
      if (ancestor) pathSegments.push(ancestor.name);
    });
    
    // Add the current category name
    pathSegments.push(category.name);
    return pathSegments.join(' → ');
  };

  // Function to check if any descendant of a category is selected
  const hasSelectedDescendant = (category) => {
    if (!category.children || category.children.length === 0) return false;
    
    return category.children.some(child => 
      selectedCategories.includes(child._id) || hasSelectedDescendant(child)
    );
  };
  
  // Function to get all descendant category IDs
  const getAllDescendantIds = (category) => {
    if (!category.children || category.children.length === 0) return [];
    
    const descendantIds = [];
    
    const collectIds = (cat) => {
      if (!cat.children) return;
      
      cat.children.forEach(child => {
        descendantIds.push(child._id);
        collectIds(child);
      });
    };
    
    collectIds(category);
    return descendantIds;
  };

  // Render the category tree with proper nesting
  const renderCategoryTree = (categories, level = 0) => {
    if (!categories || categories.length === 0) return [];

    return categories.flatMap(category => {
      // Check if this category or any of its children match the search query
      const matchesSearch = !searchQuery || 
        category.name.toLowerCase().includes(searchQuery.toLowerCase());

      let hasMatchingChildren = false;
      if (category.children && category.children.length > 0) {
        hasMatchingChildren = category.children.some(child => 
          !searchQuery || 
          child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          // Also check child's children recursively
          (child.children && child.children.some(grandchild => 
            !searchQuery || grandchild.name.toLowerCase().includes(searchQuery.toLowerCase())
          ))
        );
      }

      // Skip if neither this category nor its children match the search
      if (!matchesSearch && !hasMatchingChildren) return [];

      // Check if this category is selected
      const isSelected = selectedCategories.includes(category._id);
      // Check if any descendant is selected (for visual indication)
      const hasSelectedChild = hasSelectedDescendant(category);
      
      // Check if this category is indeterminate (some children selected, some not)
      const isIndeterminate = !isSelected && hasSelectedChild;
      
      const handleCategorySelect = (e) => {
        e.stopPropagation();

        if (isSelected) {
          // When deselecting a category, also deselect all its descendants
          const descendantIds = getAllDescendantIds(category);
          onCategoriesChange(selectedCategories.filter(id => 
            id !== category._id && !descendantIds.includes(id)
          ));
        } else {
          // When selecting a category, also select all its ancestors to maintain hierarchy
          const ancestors = [];
          
          if (category.ancestors && Array.isArray(category.ancestors)) {
            ancestors.push(...category.ancestors.map(a => typeof a === 'object' ? a._id : a));
          } else if (category.parentId) {
            let current = category;
            while (current && current.parentId) {
              const parentId = typeof current.parentId === 'object' 
                ? current.parentId._id 
                : current.parentId;
              ancestors.push(parentId);
              current = categories.find(c => c._id === parentId);
            }
          }
          
          // Do NOT auto-select descendant categories when selecting a parent
          onCategoriesChange([
            ...new Set([
              ...selectedCategories, 
              ...ancestors.filter(id => !selectedCategories.includes(id)),
              category._id
              // Removed the descendantIds to prevent auto-selecting children
            ])
          ]);
        }
      };

      const result = [];

      if (matchesSearch || !searchQuery) {
        result.push(
          <div 
            key={category._id} 
            className="relative py-1"
          >
            <div 
              className={`flex items-center hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700/50 transition-colors cursor-pointer py-1.5 
              ${isSelected ? 'bg-admin-slate-50 dark:bg-admin-slate-700/30' : ''}`}
              onClick={handleCategorySelect}
            >
              {/* Visual tree lines for hierarchy */}
              {category.level > 0 && (
                <div className="absolute w-6 border-t border-admin-slate-200 dark:border-admin-slate-700"
                  style={{ left: `${category.level * 16}px`, top: '15px', width: '12px' }}
                ></div>
              )}
              
              {category.level > 0 && (
                <div className="absolute h-full border-l border-admin-slate-200 dark:border-admin-slate-700"
                  style={{ left: `${category.level * 16}px`, top: '0' }}
                ></div>
              )}
              
              {/* Content with proper indentation based on category level */}
              <div className="flex items-center" style={{ paddingLeft: `${(category.level || level) * 28 + 12}px` }}>
                <div className="relative">
                  <input
                    id={`category-${category._id}`}
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by parent onClick
                    className="h-4 w-4 rounded border-admin-slate-300 dark:border-admin-slate-600 text-admin-ucla-600 focus:ring-admin-ucla-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {/* Show indeterminate state (some children selected) */}
                  {isIndeterminate && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-2 h-2 bg-admin-ucla-500 rounded-sm"></div>
                    </div>
                  )}
                </div>
                <label 
                  htmlFor={`category-${category._id}`} 
                  className={`ml-2 block text-sm ${isSelected ? 'font-medium text-admin-ucla-700 dark:text-admin-ucla-300' : 'text-admin-slate-700 dark:text-admin-slate-200'} ${hasSelectedChild && !isSelected ? 'italic' : ''}`}
                >
                  {category.name}
                </label>
                
                {/* Indicator for categories with children */}
                {category.children && category.children.length > 0 && (
                  <span className="ml-1 text-admin-slate-400 dark:text-admin-slate-500 text-xs">
                    ({category.children.length})
                  </span>
                )}
              </div>
            </div>

            {/* Recursively render children */}
            {category.children && category.children.length > 0 && 
              renderCategoryTree(category.children, level + 1)
            }
          </div>
        );
      } else if (category.children && category.children.length > 0) {
        // If this category doesn't match search but has matching children,
        // continue rendering those children
        result.push(...renderCategoryTree(category.children, level + 1));
      }

      return result;
    });
  };

  return (
    <div>
      {/* Selected categories display */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {/* Display leaf categories (those that are not parents of any other selected category) */}
          {selectedCategories
            .filter(catId => {
              // A category is a leaf if no other selected category has this as an ancestor
              const selectedCats = categories.filter(c => selectedCategories.includes(c._id));
              
              return !selectedCats.some(cat => {
                if (!cat.ancestors || !Array.isArray(cat.ancestors)) return false;
                
                return cat.ancestors.some(a => {
                  const ancestorId = typeof a === 'object' ? a._id : a;
                  return ancestorId === catId;
                });
              });
            })
            .map(catId => {
              const category = categories.find(c => c._id === catId);
              
              if (!category) return null;
              
              // Get the full path for tooltip
              const fullPath = getDisplayPath(catId);
                
              return (
                <span 
                  key={catId} 
                  className="inline-flex items-center px-2 py-1 rounded text-xs
                    bg-admin-slate-100 dark:bg-admin-slate-700
                    text-admin-slate-700 dark:text-admin-slate-300
                    border border-admin-slate-200 dark:border-admin-slate-600"
                  title={fullPath}
                >
                  {category.name}
                  <button
                    type="button"
                    className="ml-1 h-3.5 w-3.5 inline-flex items-center justify-center rounded-full 
                      text-admin-slate-500 dark:text-admin-slate-400
                      hover:bg-admin-slate-200 dark:hover:bg-admin-slate-600
                      hover:text-admin-slate-700 dark:hover:text-admin-slate-300 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategoriesChange(selectedCategories.filter(id => id !== catId));
                    }}
                  >
                    <span className="sr-only">Remove {category.name}</span>
                    <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })
          }
        </div>
      )}

      {/* Custom dropdown */}
      <div className="relative">
        <div className={`w-full relative ${isOpen ? 'mb-1' : ''}`}>
          <div 
            className={`
              w-full flex items-center px-3 py-2 rounded-md
              border border-admin-slate-300 dark:border-admin-slate-600
              bg-white dark:bg-admin-slate-800 
              text-admin-slate-700 dark:text-admin-slate-300
              text-sm cursor-pointer
              ${isOpen ? 'ring-2 ring-admin-ucla-500 border-admin-ucla-500' : 'hover:border-admin-slate-400'}
            `}
            onClick={() => {
              setIsOpen(!isOpen);
              setSearchQuery('');
            }}
          >
            <span className="grow truncate">
              {selectedCategories.length === 0 ? (
                <span className="text-admin-slate-500 dark:text-admin-slate-400">
                  Select categories
                </span>
              ) : (
                <span>
                  {selectedCategories.length === 1 
                    ? `${selectedCategories.length} category selected` 
                    : `${selectedCategories.length} categories selected`}
                </span>
              )}
            </span>
            <svg 
              className={`h-4 w-4 text-admin-slate-400 dark:text-admin-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Dropdown menu */}
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-admin-slate-800 rounded-lg shadow-lg border border-admin-slate-200 dark:border-admin-slate-700 overflow-hidden">
              {/* Search input */}
              <div className="sticky top-0 z-20 p-2 border-b border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-slate-400 dark:text-admin-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-900/50 text-admin-slate-900 dark:text-admin-slate-100 text-sm focus:ring-2 focus:ring-admin-ucla-500 focus:border-admin-ucla-500 transition-colors"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-slate-400 hover:text-admin-slate-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                      }}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Options list */}
              <div className="overflow-y-auto max-h-64 py-1">
                {(() => {
                  // Start rendering from the root hierarchical categories
                  const categoryElements = renderCategoryTree(hierarchicalCategories);
                  
                  // No categories at all
                  if (hierarchicalCategories.length === 0) {
                    return (
                      <div className="text-center py-6 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                        <svg className="mx-auto h-8 w-8 text-admin-slate-300 dark:text-admin-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="mt-2">No categories available</p>
                      </div>
                    );
                  }
                  
                  // Show a message if no categories match the search
                  if (searchQuery && categoryElements.length === 0) {
                    return (
                      <div className="text-center py-6 text-sm text-admin-slate-500 dark:text-admin-slate-400">
                        <svg className="mx-auto h-8 w-8 text-admin-slate-300 dark:text-admin-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="mt-2">No matching categories found</p>
                        <button 
                          className="mt-1 text-admin-ucla-500 hover:text-admin-ucla-700 text-xs underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchQuery('');
                          }}
                        >
                          Clear search
                        </button>
                      </div>
                    );
                  }
                  
                  return categoryElements;
                })()}
              </div>
              
              {/* Action buttons */}
              <div className="sticky bottom-0 z-20 p-2 border-t border-admin-slate-200 dark:border-admin-slate-700 bg-white dark:bg-admin-slate-800 flex justify-between">
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 text-admin-slate-600 dark:text-admin-slate-400 hover:text-admin-slate-800 dark:hover:text-admin-slate-200 bg-admin-slate-100 dark:bg-admin-slate-700 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategoriesChange([]);
                  }}
                >
                  Clear all
                </button>
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 bg-admin-ucla-500 text-white rounded hover:bg-admin-ucla-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-1.5 text-xs text-admin-slate-500 dark:text-admin-slate-400">
        Select all applicable categories for this product
      </p>
      {required && selectedCategories.length === 0 && (
        <p className="mt-1 text-xs text-red-500">
          Please select at least one category
        </p>
      )}
    </div>
  );
};

CategoryDropdown.propTypes = {
  selectedCategories: PropTypes.array,
  onCategoriesChange: PropTypes.func.isRequired,
  preloadedCategories: PropTypes.array,
  preloadedHierarchicalCategories: PropTypes.array,
  required: PropTypes.bool
};

export default CategoryDropdown;
