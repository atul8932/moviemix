import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar/SearchBar';
import SortingControls from './SortingControls/SortDropdown';
import MovieGrid from './MovieGrid/MovieGrid';
import PaginationControls from './Pagination/PaginationControls';
import MovieModal from './MovieGrid/MovieModal';
import { movieAPI } from '../../utils/movieAPI';
import './MovieDashboard.css';

const MovieDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const section = params.get('section') || 'bollywood';

  const { type, withOriginalLanguage, region } = useMemo(() => {
    switch (section) {
      case 'hollywood':
        return { type: 'movie', withOriginalLanguage: 'en', region: 'US' };
      case 'ott-en':
        return { type: 'tv', withOriginalLanguage: 'en' };
      case 'ott-hi':
        return { type: 'tv', withOriginalLanguage: 'hi' };
      case 'bollywood':
      default:
        return { type: 'movie', withOriginalLanguage: 'hi' };
    }
  }, [section]);

  const [items, setItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState(params.get('q') || '');
  const [selectedGenres, setSelectedGenres] = useState((params.get('with_genres') || '').split(',').filter(Boolean));
  const [sortBy, setSortBy] = useState(params.get('sort_by') || 'popularity.desc');
  const [currentPage, setCurrentPage] = useState(parseInt(params.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  
  // Modal state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Keep URL in sync when key params change
  useEffect(() => {
    const next = new URLSearchParams();
    next.set('section', section);
    if (searchKeyword) next.set('q', searchKeyword);
    if (selectedGenres.length) next.set('with_genres', selectedGenres.join(','));
    if (sortBy) next.set('sort_by', sortBy);
    next.set('page', String(currentPage));
    if (next.toString() !== params.toString()) {
      navigate({ pathname: location.pathname, search: `?${next.toString()}` }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, searchKeyword, selectedGenres, sortBy, currentPage]);

  // Fetch genres on component mount
  useEffect(() => {
    fetchGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch items when criteria change
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, selectedGenres, searchKeyword, sortBy, currentPage]);

  const fetchGenres = async () => {
    try {
      const data = await movieAPI.getGenres();
      setGenres(data.genres || []);
    } catch (err) {
      setError('Failed to fetch genres');
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseFilters = {
        with_genres: selectedGenres.join(','),
        query: searchKeyword,
        sort_by: sortBy,
        page: currentPage,
      };

      let data;
      if (type === 'tv') {
        data = await movieAPI.discoverTV({
          ...baseFilters,
          with_original_language: withOriginalLanguage,
        });
        // Map TV fields to movie-like for UI reuse
        if (data?.results?.length) {
          data.results = data.results.map(tv => ({
            ...tv,
            title: tv.name || tv.title,
            release_date: tv.first_air_date || tv.release_date,
          }));
        }
      } else {
        data = await movieAPI.discoverMovies({
          ...baseFilters,
          with_original_language: withOriginalLanguage,
          region,
        });
      }

      setItems(data?.results || []);
      setTotalPages(data?.total_pages || 0);
      setTotalResults(data?.total_results || 0);
    } catch (err) {
      setError('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (genresIn, keyword) => {
    setSelectedGenres(genresIn);
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
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
            {totalResults} results found
          </div>
        )}
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {items.length > 0 && (
        <>
          <MovieGrid 
            movies={items} 
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