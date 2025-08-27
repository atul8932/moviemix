import React from 'react';

const MovieCard = ({ movie, onCardClick }) => {
  const {
    id,
    title,
    poster_path,
    release_date,
    vote_average,
    overview,
    genre_names
  } = movie;

  const posterUrl = poster_path 
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : '/placeholder-poster.jpg';

  const formatDate = (dateString) => {
    if (!dateString) return 'Release date unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateOverview = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(movie);
    }
  };

  return (
    <div className="movie-card" data-movie-id={id} onClick={handleCardClick}>
      <div className="movie-poster">
        <img 
          src={posterUrl} 
          alt={`${title} poster`}
          loading="lazy"
        />
        <div className="movie-rating">
          ⭐ {vote_average.toFixed(1)}
        </div>
      </div>
      
      <div className="movie-info">
        <h3 className="movie-title">{title}</h3>
        <p className="movie-release-date">
          {formatDate(release_date)}
        </p>
        {genre_names && genre_names.length > 0 && (
          <div className="movie-genres">
            {genre_names.map((genre, index) => (
              <span key={index} className="genre-tag">
                {genre}
              </span>
            ))}
          </div>
        )}
        <p className="movie-overview">
          {truncateOverview(overview)}
        </p>
      </div>
    </div>
  );
};

export default MovieCard; 