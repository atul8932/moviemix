import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";
import moviesData from "../../data/hollywood.json";

const HollywoodMovies = () => {
  const movies = (moviesData && moviesData.movies) ? moviesData.movies : [];

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <div className="stars clearfix">
        {Array.from({ length: full }).map((_, i) => (
          <a key={`f-${i}`} className="star rated"></a>
        ))}
        {half && <a className="star half"></a>}
        {Array.from({ length: empty }).map((_, i) => (
          <a key={`e-${i}`} className="star"></a>
        ))}
        <span style={{ marginLeft: 8 }}>{rating}</span>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      {/* Logo on the left */}
      <div style={{ flex: "1", display: "flex", alignItems: "center" }}>
      <div style={{ flex: "1", display: "flex", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="logo" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <span className="logo-icon">🎬</span>
            <span className="logo-text">MovieHub</span>
          </div>
        </Link>
      </div>
      </div>

      {/* Centered Bollywood heading */}
      <div style={{ flex: "1", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Poppins, sans-serif", margin: 0 }}>Hollywood</h1>
      </div>

      {/* Back button on the right */}
      <div style={{ flex: "1", display: "flex", justifyContent: "flex-end" }}>
        <Link className="btn btn-secondary" to="/">
          ← Back
        </Link>
      </div>
    </div>

      <div className="movie-release">
        <ul style={{ display: "flex", flexWrap: "wrap", gap: 16, listStyle: "none", padding: 0, margin: 0 }}>
          {movies.map((movie) => (
            <li key={movie.id}>
              <div className="db-release-movie-li clearfix">
                <div className="rels-movie-thumb">
                  <a href={movie.url} title={movie.title}>
                    <figure>
                      <picture>
                        <source srcSet={movie.poster_image.webp} />
                        <img src={movie.poster_image.jpg} title={movie.title} alt={movie.title} />
                      </picture>
                    </figure>
                  </a>
                </div>
                <div className="rels-movie-details">
                  <div className="movie-lang">
                    <a href={movie.url}>{movie.genre}</a>
                  </div>
                  <div className="movie-name">
                    <a href={movie.url} title={movie.title}>{movie.title}</a>
                  </div>
                  <div className="movie-rels-date">{movie.release_date}</div>
                  <div className="movie-rate">{renderStars(movie.rating)}</div>
                  {Array.isArray(movie.cast) && movie.cast.length > 0 && (
                    <div className="movie-cast">
                      <strong>Cast :</strong>{" "}
                      {movie.cast.map((person, idx) => (
                        <span key={person.profile_url}>
                          <a href={person.profile_url}>{person.name}</a>
                          {idx < movie.cast.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HollywoodMovies; 