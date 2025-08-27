import React from "react";
import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import WaitingPage from "./components/WaitingPage";
import AdminPanel from "./components/AdminPanel";
import MovieDashboard from "./components/movie/MovieDashboard";

import ContactUs from "./components/ContactUs";
import CancellationPolicy from "./components/CancellationPolicy";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Footer from "./components/Footer";
import RefundPolicies from "./components/RefundPolicies";
import TermsAndConditions from "./components/TermsAndConditions";
import Checkout from "./components/Checkout";

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/waiting/:mobile" element={<WaitingPage />} />
          <Route path="/waiting" element={<WaitingPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/refund-policies" element={<RefundPolicies />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/privacy-policies" element={<PrivacyPolicy />} />
          <Route path="/bollywood" element={<MovieDashboard />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          {/* New route for testing checkout */}
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>

      {/* Show footer everywhere except dashboard */}
      {location.pathname !== "/dashboard" && <Footer />}
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
