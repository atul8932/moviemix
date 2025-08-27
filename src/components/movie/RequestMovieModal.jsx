import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const RequestMovieModal = ({ movie, isOpen, onClose, onSubmit }) => {
  const [user, setUser] = useState(null);
  
  // Use Firebase auth directly (same as Dashboard.jsx)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);
  
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