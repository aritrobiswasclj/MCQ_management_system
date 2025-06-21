import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/api/questions')
      .then(res => {
        console.log("Fetched questions:", res.data);
        setQuestions(res.data);
      })
      .catch(err => {
        console.error("API error:", err);
        setError('Failed to load questions.');
      });
  }, []);

  const getOptionLabel = (i) => ['A', 'B', 'C', 'D', 'E'][i] || '?';

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>All Questions</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {questions.length === 0 && !error && (
        <p>Loading... or no questions found.</p>
      )}

      {questions.length > 0 && questions.map((q, idx) => (
        <div key={q.question_id} style={{ marginBottom: '2rem' }}>
          <h3>Q{idx + 1}. {q.question_text}</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {q.options && q.options.map((opt, i) => (
              <li key={opt.option_id}>
                <strong>{getOptionLabel(i)}.</strong> {opt.option_text}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;
