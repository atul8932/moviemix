import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

const HollywoodMovies = () => {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontFamily: "Poppins, sans-serif" }}>Hollywood</h1>
        <Link className="btn btn-secondary" to="/">← Back</Link>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "var(--shadow-md)", padding: 24 }}>
        <p>This is a placeholder page for Hollywood movies. Content will be added here.</p>
      </div>
    </div>
  );
};

export default HollywoodMovies; 