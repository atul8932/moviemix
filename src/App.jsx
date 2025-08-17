import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import WaitingPage from "./components/WaitingPage";
import AdminPanel from "./components/AdminPanel";
import BollywoodMovies from "./components/bollywood/BollywoodMovies";
import HollywoodMovies from "./components/hollywood/HollywoodMovies";
import OTTMovies from "./components/ott/OTTMovies";
import Contact from "./components/Contact";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import RefundCancellation from "./components/RefundCancellation";
import News from "./components/news/News";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/waiting/:mobile" element={<WaitingPage />} />
        <Route path="/waiting" element={<WaitingPage />} />
        <Route path="/bollywood" element={<BollywoodMovies />} />
        <Route path="/hollywood" element={<HollywoodMovies />} />
        <Route path="/ott" element={<OTTMovies />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund-cancellation" element={<RefundCancellation />} />
        <Route path="/news" element={<News />} />
      </Routes>
    </Router>
  );
};

export default App;
