import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

const OTTMovies = () => {
  return (
    <div style={{ padding: 24 }}>
     <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      {/* Logo on the left */}
      <div style={{ flex: "1", display: "flex", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="logo" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <span className="logo-icon">🎬</span>
            <span className="logo-text">MovieHub</span>
          </div>
        </Link>
      </div>

      {/* Centered Bollywood heading */}
      <div style={{ flex: "1", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Poppins, sans-serif", margin: 0 }}>OTT Originals</h1>
      </div>

      {/* Back button on the right */}
      <div style={{ flex: "1", display: "flex", justifyContent: "flex-end" }}>
        <Link className="btn btn-secondary" to="/">
          ← Back
        </Link>
      </div>
    </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "var(--shadow-md)", padding: 24 }}>
        <p>This is a placeholder page for OTT Originals. Content will be added here.</p>
      </div>
    </div>
  );
};

export default OTTMovies; 