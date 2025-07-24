import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile"; // Matches profile.jsx
import QuestionCreation from './pages/QuestionCreation'
import HomePage from './pages/HomePage'
import QuizCreation from "./pages/QuizCreation";
import QuizAttempt from "./pages/QuizAttempt";

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
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<div>About</div>} />
        <Route path="/contact" element={<div>Contact</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
        <Route path="/question-creation" element={<QuestionCreation />} />
        <Route path="/quiz-creation" element={<QuizCreation />} />
        <Route path="/quiz-attempt" element={<QuizAttempt />} />
      </Routes>
    </Router>
  );
}

export default App;
