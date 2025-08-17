// src/pages/PrivacyPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./footer.css"; 

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <div className="privacy-card">
        <h1>Privacy Policy</h1>
        <p>
          At <strong>Moviemix</strong>, your privacy is our top priority. We are
          committed to protecting your personal data and ensuring transparency in
          how we handle it. This Privacy Policy outlines how we collect, use, and
          safeguard your information when you use our services.
        </p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li>Name, email address, and phone number when you create an account.</li>
          <li>Payment details processed securely via <strong>Razorpay</strong>.</li>
          <li>Activity data (such as searched movies and order history).</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To process and confirm your movie orders.</li>
          <li>To communicate important updates and order status.</li>
          <li>To improve our platform and user experience.</li>
          <li>To comply with legal and financial obligations.</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>
          We do not sell or rent your personal data to third parties. Your data may
          only be shared with:
        </p>
        <ul>
          <li>Payment gateway partners (Razorpay) for secure transactions.</li>
          <li>Law enforcement authorities, if required by law.</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We use industry-standard encryption and security measures to protect your
          personal data. While we strive to ensure complete security, please note
          that no online system is 100% secure.
        </p>

        <h2>5. Your Rights</h2>
        <ul>
          <li>You can request access to your personal data stored with us.</li>
          <li>You can request correction or deletion of your data.</li>
          <li>You can opt out of marketing communications at any time.</li>
        </ul>

        <h2>6. Contact Us</h2>
        <p>
          If you have any questions regarding this Privacy Policy, feel free to
          contact us at:
          <br />
          📧 <a href="mailto:moviemix456@gmail.com">moviemix456@gmail.com</a>
          <br />
          📞 +91 7070830015
        </p>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
