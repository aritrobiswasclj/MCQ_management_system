import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile'; // Matches profile.jsx

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register/>} />
        <Route path="/about" element={<div>About</div>} />
        <Route path="/contact" element={<div>Contact</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;