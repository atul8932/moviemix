import React, { useState, useEffect } from 'react';
import { movieAPI } from '../../../utils/movieAPI';
import GenreDropdown from './GenreDropdown';

const SearchBar = ({ genres, onSearch, selectedGenres, searchKeyword, onSearchResults }) => {
  const [localKeyword, setLocalKeyword] = useState(searchKeyword || '');
  const [localGenres, setLocalGenres] = useState(selectedGenres || []);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  // Handle search submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!localKeyword.trim()) {
      // If no keyword, use genre-based discovery
      onSearch(localGenres, '');
      return;
    }

    setIsSearching(true);
    try {
      // Use the new searchMovies API
      const results = await movieAPI.searchMovies(localKeyword.trim());
      setSearchResults(results);
      
      // Call the parent callback with search results
      if (onSearchResults) {
        onSearchResults(results, localKeyword.trim());
      }
      
      // Also call the original onSearch for backward compatibility
      onSearch(localGenres, localKeyword.trim());
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to original search method
      onSearch(localGenres, localKeyword.trim());
    } finally {
      setIsSearching(false);
    }
  };

  // Handle genre changes
  const handleGenreChange = (genreId, isSelected) => {
    if (isSelected) {
      setLocalGenres([...localGenres, genreId]);
    } else {
      setLocalGenres(localGenres.filter(id => id !== genreId));
    }
  };

  // Clear search results when keyword changes
  useEffect(() => {
    if (!localKeyword.trim()) {
      setSearchResults(null);
    }
  }, [localKeyword]);

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-inputs">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search movies by title, actor, or keyword..."
            value={localKeyword}
            onChange={(e) => setLocalKeyword(e.target.value)}
            className="keyword-input"
            disabled={isSearching}
          />
          {isSearching && (
            <div className="search-loading">
              <span className="loading-spinner-small"></span>
            </div>
          )}
        </div>
        
        <GenreDropdown
          genres={genres}
          selectedGenres={localGenres}
          onGenreChange={handleGenreChange}
        />
      </div>
      
      <button type="submit" className="search-button" disabled={isSearching}>
        {isSearching ? 'Searching...' : 'Search Movies'}
      </button>

      {/* Search Results Summary */}
      {searchResults && (
        <div className="search-results-summary">
          <p>
            Found <strong>{searchResults.total_results}</strong> movies for "{localKeyword}"
            {searchResults.total_pages > 1 && ` across ${searchResults.total_pages} pages`}
          </p>
        </div>
      )}
    </form>
  );
};

export default SearchBar; 