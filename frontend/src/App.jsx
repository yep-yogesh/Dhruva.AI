import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css"; // Tailwind entry file

// Pages
import DhruvaLanding from "./pages/dhruvaLanding";
import DhruvaChat from "./pages/dhruvaChat";
import ImproveDhruva from "./pages/dhruvaImprove";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DhruvaLanding />} />
        <Route path="/chat" element={<DhruvaChat />} />
        <Route path="/improve" element={<ImproveDhruva />} />
      </Routes>
    </Router>
  );
};

export default App;
