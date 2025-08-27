import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar/SearchBar';
import SortingControls from './SortingControls/SortDropdown';
import MovieGrid from './MovieGrid/MovieGrid';
import PaginationControls from './Pagination/PaginationControls';
import MovieModal from './MovieGrid/MovieModal';
import { movieAPI } from '../../utils/movieAPI';
import './MovieDashboard.css';

const MovieDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  
  // Modal state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch genres on component mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch movies when search criteria changes
  useEffect(() => {
    if (selectedGenres.length > 0 || searchKeyword) {
      fetchMovies();
    }
  }, [selectedGenres, searchKeyword, sortBy, currentPage]);

  const fetchGenres = async () => {
    try {
      const data = await movieAPI.getGenres();
      setGenres(data.genres);
    } catch (err) {
      setError('Failed to fetch genres');
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await movieAPI.discoverMovies({
        with_genres: selectedGenres.join(','),
        query: searchKeyword,
        sort_by: sortBy,
        page: currentPage
      });
      
      setMovies(data.results);
      setTotalPages(data.total_pages);
      setTotalResults(data.total_results);
    } catch (err) {
      setError('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (genres, keyword) => {
    setSelectedGenres(genres);
    setSearchKeyword(keyword);
    setCurrentPage(1); // Reset to first page
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top
  };

  const handleCardClick = (movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  return (
    <div className="movie-dashboard">
      <SearchBar 
        genres={genres}
        onSearch={handleSearch}
        selectedGenres={selectedGenres}
        searchKeyword={searchKeyword}
      />
      
      <div className="dashboard-controls">
        <SortingControls 
          currentSort={sortBy}
          onSortChange={handleSortChange}
        />
        
        {totalResults > 0 && (
          <div className="results-info">
            {totalResults} movies found
          </div>
        )}
      </div>

      {loading && <div className="loading">Loading movies...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {movies.length > 0 && (
        <>
          <MovieGrid 
            movies={movies} 
            onCardClick={handleCardClick}
          />
          
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default MovieDashboard; 