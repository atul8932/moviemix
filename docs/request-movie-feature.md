# Request Movie Feature - Implementation Changes

## 1. Overview

This document outlines the **minimal changes** needed to implement the Request Movie feature by reusing existing Dashboard payment logic.

**Key Principle**: No changes to existing payment APIs OR Dashboard logic - only frontend component updates.

**Flow**: Movie Request → localStorage → Payment → Dashboard → Create Order (same as existing Dashboard flow)

## 2. Required Changes

### 2.1 MovieCard.jsx - Add Request Movie Button

**Current State**: Movie card with click handler for movie details
**New State**: Movie card with Request Movie button + conditional behavior

```javascript
// ADD to existing MovieCard.jsx
import { useAuth } from '../../contexts/AuthContext'; // Add this import

const MovieCard = ({ movie, onCardClick, onRequestMovie }) => { // Add onRequestMovie prop
  const { user } = useAuth(); // Add this line
  
  // ADD this function
  const handleRequestClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    
    if (user) {
      // Logged-in user: Open in-app request flow
      onRequestMovie(movie);
    } else {
      // Guest user: Open WhatsApp with pre-filled message
      openWhatsAppRequest(movie.title);
    }
  };

  // ADD this function
  const openWhatsAppRequest = (movieTitle) => {
    const phoneNumber = process.env.VITE_WHATSAPP_ADMIN_NUMBER || '919999999999';
    const message = encodeURIComponent(`I want to request the movie ${movieTitle}`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="movie-card" data-movie-id={id} onClick={handleCardClick}>
      {/* EXISTING content stays the same */}
      
      {/* ADD this button at the end of movie-info div */}
      <button 
        className="btn btn-primary request-movie-btn"
        onClick={handleRequestClick}
      >
        Request Movie
      </button>
    </div>
  );
};
```

### 2.2 MovieGrid.jsx - Pass Request Handler

**Current State**: `<MovieGrid movies={movies} />`
**New State**: `<MovieGrid movies={movies} onRequestMovie={handleRequestMovie} />`

```javascript
// UPDATE existing MovieGrid.jsx
const MovieGrid = ({ movies, onRequestMovie }) => { // Add onRequestMovie prop
  
  return (
    <div className="movie-grid">
      {movies.map(movie => (
        <MovieCard 
          key={movie.id} 
          movie={movie} 
          onCardClick={handleCardClick}
          onRequestMovie={onRequestMovie} // Add this prop
        />
      ))}
    </div>
  );
};
```

### 2.3 MovieDashboard.jsx - Add Request Handling

**Current State**: Basic movie display with search/filter
**New State**: Movie display + request modal + payment integration

```javascript
// ADD to existing MovieDashboard.jsx
import { useState } from 'react'; // Add if not already imported
import { useAuth } from '../../contexts/AuthContext'; // Add this import
import RequestMovieModal from './RequestMovieModal'; // Add this import

const MovieDashboard = () => {
  // ADD these states
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { user } = useAuth();
  
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
    setSelectedMovie(movie);
    setShowRequestModal(true);
  };

  return (
    <div className="movie-dashboard">
      {/* EXISTING content stays the same */}
      
      {/* UPDATE MovieGrid to include request handler */}
      <MovieGrid 
        movies={movies} 
        onRequestMovie={handleRequestMovie} // Add this prop
      />
      
      {/* ADD Request Modal */}
      {showRequestModal && selectedMovie && (
        <RequestMovieModal
          movie={selectedMovie}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleMovieRequest}
        />
      )}
    </div>
  );
};
```

### 2.4 Create New Component: RequestMovieModal.jsx

**New File**: `src/components/movie/RequestMovieModal.jsx`

```javascript
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RequestMovieModal = ({ movie, isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [requestData, setRequestData] = useState({
    movieName: movie.title,
    movieId: movie.id,
    releaseDate: movie.release_date,
    overview: movie.overview,
    posterPath: movie.poster_path,
    language: 'English',
    additionalNotes: ''
  });

  const handleSubmit = async () => {
    try {
      // Close modal and pass data to parent for payment processing
      onClose();
      onSubmit(requestData); // Pass request data to parent
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content request-modal">
        <h2>Request Movie: {movie.title}</h2>
        
        {/* Movie details (read-only) */}
        <div className="movie-details">
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
            alt={movie.title} 
          />
          <div>
            <h3>{movie.title}</h3>
            <p><strong>Release Date:</strong> {movie.release_date}</p>
            <p><strong>Overview:</strong> {movie.overview}</p>
          </div>
        </div>

        {/* Language selection */}
        <div className="form-group">
          <label>Preferred Language</label>
          <select
            value={requestData.language}
            onChange={(e) => setRequestData({
              ...requestData,
              language: e.target.value
            })}
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Tamil">Tamil</option>
            <option value="Telugu">Telugu</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Additional notes input */}
        <div className="form-group">
          <label>Additional Notes (Optional)</label>
          <textarea
            value={requestData.additionalNotes}
            onChange={(e) => setRequestData({
              ...requestData,
              additionalNotes: e.target.value
            })}
            placeholder="Any specific requirements or notes..."
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit Request & Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestMovieModal;
```

### 2.5 Dashboard.jsx - NO CHANGES NEEDED!

**Current State**: Dashboard already handles movie requests perfectly
**New State**: **NO CHANGES REQUIRED** - existing logic works as-is

Your existing Dashboard code already handles movie requests perfectly! Here's why:

```javascript
// Your existing Dashboard code already handles this:
const movieRequest = {
  mobile: pending.mobile,           // ✅ From localStorage
  movieName: pending.movie,         // ✅ From localStorage  
  language: pending.language,       // ✅ From localStorage
  email: user.email,                // ✅ From user context
  createdAt: serverTimestamp(),     // ✅ Current timestamp
  status: "pending",                // ✅ Default status
  paymentStatus: "success",         // ✅ After verification
  downloadLink: "",                 // ✅ Empty initially
  cfOrderId: pending.orderId,       // ✅ From localStorage
  paymentMethod: result.data?.payment_method || "" // ✅ From API response
};

// This creates the movie request in Firestore
const docRef = await addDoc(collection(db, "movieRequests"), movieRequest);
```

**No changes needed** because:
- ✅ **Same localStorage structure** - `cfPendingOrder` with `orderId`, `mobile`, `movie`, `language`
- ✅ **Same payment verification flow** - calls `/api/verify-payment`
- ✅ **Same Firestore creation** - creates in `movieRequests` collection
- ✅ **Same error handling** - handles all payment states
- ✅ **Same retry logic** - retries pending payments

### 2.6 Add CSS for Request Movie Button

**Add to existing**: `src/components/movie/MovieDashboard.css`

```css
/* ADD these styles to existing CSS file */

/* Request Movie Button */
.request-movie-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 12px;
  width: 100%;
}

.request-movie-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Request Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.request-modal {
  padding: 24px;
}

.movie-details {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.movie-details img {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}
```

### 2.7 Add Environment Variable

**Add to existing**: `.env.local`

```bash
# ADD this line to existing .env.local
VITE_WHATSAPP_ADMIN_NUMBER=919999999999
```

## 3. What Stays the Same (No Changes)

### 3.1 Payment APIs
- ✅ `api/create-payment.js` - **NO CHANGES**
- ✅ `api/verify-payment.js` - **NO CHANGES**
- ✅ Existing payment flow logic - **NO CHANGES**

### 3.2 Dashboard.jsx - NO CHANGES NEEDED!
- ✅ **Payment verification logic** - **NO CHANGES**
- ✅ **localStorage processing** - **NO CHANGES**
- ✅ **Firestore creation** - **NO CHANGES**
- ✅ **Error handling** - **NO CHANGES**
- ✅ **Retry logic** - **NO CHANGES**

### 3.3 Firebase Configuration
- ✅ Existing Firestore setup - **NO CHANGES**
- ✅ Existing authentication - **NO CHANGES**

## 4. Complete Flow for Movie Requests

### 4.1 User Flow
1. **User clicks "Request Movie"** on movie card
2. **Request modal opens** with movie details
3. **User fills language + notes** and submits
4. **Data stored in localStorage** (`cfPendingOrder`) - **SAME STRUCTURE as Dashboard**
5. **Redirect to payment** (Cashfree)
6. **After payment success** → redirect back to Dashboard
7. **Dashboard reads localStorage** → **EXISTING LOGIC** creates movie request
8. **Clear localStorage** → Show success message

### 4.2 localStorage Structure (SAME as Dashboard)
```javascript
// Movie Request - SAME STRUCTURE as existing Dashboard orders
{
  orderId: "cf_order_id_123",      // ← SAME: Set after payment creation
  mobile: "9999999999",            // ← SAME: User phone
  movie: "Movie Title",            // ← SAME: Movie name (use 'movie' field)
  language: "English",              // ← SAME: Language preference
  // Additional movie data (preserved but not used by Dashboard)
  movieId: 12345,
  releaseDate: "2024-01-01",
  overview: "Movie description...",
  posterPath: "/poster.jpg",
  additionalNotes: "User notes...",
  userId: "firebase_uid",
  userEmail: "user@example.com"
}

// Regular Order (existing) - SAME STRUCTURE
{
  orderId: "cf_order_id_123",
  mobile: "9999999999",
  movie: "Movie Title",
  language: "English"
}
```

## 5. Summary of Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `MovieCard.jsx` | **MODIFY** | Add Request Movie button + conditional logic |
| `MovieGrid.jsx` | **MODIFY** | Pass request handler prop |
| `MovieDashboard.jsx` | **MODIFY** | Add request modal + localStorage + payment redirect |
| `RequestMovieModal.jsx` | **NEW** | Create modal component |
| `Dashboard.jsx` | **NO CHANGES** | Existing logic handles movie requests perfectly! |
| `MovieDashboard.css` | **ADD** | Add modal and button styles |
| `.env.local` | **ADD** | WhatsApp admin number |
| `create-payment.js` | **NO CHANGE** | Use existing API as-is |
| `verify-payment.js` | **NO CHANGE** | Use existing API as-is |

## 6. Implementation Order

1. **Create RequestMovieModal.jsx** (new component)
2. **Update MovieCard.jsx** (add button)
3. **Update MovieGrid.jsx** (pass prop)
4. **Update MovieDashboard.jsx** (add modal + localStorage + payment)
5. **Add CSS styles** (styling)
6. **Add environment variable** (WhatsApp number)
7. **Test complete flow** - **Dashboard.jsx works as-is!**

## 7. Key Benefits

- **ZERO changes to Dashboard.jsx** - existing logic works perfectly
- **Exact same flow** as existing Dashboard orders
- **Reuse existing payment logic** - proven and tested
- **No API modifications** - use existing infrastructure
- **Consistent user experience** - same payment flow
- **Easy maintenance** - single payment logic source
- **Data consistency** - movie requests created in existing collection 