


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
import Register from './pages/Register.jsx';  // 👈 import register page

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div><Login /></div>} />          {/* login at root */}
        <Route path="/register" element={<Register />} /> {/* register page */}
      </Routes>
    </Router>
  );
}








