import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./styles.css";
import { Analytics } from '@vercel/analytics/react';



const Home = () => {
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/dashboard");
    });
    return () => unsub();
  }, [navigate]);

    const handleGetStarted = () => navigate("/login");

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">MovieHub</span>
        </div>
        <nav className="header-links" style={{ display: "flex", gap: 16 }}>
          <Link className="btn btn-text white-text" to="/bollywood?section=bollywood" >Bollywood</Link>
          <Link className="btn btn-text white-text" to="/bollywood?section=hollywood">Hollywood</Link>
          <Link className="btn btn-text white-text" to="/bollywood?section=ott-en">OTT Originals (EN)</Link>
          <Link className="btn btn-text white-text" to="/bollywood?section=ott-hi">OTT Originals (HI)</Link>
        </nav>
        <div className="header-actions">
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/login" className="btn btn-primary">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Download Your Movies, Anytime, Anywhere</h1>
          <p className="hero-subtitle">Request movies optimized for your device. Get them in minutes.</p>
          <div className="offer-card">
            <span className="offer-badge">🔥 Limited-time Offer</span>
            <h3 className="offer-title">Download Movies for Just ₹6 – Say Goodbye to Expensive OTT Subscriptions!</h3>
            <div className="offer-divider"></div>
            <p className="offer-text">
              Tired of juggling multiple OTT platforms and paying high monthly fees? Discover a smarter way to watch your favorite movies by downloading them for just ₹6! Enjoy blockbuster entertainment on your own terms without burning a hole in your pocket. This affordable solution could change how you consume content—no more subscriptions, no more limits. Just pay per movie and watch anytime, anywhere.
            </p>
          </div>

          <div className="offer-row">
            <div className="offer-mini-card">
              <h4 className="offer-mini-title">Pay-Per-Movie Convenience</h4>
              <p className="offer-mini-text">No long-term commitments. Pay only for what you watch and enjoy it offline anytime.</p>
            </div>
            <div className="offer-mini-card">
              <h4 className="offer-mini-title">Optimized for Your Device</h4>
              <p className="offer-mini-text">We tailor downloads for better quality and smaller file size across phones and tablets.</p>
            </div>
          </div>
          <button className="btn btn-primary btn-large margin-started" onClick={handleGetStarted}>Get Started</button>
        </div>
        <div className="hero-background">
          <div className="movie-collage"></div>
        </div>
      </main>

      <Analytics />
    </div>
  );
};

export default Home;
