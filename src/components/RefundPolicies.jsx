// src/pages/RefundPolicies.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./footer.css"; // custom css file

const RefundPolicies = () => {
  return (
    <div className="refund-container">
      <h1>Refund & Cancellation Policy</h1>

      <p>
        At <strong>MovieHub</strong>, we value our users and strive to provide a
        smooth and enjoyable experience while booking or purchasing digital
        content. This Refund & Cancellation Policy explains how refunds and
        cancellations are handled on our platform.
      </p>

      <h2>1. Digital Content</h2>
      <p>
        All payments made towards movie downloads or streaming access are
        <strong> non-refundable</strong> once the content is delivered or made
        accessible. Since these are digital products, they cannot be returned or
        exchanged once accessed.
      </p>

      <h2>2. Payment Errors or Failed Transactions</h2>
      <p>
        If your account is charged but you did not receive access to the content,
        please contact our support team immediately with proof of payment. We will
        investigate and initiate a refund to your original payment method within{" "}
        <strong>7-10 business days</strong>, if found valid.
      </p>

      <h2>3. Duplicate Payments</h2>
      <p>
        In case of accidental duplicate payments, users must notify us within{" "}
        <strong>48 hours</strong>. Verified duplicate charges will be refunded
        within <strong>7-10 business days</strong>.
      </p>

      <h2>4. Cancellation Policy</h2>
      <p>
        As we provide digital and instantly accessible services,{" "}
        <strong>cancellations are not possible once the payment is completed</strong>.
        Please ensure you review your purchase carefully before proceeding with
        the payment.
      </p>

      <h2>5. How to Request a Refund</h2>
      <p>
        To request a refund, please reach out to us at{" "}
        <a href="mailto:moviemix456@gmail.com">moviemix456@gmail.com</a> with the
        following details:
      </p>
      <ul>
        <li>Full Name</li>
        <li>Registered Email ID</li>
        <li>Phone Number</li>
        <li>Transaction ID / Payment Receipt</li>
        <li>Reason for Refund Request</li>
      </ul>

      <h2>6. Contact Support</h2>
      <p>
        If you have any questions or concerns about this Refund & Cancellation
        Policy, please contact our customer support team at{" "}
        <a href="mailto:moviemix456@gmail.com">moviemix456@gmail.com</a> or reach
        out via WhatsApp at{" "}
        <a
          href="https://wa.me/917070830015"
          target="_blank"
          rel="noopener noreferrer"
        >
          +91 7070830015
        </a>
        .
      </p>
    </div>
  );
};

export default RefundPolicies;
