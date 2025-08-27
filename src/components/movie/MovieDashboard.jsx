import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar/SearchBar';
import SortingControls from './SortingControls/SortDropdown';
import MovieGrid from './MovieGrid/MovieGrid';
import PaginationControls from './Pagination/PaginationControls';
import MovieModal from './MovieGrid/MovieModal';
import RequestMovieModal from './RequestMovieModal';
import WhatsAppWidget from '../WhatsAppWidget';
import { movieAPI } from '../../utils/movieAPI';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './MovieDashboard.css';

const MovieDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [user, setUser] = useState(null);
  const whatsappWidgetRef = useRef();
  
  // Use Firebase auth directly (same as Dashboard.jsx)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

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

  // ADD these states for request modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMovie, setRequestMovie] = useState(null);

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

  // ADD this function - follows EXACT same flow as Dashboard
  const handleMovieRequest = async (requestData) => {
    if (!user) return;
    
    try {
      // STEP 1: Set data in localStorage (SAME STRUCTURE as existing Dashboard)
      localStorage.setItem("cfPendingOrder", JSON.stringify({ 
        // Use EXACT same fields as existing Dashboard orders
        orderId: null, // Will be set after payment creation
        mobile: user.phoneNumber || '9999999999',
        movie: requestData.movieName, // Use 'movie' field (same as Dashboard)
        language: requestData.language,
        // Additional movie-specific data (will be preserved)
        movieId: requestData.movieId,
        releaseDate: requestData.releaseDate,
        overview: requestData.overview,
        posterPath: requestData.posterPath,
        additionalNotes: requestData.additionalNotes,
        // User details (same as Dashboard)
        userId: user.uid,
        userEmail: user.email
      }));

      // STEP 2: Redirect to payment (same as Dashboard flow)
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderAmount: 6, // Fixed amount for movie requests
          customerPhone: user.phoneNumber || '9999999999',
          customerEmail: user.email || `customer_${Date.now()}@example.com`,
          returnUrl: `${window.location.origin}/#/dashboard`, // Redirect to Dashboard
          orderNote: `Movie Request: ${requestData.movieName} (${requestData.language})`
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Payment creation failed: ${errorData}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Payment creation failed');
      }

      // STEP 3: Update localStorage with orderId (same as Dashboard)
      const updatedPendingOrder = JSON.parse(localStorage.getItem("cfPendingOrder"));
      updatedPendingOrder.orderId = data.order_id;
      localStorage.setItem("cfPendingOrder", JSON.stringify(updatedPendingOrder));

      // STEP 4: Redirect to payment (same as Dashboard)
      if (data.payment_link) {
        window.open(data.payment_link, '_self');
      }
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      // Remove from localStorage if payment creation fails
      localStorage.removeItem("cfPendingOrder");
    }
  };

  // ADD this function
  const handleRequestMovie = (movie) => {
    setRequestMovie(movie);
    setShowRequestModal(true);
  };

  // ADD this function to trigger WhatsAppWidget
  const triggerWhatsApp = (movieTitle) => {
    const message = `I want to request the movie ${movieTitle}`;
    whatsappWidgetRef.current?.openWithMessage(message);
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
            onRequestMovie={handleRequestMovie} // Add this prop
            onTriggerWhatsApp={triggerWhatsApp} // Add this prop
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

      {/* ADD Request Modal */}
      {showRequestModal && requestMovie && (
        <RequestMovieModal
          movie={requestMovie}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleMovieRequest}
        />
      )}

      {/* ADD WhatsApp Widget */}
      <WhatsAppWidget ref={whatsappWidgetRef} />
    </div>
  );
};

export default MovieDashboard; 