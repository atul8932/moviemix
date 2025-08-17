import React from "react";
import "./footer.css"; // ✅ use the same CSS file as Terms page
import { Link } from "react-router-dom";

const CancellationPolicy = () => {
  return (
    <div className="terms-container">
      <div className="refund-logo">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="logo" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <span className="logo-icon" style={{ fontSize: 24 }}>🎬</span>
            <span className="logo-text" style={{ fontWeight: "bold", fontSize: 20, marginLeft: 8 }}>MovieHub</span>
          </div>
        </Link>
      </div>
      <h1>Cancellation Policy</h1>
      <p>
        At <span className="highlight">MovieHub</span>, we aim to provide a smooth
        and transparent process for our users. Since our platform primarily deals
        with digital movie content access, cancellations are subject to certain rules.
      </p>

      <h2>Key Points</h2>
      <ul>
        <li>
          Once a payment is successfully completed, <strong>cancellation is not
          applicable</strong> as digital movie content access is instantly
          initiated.
        </li>
        <li>
          If you believe your payment was processed by mistake or without consent,
          please contact our support team within <strong>24 hours</strong>.
        </li>
        <li>
          In case of double payment due to a technical error, you will be eligible
          for a full refund of the duplicate transaction.
        </li>
        <li>
          For any disputes, kindly reach out to{" "}
          <a href="mailto:moviemix456@gmail.com">moviemix456@gmail.com</a>.
        </li>
      </ul>

      <h2>Customer Responsibility</h2>
      <p>
        Before completing the payment, please review your movie selection carefully.
        Once confirmed, the order cannot be altered or canceled.
      </p>

      <p>
        For any further clarifications, you can contact our support team via
        WhatsApp:{" "}
        <a
          href="https://wa.me/7070830015"
          target="_blank"
          rel="noopener noreferrer"
        >
          +91 7070830015
        </a>.
      </p>
    </div>
  );
};

export default CancellationPolicy;
