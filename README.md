# MovieMix

A React-based movie discovery application with Cashfree payment integration.

## Features

- **Movie Dashboard**: Interactive movie search with genre filtering and TMDB integration
- **Payment Integration**: Cashfree payment gateway for movie requests
- **User Authentication**: Firebase-based user management
- **Responsive Design**: Mobile-first approach with modern UI

## Movie Dashboard

The Movie Dashboard feature has been implemented with:
- Static genre data (no API calls needed)
- TMDB movie discovery via serverless functions
- Responsive grid layout matching Home component styling
- Advanced search and filtering capabilities
- Pagination and sorting options

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables for TMDB API
3. Start development: `npm run dev`
4. Start Vercel dev server: `npx vercel dev`

## Project Structure

```
src/
├── components/
│   └── bollywood/
│       ├── MovieDashboard.jsx      # Main dashboard component
│       ├── SearchBar/              # Search functionality
│       ├── MovieGrid/              # Movie display grid
│       ├── SortingControls/        # Sort options
│       └── Pagination/             # Page navigation
├── data/
│   └── genres.json                 # Static genre data
└── api/                            # Frontend API service

api/                                # Serverless functions
├── movieAPI.js                     # Frontend API service
└── discover-movies.js              # TMDB integration
```
