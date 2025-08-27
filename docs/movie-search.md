
---

## Code Changes Plan (File-by-File) – From Home.jsx to Single Route Page

This section documents the precise code edits to move to a unified single-route movie/TV search page at `/search`. It is read-only documentation; we will implement after you approve.

### 1) Update Header Navigation (Home.jsx)

- Change links to point to the single route with a `section` query param.

Example edit in `src/components/Home.jsx`:
```diff
- <Link className="btn btn-text white-text" to="/bollywood" >Bollywood</Link>
- <Link className="btn btn-text white-text" to="/hollywood">Hollywood</Link>
- <Link className="btn btn-text white-text" to="/ott">OTT Originals</Link>
+ <Link className="btn btn-text white-text" to="/search?section=bollywood">Bollywood</Link>
+ <Link className="btn btn-text white-text" to="/search?section=hollywood">Hollywood</Link>
+ <Link className="btn btn-text white-text" to="/search?section=ott-en">OTT Originals</Link>
```

Notes:
- We route the default OTT link to English; the page will have an in-page toggle to switch to OTT-Hindi (`section=ott-hi`).

### 2) Add Single Route (App.jsx)

- Add a route for the unified search page.
- Keep existing routes temporarily (optional) during transition; final step is to deprecate `/bollywood`, `/hollywood`, `/ott`.

Example edit in `src/App.jsx`:
```diff
+ import MovieSearch from "./components/search/MovieSearch";
  // ...
  <Routes>
    // existing routes
+   <Route path="/search" element={<MovieSearch />} />
  </Routes>
```

### 3) New Page Component (MovieSearch.jsx)

- Create `src/components/search/MovieSearch.jsx`.
- Responsibilities:
  - Read URL query `section`, `page`, `sort_by`, `with_genres`, `q`.
  - Compute presets per section:
    - bollywood → type: movie; with_original_language=hi
    - hollywood → type: movie; with_original_language=en; region=US (optional)
    - ott-en → type: tv; with_original_language=en
    - ott-hi → type: tv; with_original_language=hi
  - Build query and call the corresponding endpoint (movies vs tv) through the API utility.
  - Render: SearchBar, SortingControls, Grid (MovieCard or TVCard), PaginationControls.

Example skeleton (for reference only):
```jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { movieAPI } from "../../utils/movieAPI"; // discoverMovies + discoverTV
import SearchBar from "../bollywood/SearchBar/SearchBar";
import SortingControls from "../bollywood/SortingControls/SortDropdown";
import MovieGrid from "../bollywood/MovieGrid/MovieGrid"; // can reuse for TV with minor adjustments or create TVGrid
import PaginationControls from "../bollywood/Pagination/PaginationControls";

const MovieSearch = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);

  const section = params.get("section") || "bollywood";
  const page = params.get("page") || "1";
  const sort_by = params.get("sort_by") || "popularity.desc";
  const with_genres = params.get("with_genres") || "";
  const keyword = params.get("q") || "";

  const { type, with_original_language, region } = useMemo(() => {
    switch (section) {
      case "hollywood":
        return { type: "movie", with_original_language: "en", region: "US" };
      case "ott-en":
        return { type: "tv", with_original_language: "en" };
      case "ott-hi":
        return { type: "tv", with_original_language: "hi" };
      case "bollywood":
      default:
        return { type: "movie", with_original_language: "hi" };
    }
  }, [section]);

  // fetch logic using movieAPI.discoverMovies or movieAPI.discoverTV
  // render SearchBar, SortingControls, Grid, PaginationControls

  return (<div>/* UI per design */</div>);
};

export default MovieSearch;
```

### 4) Frontend API Utility (src/utils/movieAPI.js)

- Extend the utility to support:
  - Movies: `discoverMovies({ page, sort_by, with_genres, query, with_original_language, region })`
  - TV: `discoverTV({ page, sort_by, with_genres, query, with_original_language, watch_region?, with_watch_providers?, with_watch_monetization_types? })`

Notes:
- This mirrors the serverless inputs and forwards to `/api/discover-movies` or `/api/discover-tv`.
- Keep `language=en-US` in serverless; client passes only discovery filters.

### 5) Serverless Endpoints (api/)

- `api/discover-movies.js`
  - Accept `with_original_language` and optional `region` and pass them to TMDB Discover Movie.
  - Keep existing params: `page`, `sort_by`, `with_genres`, `query`.

- `api/discover-tv.js` (new)
  - Mirror movies but call TMDB Discover TV and accept TV-friendly filters.

Headers (both):
- `Authorization: Bearer ${TMDB_BEARER_TOKEN}`
- `accept: application/json`

### 6) Reusing Components

- SearchBar: reuse as-is (keyword + genres). For TV genres, either reuse movie genres until TV list is added or add TV-specific genre list later.
- SortingControls: reuse as-is (`popularity.desc`, `release_date.desc`, `vote_average.desc`). For TV, consider `first_air_date.desc` later.
- MovieGrid & MovieCard: for TV, either reuse MovieCard with field mapping (`name` → `title`, `first_air_date` → `release_date`) or add `TVGrid/TVCard` to avoid confusion.
- PaginationControls: reuse as-is.

### 7) URL/State Sync

- Always write state to URL (page, sort, genres, q) so deep links are shareable.
- Changing tabs within OTT updates `section` to `ott-en` / `ott-hi` in the URL.

### 8) Acceptance Criteria (for code changes)

- All header links point to `/search` with correct `section`.
- `/search` page reads `section` and calls the correct API with correct `with_original_language` mapping (`en` or `hi`).
- Pagination, sorting, genres, and search work; state persists in URL.
- Error/loading/empty states are consistent with Home styles.

### 9) Decommission Old Routes (Optional Final Step)

- Remove or redirect `/bollywood`, `/hollywood`, `/ott` to `/search?section=...` once the new flow is stable.
