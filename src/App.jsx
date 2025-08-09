import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import WaitingPage from "./components/WaitingPage";
import AdminPanel from "./components/AdminPanel";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Dynamic route to show waiting page based on mobile number */}
        <Route path="/waiting/:mobile" element={<WaitingPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
};

export default App;
