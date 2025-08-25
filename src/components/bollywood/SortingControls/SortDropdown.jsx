import React from 'react';

const SortingControls = ({ currentSort, onSortChange }) => {
  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' }
  ];

  return (
    <div className="sorting-controls">
      <label htmlFor="sort-select">Sort by:</label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="sort-dropdown"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortingControls; 