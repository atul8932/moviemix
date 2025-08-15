import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const Home = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    // For demo purposes, just navigate to dashboard
    // In real app, you'd authenticate with Firebase Auth
    navigate("/dashboard");
  };

  const handleInputChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">MovieHub</span>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-text" 
            onClick={() => setShowAuthModal(true)}
          >
            Login
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setAuthTab("signup");
              setShowAuthModal(true);
            }}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Download Your Movies, Anytime, Anywhere
          </h1>
          <p className="hero-subtitle">
            Request movies optimized for your device. Get them in minutes.
          </p>
          <button className="btn btn-primary btn-large" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
        <div className="hero-background">
          <div className="movie-collage"></div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Welcome to MovieHub</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowAuthModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${authTab === "login" ? "active" : ""}`}
                onClick={() => setAuthTab("login")}
              >
                Login
              </button>
              <button 
                className={`auth-tab ${authTab === "signup" ? "active" : ""}`}
                onClick={() => setAuthTab("signup")}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="auth-form">
              {authTab === "signup" && (
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={authForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required={authTab === "signup"}
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {authTab === "login" && (
                <div className="form-footer">
                  <a href="#" className="forgot-password">Forgot password?</a>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full">
                {authTab === "login" ? "Login" : "Sign Up"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
