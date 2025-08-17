import React from "react";
import { Link } from "react-router-dom";
import "./footer.css"; // Import CSS file

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Side - Branding */}
        <div className="footer-left">
          <h2 className="footer-logo">MovieMix</h2>
          <p>Your go-to platform for movies and entertainment.</p>
        </div>

        {/* Right Side - Links */}
        <div className="footer-right">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/terms-and-conditions">Terms & Conditions</Link></li>
            <li><Link to="/refund-policies">Refund Policies</Link></li>
            <li><Link to="/privacy-policies">Privacy Policies</Link></li>
            <li><Link to="/cancellation-policy">Cancellation Policy</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MovieMix. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
