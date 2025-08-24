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