import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext';

const RelatedSearches = ({ query, maxSuggestions = 5 }) => {
  const { searchResults } = useSearch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Create related searches based on product names, tags, and categories
  const getRelatedTerms = () => {
    if (!query || !searchResults.length) return [];
    
    const relatedTerms = new Set();
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    // Helper to add a term to the set if it's different enough from the query
    const addIfRelevant = (term) => {
      const termLower = term.toLowerCase();
      // Skip terms that are too similar to the query
      if (termLower === query.toLowerCase()) return;
      if (queryWords.includes(termLower)) return;
      
      // Skip terms that are too short
      if (term.length < 3) return;
      
      relatedTerms.add(term);
    };
    
    // Extract words from product names
    searchResults.forEach(result => {
      // Add product name terms
      if (result.name) {
        const nameWords = result.name.split(/\s+/).filter(word => word.length > 3);
        nameWords.forEach(addIfRelevant);
      }
      
      // Add tags
      if (result.tags && Array.isArray(result.tags)) {
        result.tags.forEach(addIfRelevant);
      }
      
      // Add category name
      if (result.categoryName) {
        addIfRelevant(result.categoryName);
      }
      
      // Add brand name
      if (result.brand && result.brand.name) {
        addIfRelevant(result.brand.name);
      }
    });
    
    // Convert set to array and limit
    return Array.from(relatedTerms).slice(0, maxSuggestions);
  };
  
  const relatedTerms = getRelatedTerms();
  
  if (relatedTerms.length === 0) {
    return null;
  }
  
  const handleRelatedSearch = (term) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('q', term);
    newParams.delete('page'); // Reset to page 1
    navigate(`/search?${newParams.toString()}`);
  };
  
  return (
    <div className="mt-8 mb-4 border-t pt-6">
      <h3 className="text-lg font-medium text-gray-700 mb-3">Related Searches</h3>
      <div className="flex flex-wrap gap-2">
        {relatedTerms.map((term, index) => (
          <button
            key={index}
            onClick={() => handleRelatedSearch(term)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RelatedSearches;
