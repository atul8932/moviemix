# Movie Dashboard - Technical Solution Documentation

## 1. Overview

The Movie Dashboard is a React-based web application that provides an interactive interface for users to discover and explore movies. It integrates with The Movie Database (TMDB) API to fetch movie data and provides advanced search, filtering, and pagination capabilities.

## 2. Architecture Overview

### 2.1 Technology Stack
- **Frontend**: React.js with functional components and hooks
- **State Management**: React useState and useEffect hooks
- **API Integration**: Serverless functions in `/api` folder (Vercel)
- **Backend**: TMDB API integration via serverless functions with Bearer token authentication
- **Styling**: CSS modules or styled-components
- **Routing**: React Router (if multi-page navigation needed)

### 2.2 Component Structure
```
src/
├── components/
│   └── bollywood/
│       ├── MovieDashboard.jsx          # Main container component
│       ├── SearchBar/
│       │   ├── SearchBar.jsx          # Search input and genre selection
│       │   └── GenreDropdown.jsx      # Genre selection dropdown
│       ├── MovieGrid/
│       │   ├── MovieGrid.jsx          # Movie list container
│       │   └── MovieCard.jsx          # Individual movie card
│       ├── SortingControls/
│       │   └── SortDropdown.jsx       # Sorting options dropdown
│       └── Pagination/
│           └── PaginationControls.jsx # Page navigation
├── data/
│   └── genres.json                    # Static genre data (development)
├── utils/
│   └── movieAPI.js                    # Frontend API service functions
└── public/
    └── genres.json                    # Static genre data (production)
└── api/                               # API folder (Vercel)
    └── discover-movies.js             # Search and discover movies
```

## 3. Technical Implementation

### 3.1 API Service Layer (Client-side Utility)

```javascript
// src/utils/movieAPI.js
// Fetch genres data instead of importing JSON directly
const fetchGenresData = async () => {
  try {
    // Use public folder path that works in both development and production
    const response = await fetch('/genres.json');
    if (!response.ok) {
      throw new Error('Failed to fetch genres data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching genres:', error);
    return { genres: [] };
  }
};

export const movieAPI = {
  // Get genres from static JSON (no API call needed)
  async getGenres() {
    return await fetchGenresData();
  },

  // Discover movies with filters via serverless function
  async discoverMovies(params) {
    const queryParams = new URLSearchParams({
      page: params.page || '1',
      sort_by: params.sortBy || 'popularity.desc',
      ...(params.genres && { with_genres: params.genres.join(',') }),
      ...(params.keyword && { query: params.keyword })
    });

    const response = await fetch(`/api/discover-movies?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to discover movies');
    }
    return response.json();
  }
};
```

### 3.2 Main Dashboard Component (`MovieDashboard.jsx`)

```javascript
import React, { useState, useEffect } from 'react';
import { movieAPI } from '../../utils/movieAPI';
import SearchBar from './SearchBar/SearchBar';
import MovieGrid from './MovieGrid/MovieGrid';
import SortingControls from './SortingControls/SortDropdown';
import PaginationControls from './Pagination/PaginationControls';

const MovieDashboard = () => {
  // State management
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search and filter state
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

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
        genres: selectedGenres,
        keyword: searchKeyword,
        sortBy,
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
          <MovieGrid movies={movies} />
          
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default MovieDashboard;
```

### 3.3 Static Genre Data (`src/data/genres.json`)

```json
{
  "genres": [
    {
      "id": 10759,
      "name": "Action & Adventure"
    },
    {
      "id": 16,
      "name": "Animation"
    },
    {
      "id": 35,
      "name": "Comedy"
    },
    {
      "id": 80,
      "name": "Crime"
    },
    {
      "id": 99,
      "name": "Documentary"
    },
    {
      "id": 18,
      "name": "Drama"
    },
    {
      "id": 10751,
      "name": "Family"
    },
    {
      "id": 10762,
      "name": "Kids"
    },
    {
      "id": 9648,
      "name": "Mystery"
    },
    {
      "id": 10763,
      "name": "News"
    },
    {
      "id": 10764,
      "name": "Reality"
    },
    {
      "id": 10765,
      "name": "Sci-Fi & Fantasy"
    },
    {
      "id": 10766,
      "name": "Soap"
    },
    {
      "id": 10767,
      "name": "Talk"
    },
    {
      "id": 10768,
      "name": "War & Politics"
    },
    {
      "id": 37,
      "name": "Western"
    }
  ]
}
```

### 3.4 Serverless Function Implementations

#### **3.4.1 Discover Movies API (`api/discover-movies.js`)**

```javascript
// api/discover-movies.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

    if (!TMDB_BEARER_TOKEN) {
      return res.status(500).json({ error: 'TMDB Bearer token not configured' });
    }

    const { page, sort_by, with_genres, query } = req.query;

    // Build query parameters (without api_key)
    const queryParams = new URLSearchParams({
      language: 'en-US',
      include_adult: 'false',
      page: page || '1',
      sort_by: sort_by || 'popularity.desc'
    });

    if (with_genres) {
      queryParams.append('with_genres', with_genres);
    }

    if (query) {
      queryParams.append('query', query);
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error discovering movies:', error);
    return res.status(500).json({ error: 'Failed to discover movies' });
  }
}
```

### 3.5 Search Bar Component (`SearchBar/SearchBar.jsx`)

```javascript
import React, { useState } from 'react';
import GenreDropdown from './GenreDropdown';

const SearchBar = ({ genres, onSearch, selectedGenres, searchKeyword }) => {
  const [localKeyword, setLocalKeyword] = useState(searchKeyword);
  const [localGenres, setLocalGenres] = useState(selectedGenres);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localGenres, localKeyword);
  };

  const handleGenreChange = (genreId, isSelected) => {
    if (isSelected) {
      setLocalGenres([...localGenres, genreId]);
    } else {
      setLocalGenres(localGenres.filter(id => id !== genreId));
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-inputs">
        <input
          type="text"
          placeholder="Search movies, actors, keywords..."
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          className="keyword-input"
        />
        
        <GenreDropdown
          genres={genres}
          selectedGenres={localGenres}
          onGenreChange={handleGenreChange}
        />
      </div>
      
      <button type="submit" className="search-button">
        Search Movies
      </button>
    </form>
  );
};

export default SearchBar;
```

### 3.6 Movie Grid Component (`MovieGrid/MovieGrid.jsx`)

```javascript
import React from 'react';
import MovieCard from './MovieCard';

const MovieGrid = ({ movies }) => {
  return (
    <div className="movie-grid">
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieGrid;
```

### 3.7 Movie Card Component (`MovieGrid/MovieCard.jsx`)

```javascript
import React from 'react';

const MovieCard = ({ movie }) => {
  const {
    id,
    title,
    poster_path,
    release_date,
    vote_average,
    overview
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

  return (
    <div className="movie-card" data-movie-id={id}>
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
        <p className="movie-overview">
          {truncateOverview(overview)}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
```

### 3.8 Sorting Controls (`SortingControls/SortDropdown.jsx`)

```javascript
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
```

### 3.9 Pagination Controls (`Pagination/PaginationControls.jsx`)

```javascript
import React from 'react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5;
  
  const getVisiblePages = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="pagination-controls">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button prev"
      >
        ← Previous
      </button>
      
      <div className="page-numbers">
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`pagination-button page ${page === currentPage ? 'active' : ''}`}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button next"
      >
        Next →
      </button>
      
      <div className="page-info">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default PaginationControls;
```

## 4. Environment Configuration

### 4.1 Environment Variables

#### **Frontend (`.env.local`)**
```bash
# No TMDB API key needed in frontend
# All API calls go through serverless functions
```

#### **Backend (`.env` for Vercel dev)**
```bash
# TMDB API Authentication using Bearer Token
TMDB_BEARER_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNzY4NTMzYzA0N2M1NGNjYTU4ZTk5MGFiZjUxNzYxMCIsIm5iZiI6MTc1NTYyODc1OC42OTUwMDAyLCJzdWIiOiI2OGE0YzRkNmNmZmNiZjk0M2Y4MzQ2YzQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.drgt18RgCl46Anwmqm97Myb831M-i9KDvkDr1bXrOaQ

# Cashfree Payment Gateway Configuration
CF_CLIENT_ID=your_cashfree_client_id
CF_CLIENT_SECRET=your_cashfree_client_secret
CF_API_URL=https://sandbox.cashfree.com/pg
```

#### **Production (Vercel Dashboard)**
Set environment variables in Vercel dashboard:
- `TMDB_API_KEY` - Your TMDB API key

### 4.2 TMDB API Setup
1. Register at [TMDB](https://www.themoviedb.org/settings/api)
2. Get your Bearer token (JWT token)
3. Add `TMDB_BEARER_TOKEN` to Vercel environment variables (not frontend)
4. Frontend calls `/api/discover-movies` for movie search, genres are static JSON
5. Only movie discovery requires TMDB API calls
6. **Note**: Using Bearer token authentication instead of API key for better security

## 5. Styling Guidelines

### 5.1 Design Consistency
**Important**: All styling must match the existing Home component design and theme to maintain consistency across the application.

### 5.2 CSS Classes Structure
```css
.movie-dashboard {
  /* Main container styles - match Home component */
}

.search-bar {
  /* Search form layout - use Home component styling */
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
  /* Match Home component grid styling */
}

.movie-card {
  /* Card styling with hover effects - consistent with Home */
}

.pagination-controls {
  /* Pagination layout and styling - match Home theme */
}
```

### 5.2 Responsive Design
- **Mobile**: Single column layout
- **Tablet**: 2-3 columns
- **Desktop**: 4-6 columns with hover effects

### 5.3 Existing Style Integration
- **Use existing CSS classes** from Home component where possible
- **Maintain color scheme** and typography consistency
- **Follow existing spacing** and layout patterns
- **Reuse button styles** and form elements from Home
- **Match hover effects** and transitions for consistency

## 6. Error Handling & Loading States

### 6.1 Error Scenarios
- API key invalid/expired
- Network connectivity issues
- TMDB API rate limiting
- Invalid search parameters

### 6.2 Loading States
- Initial page load
- Search execution
- Page navigation
- Genre fetching

## 7. Performance Optimizations

### 7.1 Image Optimization
- Lazy loading for movie posters
- Responsive image sizes
- Placeholder images for missing posters

### 7.2 API Optimization
- Debounced search input
- Caching for genre list
- Pagination to limit data transfer

### 7.3 Component Optimization
- React.memo for static components
- useCallback for event handlers
- useMemo for expensive calculations

## 8. Testing Strategy

### 8.1 Unit Tests
- Component rendering
- API service functions
- Utility functions

### 8.2 Integration Tests
- Search functionality
- Pagination flow
- Error handling

### 8.3 E2E Tests
- Complete user journey
- Cross-browser compatibility

## 9. Local Development Setup

### 9.1 Running Locally
1. **Start Vite dev server** (Frontend):
   ```bash
   npm run dev
   # Runs on http://localhost:5173
   ```

2. **Start Vercel dev server** (Backend):
   ```bash
   npx vercel dev
   # Runs on http://localhost:3000
   ```

3. **Vite proxy configuration** automatically routes `/api/*` calls to `localhost:3000`

### 9.2 Environment Setup
- **Frontend**: No environment variables needed
- **Backend**: Create `.env` file with `TMDB_BEARER_TOKEN`
- **Production**: Set environment variables in Vercel dashboard
- **Note**: Using Bearer token authentication for enhanced security

## 10. Deployment Considerations

### 9.1 Build Optimization
- Code splitting
- Tree shaking
- Bundle analysis

### 9.2 Environment Management
- Production API keys
- Environment-specific configurations
- Build-time optimizations

## 10. Recent Architectural Updates

### 10.1 API Authentication Changes
- **Updated from API Key to Bearer Token**: Enhanced security using JWT-based authentication
- **Moved movieAPI.js**: Relocated from `/api` folder to `/src/utils` for better organization
- **Updated import paths**: All components now import from `../../utils/movieAPI`

### 10.2 Payment Integration
- **Cashfree Payment Gateway**: Integrated for movie request payments
- **Serverless Functions**: Payment creation and verification handled via `/api` endpoints
- **Environment Variables**: Added Cashfree configuration for development and production

### 10.3 File Structure Updates
```
src/
├── utils/
│   └── movieAPI.js                    # Client-side API utilities
├── components/
│   └── bollywood/
│       └── MovieDashboard.jsx         # Updated import paths
└── api/                               # Serverless functions only
    ├── create-payment.js              # Payment order creation
    ├── verify-payment.js              # Payment verification
    └── discover-movies.js             # Movie discovery (updated auth)
```

## 11. Future Enhancements

### 11.1 Advanced Features
- Movie favorites/watchlist
- User ratings and reviews
- Advanced filtering (year, runtime, etc.)
- Movie recommendations
- Individual movie detail pages

### 11.2 Technical Improvements
- Redux/Context for state management
- Service Worker for offline support
- Progressive Web App features
- Internationalization (i18n)

This technical solution provides a robust foundation for the Movie Dashboard feature with clean architecture, proper error handling, and scalability considerations. The recent updates include enhanced security with Bearer token authentication, improved file organization, and integrated payment gateway functionality for a complete movie request system. 