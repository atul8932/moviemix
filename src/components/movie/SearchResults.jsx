import React, { useState, useEffect } from 'react';
import { movieAPI } from '../../utils/movieAPI';
import MovieCard from './MovieGrid/MovieCard';
import './SearchResults.css';

const SearchResults = ({ searchQuery, onRequestMovie, onTriggerWhatsApp, onCardClick }) => {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch search results when query changes
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      performSearch(searchQuery, 1);
    }
  }, [searchQuery]);

  const performSearch = async (query, page) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await movieAPI.searchMovies(query, page);
      setSearchResults(results);
      setCurrentPage(page);
      setTotalPages(results.total_pages);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      performSearch(searchQuery, newPage);
    }
  };

  const handleRequestMovie = (movie) => {
    if (onRequestMovie) {
      onRequestMovie(movie);
    }
  };

  const handleTriggerWhatsApp = (movieTitle) => {
    if (onTriggerWhatsApp) {
      onTriggerWhatsApp(movieTitle);
    }
  };

  const handleCardClick = (movie) => {
    if (onCardClick) {
      onCardClick(movie);
    }
  };

  if (!searchQuery || !searchQuery.trim()) {
    return null;
  }

  if (loading && !searchResults) {
    return (
      <div className="search-loading-container">
        <div className="loading-spinner"></div>
        <p>Searching for movies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-error">
        <p>{error}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => performSearch(searchQuery, currentPage)}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!searchResults || searchResults.results.length === 0) {
    return (
      <div className="search-no-results">
        <h3>No movies found</h3>
        <p>No movies found for "{searchQuery}". Try different keywords or check your spelling.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results-header">
        <h2>Search Results for "{searchQuery}"</h2>
        <p className="results-count">
          Found {searchResults.total_results} movies
          {totalPages > 1 && ` across ${totalPages} pages`}
        </p>
      </div>

      <div className="search-results-grid">
        {searchResults.results.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onRequestMovie={handleRequestMovie}
            onTriggerWhatsApp={handleTriggerWhatsApp}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="search-pagination">
          <button
            className="btn btn-secondary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            className="btn btn-secondary"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults; 