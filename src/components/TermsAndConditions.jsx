import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";

const TermsAndConditions = () => {
  return (
    <div className="terms-container">
      <h1>Terms & Conditions</h1>
      <p>
        Welcome to <span className="highlight">MovieHub</span>. By accessing our
        platform, you agree to abide by the following terms and conditions.
        Please read them carefully before using our services.
      </p>

      <h2>Use of Services</h2>
      <ul>
        <li>
          MovieHub provides users with access to a curated library of movies after
          successful payment.
        </li>
        <li>
          Sharing or distributing purchased content is strictly prohibited and may
          result in account suspension.
        </li>
        <li>
          Users must ensure that their provided information (name, phone number,
          email) is accurate and up to date.
        </li>
      </ul>

      <h2>Payments & Refunds</h2>
      <p>
        All payments are processed securely via Razorpay. Refund and cancellation
        policies are governed by our{" "}
        <Link to="/refund-policies">Refund Policies</Link> and{" "}
        <Link to="/cancellation-policy">Cancellation Policy</Link>.
      </p>

      <h2>User Conduct</h2>
      <ul>
        <li>Users must not misuse the platform for illegal or harmful purposes.</li>
        <li>
          Any fraudulent activity, including payment fraud, may lead to permanent
          account suspension and legal action.
        </li>
      </ul>

      <h2>Liability Disclaimer</h2>
      <p>
        While we strive to provide uninterrupted services, MovieHub is not liable
        for interruptions caused by third-party services, network failures, or
        other external factors beyond our control.
      </p>

      <p>
        For queries, email us at{" "}
        <a href="mailto:moviemix456@gmail.com">moviemix456@gmail.com</a> or
        WhatsApp at{" "}
        <a
          href="https://wa.me/7070830015"
          target="_blank"
          rel="noopener noreferrer"
        >
          +91 7070830015
        </a>.
      </p>

      {/* ✅ Back Button */}
      <Link to="/" className="back-button">
        ⬅ Back to Home
      </Link>
    </div>
  );
};

export default TermsAndConditions;
