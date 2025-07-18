import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile"; // Matches profile.jsx
import QuestionCreation from './pages/QuestionCreation'

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    console.log("ProtectedRoute token:", token);
    if (!token) {
      console.log("No token in ProtectedRoute, redirecting to login");
      return <Navigate to="/login" replace />;
    }
    return children;
  };

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/about" element={<div>About</div>} />
        <Route path="/contact" element={<div>Contact</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
        <Route path="/question-creation" element={<QuestionCreation />} />
      </Routes>
    </Router>
  );
}

export default App;
