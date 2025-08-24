import React from 'react';

const MovieModal = ({ movie, isOpen, onClose }) => {
  if (!isOpen || !movie) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Release date unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'Runtime unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="movie-modal-overlay" onClick={handleBackdropClick}>
      <div className="movie-modal">
        <div className="movie-modal-header">
          <h2 className="movie-modal-title">{movie.title}</h2>
          <button className="movie-modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>
        
        <div className="movie-modal-content">
          <div className="movie-modal-poster">
            <img 
              src={movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : '/placeholder-poster.jpg'
              }
              alt={`${movie.title} poster`}
            />
            {movie.vote_average && (
              <div className="movie-modal-rating">
                ⭐ {movie.vote_average.toFixed(1)}
                <span className="rating-count">({movie.vote_count} votes)</span>
              </div>
            )}
          </div>
          
          <div className="movie-modal-details">
            <div className="movie-modal-info">
              {/* Basic Info */}
              <div className="info-section">
                <h3>Movie Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Title:</span>
                    <span className="info-value">{movie.title}</span>
                  </div>
                  {movie.original_title && movie.original_title !== movie.title && (
                    <div className="info-item">
                      <span className="info-label">Original Title:</span>
                      <span className="info-value">{movie.original_title}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="info-label">Release Date:</span>
                    <span className="info-value">{formatDate(movie.release_date)}</span>
                  </div>
                  {movie.runtime && (
                    <div className="info-item">
                      <span className="info-label">Runtime:</span>
                      <span className="info-value">{formatRuntime(movie.runtime)}</span>
                    </div>
                  )}
                  {movie.original_language && (
                    <div className="info-item">
                      <span className="info-label">Language:</span>
                      <span className="info-value">{movie.original_language.toUpperCase()}</span>
                    </div>
                  )}
                  {movie.adult !== undefined && (
                    <div className="info-item">
                      <span className="info-label">Content Rating:</span>
                      <span className="info-value">{movie.adult ? 'R' : 'PG'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Genres */}
              {movie.genre_names && movie.genre_names.length > 0 && (
                <div className="info-section">
                  <h3>Genres</h3>
                  <div className="modal-genres">
                    {movie.genre_names.map((genre, index) => (
                      <span key={index} className="modal-genre-tag">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Overview */}
              {movie.overview && (
                <div className="info-section">
                  <h3>Overview</h3>
                  <p className="movie-overview-full">{movie.overview}</p>
                </div>
              )}

              {/* Additional Details */}
              <div className="info-section">
                <h3>Additional Details</h3>
                <div className="info-grid">
                  {movie.popularity && (
                    <div className="info-item">
                      <span className="info-label">Popularity:</span>
                      <span className="info-value">{movie.popularity.toFixed(1)}</span>
                    </div>
                  )}
                  {movie.vote_average && (
                    <div className="info-item">
                      <span className="info-label">Average Rating:</span>
                      <span className="info-value">{movie.vote_average.toFixed(1)}/10</span>
                    </div>
                  )}
                  {movie.vote_count && (
                    <div className="info-item">
                      <span className="info-label">Total Votes:</span>
                      <span className="info-value">{movie.vote_count.toLocaleString()}</span>
                    </div>
                  )}
                  {movie.budget && movie.budget > 0 && (
                    <div className="info-item">
                      <span className="info-label">Budget:</span>
                      <span className="info-value">${movie.budget.toLocaleString()}</span>
                    </div>
                  )}
                  {movie.revenue && movie.revenue > 0 && (
                    <div className="info-item">
                      <span className="info-label">Revenue:</span>
                      <span className="info-value">${movie.revenue.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal; 