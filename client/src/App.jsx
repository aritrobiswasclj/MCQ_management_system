/* import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [institutionId, setInstitutionId] = useState(''); // NEW

  // Fetch questions when institutionId changes
  useEffect(() => {
    let url = 'http://localhost:3000/api/questions';
    if (institutionId) {
      url += `?institution_id=${institutionId}`;
    }
    axios.get(url)
      .then(res => setQuestions(res.data))
      .catch(err => console.error('Failed to load questions', err));
  }, [institutionId]); // <-- add institutionId as dependency

  const getOptionLabel = (i) => ['A', 'B', 'C', 'D'][i] || '?';

  const handleSelect = (qid, optionId) => {
    if (!submitted) {
      setAnswers(prev => ({ ...prev, [qid]: optionId }));
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach(q => {
      const correctOpt = q.options.find(o => o.is_correct);
      if (correctOpt && answers[q.question_id] === correctOpt.option_id) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Quiz: Electricity & Magnetism</h1>

      {/* Institution Dropdown *///}
/*       <div style={{ marginBottom: '1rem' }}>
        <label>
          Institution:&nbsp;
          <select value={institutionId} onChange={e => setInstitutionId(e.target.value)}>
            <option value="">All Institutions</option>
            <option value="1">BUET</option>
            <option value="2">CUET</option>
            <option value="3">Dhaka University</option>
          </select>
        </label>
      </div>

      {questions.map((q, idx) => (
        <div key={q.question_id} style={{ marginBottom: '1.5rem' }}>
          <h3>Q{idx + 1}. {q.question_text}</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {q.options.map((opt, i) => {
              const selected = answers[q.question_id] === opt.option_id;
              const isCorrect = opt.is_correct && submitted;
              const isWrong = selected && !opt.is_correct && submitted;

              return (
                <li
                  key={opt.option_id}
                  onClick={() => handleSelect(q.question_id, opt.option_id)}
                  style={{
                    cursor: 'pointer',
                    padding: '5px 10px',
                    backgroundColor: isCorrect
                      ? '#d4edda'
                      : isWrong
                      ? '#f8d7da'
                      : selected
                      ? '#e2e3e5'
                      : '#f9f9f9',
                    borderRadius: '4px',
                    border: selected ? '2px solid #333' : '1px solid #ccc',
                    marginBottom: '5px'
                  }}
                >
                  <strong>{getOptionLabel(i)}.</strong> {opt.option_text}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          style={{ padding: '10px 20px', fontWeight: 'bold', backgroundColor: '#4CAF50', color: 'white' }}
        >
          Submit
        </button>
      )}

      {submitted && (
        <div style={{ marginTop: '20px', fontSize: '18px' }}>
          ✅ Your Score: {score} out of {questions.length}
        </div>
      )}
    </div>
  );
}

export default App; */


import React, { useState } from 'react';
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
}
