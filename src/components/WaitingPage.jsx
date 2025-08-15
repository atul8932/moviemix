import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "./styles.css";

const WaitingPage = () => {
  const { mobile } = useParams();
  const [request, setRequest] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "movieRequests"), where("mobile", "==", mobile));

    // Real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setRequest(data);
        
        // Check if download is ready
        if (data.downloadLink) {
          setIsReady(true);
        }
      }
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, [mobile]);

  useEffect(() => {
    if (timeLeft > 0 && !isReady) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isReady]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((300 - timeLeft) / 300) * 100;

  if (!request) {
    return (
      <div className="waiting-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading request details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="waiting-container">
      <div className="waiting-content">
        {/* Countdown Timer */}
        <div className="countdown-section">
          <div className="countdown-circle">
            <svg className="countdown-svg" viewBox="0 0 120 120">
              <circle
                className="countdown-bg"
                cx="60"
                cy="60"
                r="54"
                strokeWidth="8"
              />
              <circle
                className="countdown-progress"
                cx="60"
                cy="60"
                r="54"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progressPercentage / 100)}`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="countdown-text">
              {isReady ? (
                <div className="ready-text">
                  <span className="ready-icon">🎉</span>
                  <span className="ready-label">Ready!</span>
                </div>
              ) : (
                <>
                  <span className="time-display">{formatTime(timeLeft)}</span>
                  <span className="time-label">remaining</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="status-card">
          <h2>Movie Request Details</h2>
          <div className="request-details">
            <div className="detail-row">
              <span className="detail-label">Movie Name:</span>
              <span className="detail-value">{request.movieName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Mobile Model:</span>
              <span className="detail-value">{request.mobile}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="detail-value">
                {request.paymentStatus === "success" ? "✅ Payment Complete" : "⏳ Processing"}
              </span>
            </div>
          </div>
          
          {!isReady && (
            <div className="processing-note">
              <p>Processing your request. Please don't close this page.</p>
            </div>
          )}
        </div>

        {/* Download Section */}
        {isReady && (
          <div className="download-section">
            <div className="download-card">
              <h3>🎉 Your download is ready!</h3>
              <p className="download-note">Optimized for your device</p>
              <a 
                href={request.downloadLink} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-primary btn-large download-btn"
              >
                Download Movie
              </a>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="back-section">
          <button 
            onClick={() => navigate("/dashboard")}
            className="btn btn-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;
