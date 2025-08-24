import React from 'react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5;
  
  const getVisiblePages = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="pagination-controls">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button prev"
      >
        ← Previous
      </button>
      
      <div className="page-numbers">
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`pagination-button page ${page === currentPage ? 'active' : ''}`}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button next"
      >
        Next →
      </button>
      
      <div className="page-info">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default PaginationControls; 