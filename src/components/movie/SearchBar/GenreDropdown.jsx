import React, { useState, useRef, useEffect } from 'react';

const GenreDropdown = ({ genres, selectedGenres, onGenreChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleGenreToggle = (genreId) => {
    const isSelected = selectedGenres.includes(genreId);
    onGenreChange(genreId, !isSelected);
  };

  const getSelectedGenreNames = () => {
    if (selectedGenres.length === 0) return 'Select Genres';
    if (selectedGenres.length === 1) {
      const genre = genres.find(g => g.id === selectedGenres[0]);
      return genre ? genre.name : 'Select Genres';
    }
    return `${selectedGenres.length} genres selected`;
  };

  return (
    <div className="genre-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="genre-dropdown-button"
        onClick={toggleDropdown}
      >
        {getSelectedGenreNames()}
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {isOpen && (
        <div className="genre-dropdown-menu">
          {genres.map(genre => (
            <label key={genre.id} className="genre-option">
              <input
                type="checkbox"
                className="genre-checkbox"
                checked={selectedGenres.includes(genre.id)}
                onChange={() => handleGenreToggle(genre.id)}
              />
              <span className="genre-name">{genre.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenreDropdown; 