
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import QuestionCreation from './pages/QuestionCreation';
import HomePage from './pages/HomePage';
import QuizCreation from "./pages/QuizCreation";
import QuizAttempt from "./pages/QuizAttempt";
import QuestionLoader from './pages/QuestionLoader';
import QuizResult from './pages/QuizResult'; // Add import for QuizResult

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
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/question-creation" element={<ProtectedRoute><QuestionCreation /></ProtectedRoute>} />
        <Route path="/quiz-creation" element={<ProtectedRoute><QuizCreation /></ProtectedRoute>} />
        <Route path="/quiz-attempt" element={<ProtectedRoute><QuizAttempt /></ProtectedRoute>} />
        <Route path="/quiz-attempt/:quizId" element={<ProtectedRoute><QuestionLoader /></ProtectedRoute>} />
        <Route path="/quiz-result/:attemptId" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
