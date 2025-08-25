// api/discover-movies.js
export default async function handler(req, res) {
  console.log('=== DISCOVER-MOVIES FUNCTION CALLED ===');
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

    const { page, sort_by, with_genres, query } = req.query;
    
    console.log('=== REQUEST PARAMETERS ===');
    console.log('- page:', page);
    console.log('- sort_by:', sort_by);
    console.log('- with_genres:', with_genres);
    console.log('- query:', query);

    // Get today's date in YYYY-MM-DD format for TMDB API
    const today = new Date().toISOString().split('T')[0];
    console.log('- Today\'s date (filter):', today);

    // Build query parameters (without api_key)
    const queryParams = new URLSearchParams({
      language: 'en-US',
      include_adult: 'false',
      page: page || '1',
      sort_by: sort_by || 'popularity.desc',
      'primary_release_date.lte': today // Only show movies released before today
    });

    if (with_genres) {
      queryParams.append('with_genres', with_genres);
    }

    if (query) {
      queryParams.append('query', query);
    }

    const finalUrl = `${TMDB_BASE_URL}/discover/movie?${queryParams}`;
    
    console.log('=== TMDB API CALL ===');
    console.log('Final URL:', finalUrl);
    console.log('Query Parameters:', queryParams.toString());
    console.log('Release Date Filter:', `primary_release_date.lte=${today}`);
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
      console.error('TMDB API Error Response:');
      console.error('Status:', response.status);
      console.error('Error Text:', errorText);
      throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('=== TMDB API SUCCESS ===');
    console.log('Response Data Keys:', Object.keys(data));
    console.log('Total Results:', data.total_results);
    console.log('Total Pages:', data.total_pages);
    console.log('Current Page:', data.page);
    console.log('Movies Count:', data.results ? data.results.length : 'No results array');
    console.log('Release Date Filter Applied:', `Only movies released before ${today}`);
    
    if (data.results && data.results.length > 0) {
      console.log('First Movie Sample:', {
        id: data.results[0].id,
        title: data.results[0].title,
        release_date: data.results[0].release_date,
        vote_average: data.results[0].vote_average
      });
    }

    console.log('=== SENDING RESPONSE TO FRONTEND ===');
    return res.status(200).json(data);
  } catch (error) {
    console.log('=== FUNCTION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    
    return res.status(500).json({ 
      error: 'Failed to discover movies',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 