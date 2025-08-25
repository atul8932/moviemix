import React, { useState } from 'react';
import GenreDropdown from './GenreDropdown';

const SearchBar = ({ genres, onSearch, selectedGenres, searchKeyword }) => {
  const [localKeyword, setLocalKeyword] = useState(searchKeyword);
  const [localGenres, setLocalGenres] = useState(selectedGenres);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localGenres, localKeyword);
  };

  const handleGenreChange = (genreId, isSelected) => {
    if (isSelected) {
      setLocalGenres([...localGenres, genreId]);
    } else {
      setLocalGenres(localGenres.filter(id => id !== genreId));
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-inputs">
        <input
          type="text"
          placeholder="Search movies, actors, keywords..."
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          className="keyword-input"
        />
        
        <GenreDropdown
          genres={genres}
          selectedGenres={localGenres}
          onGenreChange={handleGenreChange}
        />
      </div>
      
      <button type="submit" className="search-button">
        Search Movies
      </button>
    </form>
  );
};

export default SearchBar; 