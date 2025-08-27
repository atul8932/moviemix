// api/discover-tv.js
export default async function handler(req, res) {
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

    const {
      page,
      sort_by,
      with_genres,
      query,
      with_original_language,
      watch_region,
      with_watch_providers,
      with_watch_monetization_types,
    } = req.query;

    const qs = new URLSearchParams({
      language: 'en-US',
      page: page || '1',
      sort_by: sort_by || 'popularity.desc',
    });
    if (with_genres) qs.append('with_genres', with_genres);
    if (with_original_language) qs.append('with_original_language', with_original_language);
    if (watch_region) qs.append('watch_region', watch_region);
    if (with_watch_providers) qs.append('with_watch_providers', with_watch_providers);
    if (with_watch_monetization_types) qs.append('with_watch_monetization_types', with_watch_monetization_types);
    if (query) qs.append('query', query);

    const url = `${TMDB_BASE_URL}/discover/tv?${qs.toString()}`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        accept: 'application/json',
      },
    });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: 'TMDB error', details: text });
    }
    const data = await resp.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to discover TV', details: e?.message || String(e) });
  }
} 