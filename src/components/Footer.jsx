import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer style={{
      width: "100%",
      padding: "16px 24px",
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "saturate(180%) blur(8px)",
      color: "#fff",
      position: "relative",
      zIndex: 10,
      borderTop: "1px solid rgba(255,255,255,0.2)",
      display: "flex",
      justifyContent: "center"
    }}>
      <nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Link className="btn btn-text white-text" to="/privacy">Privacy Policy</Link>
        <span style={{ opacity: 0.6 }}>|</span>
        <Link className="btn btn-text white-text" to="/refund-cancellation">Refund & cancellation policy</Link>
        <span style={{ opacity: 0.6 }}>|</span>
        <Link className="btn btn-text white-text" to="/terms">Terms & conditions</Link>
        <span style={{ opacity: 0.6 }}>|</span>
        <Link className="btn btn-text white-text" to="/contact">Contact us</Link>
      </nav>
    </footer>
  );
};

export default Footer; 