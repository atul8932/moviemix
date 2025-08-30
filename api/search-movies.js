// api/search-movies.js
export default async function handler(req, res) {
  console.log('=== SEARCH-MOVIES FUNCTION CALLED ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Query Parameters:', req.query);
  console.log('URL:', req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

    console.log('=== ENVIRONMENT VARIABLES ===');
    console.log('- TMDB_BEARER_TOKEN:', TMDB_BEARER_TOKEN ? TMDB_BEARER_TOKEN.substring(0, 20) + '...' : 'NOT SET');
    console.log('- TMDB_BASE_URL:', TMDB_BASE_URL);

    if (!TMDB_BEARER_TOKEN) {
      console.error('Missing TMDB Bearer token');
      return res.status(500).json({ error: 'TMDB Bearer token not configured' });
    }

    const { query, page, language, include_adult } = req.query;
    
    console.log('=== REQUEST PARAMETERS ===');
    console.log('- query:', query);
    console.log('- page:', page);
    console.log('- language:', language);
    console.log('- include_adult:', include_adult);

    if (!query || query.trim() === '') {
      console.error('Missing search query');
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Build query parameters for TMDB search API
    const queryParams = new URLSearchParams({
      query: query.trim(),
      include_adult: include_adult || 'false',
      language: language || 'en-US',
      page: page || '1'
    });

    const finalUrl = `${TMDB_BASE_URL}/search/movie?${queryParams}`;
    
    console.log('=== TMDB SEARCH API CALL ===');
    console.log('Final URL:', finalUrl);
    console.log('Query Parameters:', queryParams.toString());
    console.log('Headers being sent:', {
      'Authorization': `Bearer ${TMDB_BEARER_TOKEN.substring(0, 20)}...`,
      'accept': 'application/json'
    });

    const response = await fetch(
      finalUrl,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
          'accept': 'application/json'
        }
      }
    );

    console.log('=== TMDB API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TMDB API error response:', errorText);
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('=== SEARCH RESULTS ===');
    console.log('- Total results:', data.total_results);
    console.log('- Total pages:', data.total_pages);
    console.log('- Current page:', data.page);
    console.log('- Results count:', data.results ? data.results.length : 0);

    // Return the search results
    return res.status(200).json(data);

  } catch (error) {
    console.error('=== ERROR IN SEARCH-MOVIES ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Failed to search movies',
      details: error.message 
    });
  }
} 