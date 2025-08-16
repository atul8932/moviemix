import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import WaitingPage from "./components/WaitingPage";
import AdminPanel from "./components/AdminPanel";
import BollywoodMovies from "./components/bollywood/BollywoodMovies";
import HollywoodMovies from "./components/hollywood/HollywoodMovies";
import OTTMovies from "./components/ott/OTTMovies";

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
      </Routes>
    </Router>
  );
};

export default App;
