import React from 'react';
import MovieCard from './MovieCard';

const MovieGrid = ({ movies, onCardClick, onRequestMovie }) => {
  if (!movies || movies.length === 0) {
    return <div className="no-movies">No movies found</div>;
  }

  return (
    <div className="movie-grid">
      {movies.map(movie => (
        <MovieCard 
          key={movie.id} 
          movie={movie} 
          onCardClick={onCardClick}
          onRequestMovie={onRequestMovie}
        />
      ))}
    </div>
  );
};

export default MovieGrid; 