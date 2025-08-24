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

// Convert genre IDs to genre names
const getGenreNames = (genreIds, genresData) => {
  if (!genreIds || !Array.isArray(genreIds) || !genresData || !genresData.genres) {
    return [];
  }
  
  return genreIds.map(id => {
    const genre = genresData.genres.find(g => g.id === id);
    return genre ? genre.name : `Unknown Genre (${id})`;
  });
};

export const movieAPI = {
  async getGenres() {
    return await fetchGenresData();
  },

  async discoverMovies(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
      if (filters.with_genres) queryParams.append('with_genres', filters.with_genres);
      if (filters.query) queryParams.append('query', filters.query);

      const response = await fetch(`/api/discover-movies?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      
      const data = await response.json();
      
      // If we have movies and genres data, convert genre IDs to names
      if (data.results && data.results.length > 0) {
        const genresData = await this.getGenres();
        data.results = data.results.map(movie => ({
          ...movie,
          genre_names: getGenreNames(movie.genre_ids, genresData)
        }));
      }
      
      return data;
    } catch (error) {
      console.error('Error discovering movies:', error);
      throw error;
    }
  },

  // Helper function to convert genre IDs to names (can be used independently)
  getGenreNames
}; 