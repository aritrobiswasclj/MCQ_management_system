import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/api/questions')
      .then(res => setQuestions(res.data))
      .catch(err => {
        console.error(err);
        setError('Failed to load questions.');
      });
  }, []);

  const getOptionLabel = (i) => ['A', 'B', 'C', 'D'][i] || '?';

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Available Quiz Questions</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {questions.map((q, idx) => (
        <div key={q.question_id} style={{ marginBottom: '1.5rem' }}>
          <h3>Q{idx + 1}. {q.question_text}</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {q.options.map((opt, i) => (
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
