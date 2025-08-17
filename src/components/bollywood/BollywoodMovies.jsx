import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";
import Footer from "../Footer";

const BollywoodMovies = () => {
  const moviesData = {
    movies: [
        {
          id: "war-2",
          title: "War 2",
          url: "/bollywood/movies/war-2.html",
          poster_image: {
            webp: "https://images.filmibeat.com/webp/226x283/img/popcorn/movie_posters/war2-20250520111110-20727.jpg",
            jpg: "https://images.filmibeat.com/226x283/img/popcorn/movie_posters/war2-20250520111110-20727.jpg",
            dimensions: "226x283"
          },
          genre: "Bollywood",
          release_date: "14 Aug, 2025",
          rating: 3.5,
          cast: [
            {
              name: "Hrithik Roshan",
              profile_url: "https://www.filmibeat.com/celebs/hrithik-roshan.html"
            },
            {
              name: "Jr. Ntr",
              profile_url: "https://www.filmibeat.com/celebs/jr-ntr.html"
            }
          ]
        },
        {
          id: "tehran",
          title: "Tehran",
          url: "/bollywood/movies/tehran.html",
          poster_image: {
            webp: "https://images.filmibeat.com/webp/226x283/img/popcorn/movie_posters/tehran-20250731150437-20776.jpg",
            jpg: "https://images.filmibeat.com/226x283/img/popcorn/movie_posters/tehran-20250731150437-20776.jpg",
            dimensions: "226x283"
          },
          genre: "Bollywood",
          release_date: "14 Aug, 2025",
          rating: 3.5,
          cast: [
            {
              name: "John Abraham",
              profile_url: "https://www.filmibeat.com/celebs/john-abraham.html"
            },
            {
              name: "Manushi Chhillar",
              profile_url: "https://www.filmibeat.com/celebs/manushi-chhillar.html"
            }
          ]
        },
        {
          id: "ghich-pich",
          title: "Ghich Pich",
          url: "/bollywood/movies/ghich-pich.html",
          poster_image: {
            webp: "https://images.filmibeat.com/webp/226x283/img/popcorn/movie_posters/ghichpich-20250811163542-23838.jpg",
            jpg: "https://images.filmibeat.com/226x283/img/popcorn/movie_posters/ghichpich-20250811163542-23838.jpg",
            dimensions: "226x283"
          },
          genre: "Bollywood",
          release_date: "08 Aug, 2025",
          rating: 3.5,
          cast: [
            {
              name: "Nitesh Pandey",
              profile_url: "https://www.filmibeat.com/celebs/nitesh-pandey.html"
            },
            {
              name: "Satyajit Sharma",
              profile_url: "https://www.filmibeat.com/celebs/satyajit-sharma.html"
            }
          ]
        },
        {
          id: "andaaz-2",
          title: "Andaaz 2",
          url: "/bollywood/movies/andaaz-2.html",
          poster_image: {
            webp: "https://images.filmibeat.com/webp/226x283/img/popcorn/movie_posters/andaaz2-20250729152525-23817.jpg",
            jpg: "https://images.filmibeat.com/226x283/img/popcorn/movie_posters/andaaz2-20250729152525-23817.jpg",
            dimensions: "226x283"
          },
          genre: "Bollywood",
          release_date: "08 Aug, 2025",
          rating: 3.0,
          cast: [
            {
              name: "Aayush Kumar",
              profile_url: "https://www.filmibeat.com/celebs/aayush-kumar.html"
            },
            {
              name: "Akaisha Vats",
              profile_url: "https://www.filmibeat.com/celebs/akaisha-vats.html"
            }
          ]
        },
        {
          id: "udaipur-files-kanhaiya-lal-tailor-murder",
          title: "Udaipur Files: Kanhaiya Lal Tailor Murder",
          url: "/bollywood/movies/udaipur-files-kanhaiya-lal-tailor-murder.html",
          poster_image: {
            webp: "https://images.filmibeat.com/webp/226x283/img/popcorn/movie_posters/udaipurfiles-kanhaiyalaltailormurder-20250710180450-23801.jpg",
            jpg: "https://images.filmibeat.com/226x283/img/popcorn/movie_posters/udaipurfiles-kanhaiyalaltailormurder-20250710180450-23801.jpg",
            dimensions: "226x283"
          },
          genre: "Bollywood",
          release_date: "08 Aug, 2025",
          rating: 3.0,
          cast: [
            {
              name: "Vijay Raaz",
              profile_url: "https://www.filmibeat.com/celebs/vijay-raaz.html"
            },
            {
              name: "Preeti Jhangiani",
              profile_url: "https://www.filmibeat.com/celebs/preeti-jhangiani.html"
            }
          ]
        },
        {
          id: "dhadak-2",
          title: "Dhadak 2",
          url: "/bollywood/movies/dhadak-2.html",
          poster_image: {
            webp: "https://images.filmibeat.com/webp/226x283/img/popcorn/movie_posters/dhadak2-20250709112349-22942.jpg",
            jpg: "https://images.filmibeat.com/226x283/img/popcorn/movie_posters/dhadak2-20250709112349-22942.jpg",
            dimensions: "226x283"
          },
          genre: "Bollywood",
          release_date: "01 Aug, 2025",
          rating: 4.0,
          cast: [
            {
              name: "Siddhant Chaturvedi",
              profile_url: "https://www.filmibeat.com/celebs/siddhant-chaturvedi.html"
            },
            {
              name: "Tripti Dimri",
              profile_url: "https://www.filmibeat.com/celebs/tripti-dimri.html"
            }
          ]
        },
        {
          id: "son-of-sardaar-2",
          title: "Son Of Sardaar 2",
          url: "/bollywood/movies/son-of-sardaar-2.html",
          poster_image: {
            webp: "https://images.filmibeat.com/webp/226x283/img/popcorn/movie_posters/sonofsardaar2-20250619115232-23411.jpg",
            jpg: "https://images.filmibeat.com/226x283/img/popcorn/movie_posters/sonofsardaar2-20250619115232-23411.jpg",
            dimensions: "226x283"
          },
          genre: "Bollywood",
          release_date: "01 Aug, 2025",
          rating: 4.0,
          cast: [
            {
              name: "Ajay Devgn",
              profile_url: "https://www.filmibeat.com/celebs/ajay-devgn.html"
            },
            {
              name: "Mrunal Thakur",
              profile_url: "https://www.filmibeat.com/celebs/mrunal-thakur.html"
            }
          ]
        },
        {
          id: "mandala-murders",
          title: "Mandala Murders",
          url: "/bollywood/movies/mandala-murders.html",
          poster_image: {
            webp: "https://images.filmibeat.com/webp/226x283/img/popcorn/movie_posters/mandalamurders-20250210133650-23498.jpg",
            jpg: "https://images.filmibeat.com/226x283/img/popcorn/movie_posters/mandalamurders-20250210133650-23498.jpg",
            dimensions: "226x283"
          },
          genre: "Bollywood",
          release_date: "25 Jul, 2025",
          rating: 4.0,
          cast: [
            {
              name: "Vaani Kapoor",
              profile_url: "https://www.filmibeat.com/celebs/vaani-kapoor.html"
            },
            {
              name: "Surveen Chawla",
              profile_url: "https://www.filmibeat.com/celebs/surveen-chawla.html"
            }
          ]
        }
      ]
  };

  const movies = moviesData.movies || [];

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontFamily: "Poppins, sans-serif" }}>Bollywood</h1>
        <Link className="btn btn-secondary" to="/">← Back</Link>
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

      <Footer />
    </div>
  );
};

export default BollywoodMovies; 