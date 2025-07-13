


/* import React, { useState } from 'react';
import QuizPage from './QuizPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  const [page, setPage] = useState('home');

  return (
    <div>
      <nav style={{ padding: 12 }}>
        <button onClick={() => setPage('home')}>Home</button>
        <button onClick={() => setPage('quiz')}>Take Quiz</button>
        <button onClick={() => setPage('admin')}>Admin</button>
      </nav>

      {page === 'home' && <div style={{ padding: '2rem' }}>
        <h1>MCQ Quiz System</h1>
        <p>Welcome! Use the nav to explore.</p>
      </div>}

      {page === 'quiz' && <QuizPage />}
      {page === 'admin' && <AdminPage />}
    </div>
  );
} */

/* import React from 'react';
import Login from './pages/Login.jsx';

function App() {
  return (
    <div>
      <Login />
    </div>
    
  );
}

export default App; */

// client/src/App.jsx



import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
// Import additional pages for role-based navigation
//import AdminDashboard from './pages/AdminDashboard.jsx';
//import TeacherDashboard from './pages/TeacherDashboard.jsx';
//import StudentDashboard from './pages/StudentDashboard.jsx';
//import Homepage from './pages/Homepage.jsx';
//import About from './pages/About.jsx';
//import Contact from './pages/Contact.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/*
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        */}
        {/* Protected Routes - Role-based dashboards 
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        */}
        {/* Fallback route */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}







