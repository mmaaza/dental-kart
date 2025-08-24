import React from 'react';

// A utility component to highlight parts of text matching a search term
const HighlightedText = ({ text, highlight, className }) => {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  
  return (
    <span className={className}>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? 
          <span key={i} className="bg-yellow-100">{part}</span> : 
          <span key={i}>{part}</span>
      )}
    </span>
  );
};

export default HighlightedText;
