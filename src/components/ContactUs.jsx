import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";  

const ContactUs = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "Poppins, sans-serif" }}>
      <div className="refund-logo">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="logo" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <span className="logo-icon" style={{ fontSize: 24 }}>🎬</span>
            <span className="logo-text" style={{ fontWeight: "bold", fontSize: 20, marginLeft: 8 }}>MovieHub</span>
          </div>
        </Link>
      </div>

      <h2 style={{ marginBottom: "1rem" }}>Contact Us</h2>

      <p>
        At <strong>MovieHub</strong>, your satisfaction and trust are our top priority.  
        Whether you have questions about your payment, need help with accessing a movie,  
        or simply want to give us feedback — we’re here to help you.  
      </p>

      <h3 style={{ marginTop: "1.5rem" }}>📧 Email Support</h3>
      <p>
        For any inquiries, issues, or feedback, please reach out to us at:  
        <a href="mailto:moviemix456@gmail.com"> moviemix456@gmail.com</a>
      </p>
      <p>
        Our team will respond to your queries within <strong>24–48 business hours</strong>.
      </p>

      <h3 style={{ marginTop: "1.5rem" }}>📱 WhatsApp Support</h3>
      <p>
        You can also message us directly on WhatsApp for quick help:  
        <a href="https://wa.me/917070830015" target="_blank" rel="noreferrer">
          +91 7070830015
        </a>
      </p>
      <p>
        Support is available from <strong>10:00 AM – 7:00 PM (IST), Monday to Saturday</strong>.
      </p>

      <h3 style={{ marginTop: "1.5rem" }}>🏢 Registered Office</h3>
      <p>
        MovieHub<br />
        Patna, Bihar – 800001<br />
        India
      </p>

      <h3 style={{ marginTop: "1.5rem" }}>🛠 Technical Support</h3>
      <p>
        If you face any problems with payments, downloads, or accessing your purchased
        movies, please include the following details when you contact us:
      </p>
      <ul>
        <li>Your full name</li>
        <li>Registered email address / phone number</li>
        <li>Transaction ID (if related to a payment)</li>
        <li>Detailed description of the issue</li>
      </ul>

      <h3 style={{ marginTop: "1.5rem" }}>⏱ Response Time</h3>
      <p>
        We aim to resolve all queries as quickly as possible. In most cases, you can expect a reply within  
        <strong>24 hours</strong> on working days. For payment-related issues, please allow up to <strong>3–5 business days</strong>.
      </p>

      <h3 style={{ marginTop: "1.5rem" }}>🙏 Feedback</h3>
      <p>
        Your feedback helps us improve! If you have suggestions for new features or find any issues,  
        don’t hesitate to share them with us.
      </p>

      <p style={{ marginTop: "2rem", fontWeight: "bold" }}>
        We are committed to providing a smooth and secure movie experience.  
        Thank you for choosing MovieHub!
      </p>
    </div>
  );
};

export default ContactUs;
