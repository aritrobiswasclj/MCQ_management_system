import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [tag, setTag] = useState('');

  // Fetch questions when filters change
  useEffect(() => {
    let url = 'http://localhost:3000/api/questions';
    const params = [];
    if (institutionId) params.push(`institution_id=${institutionId}`);
    if (tag) params.push(`tag=${tag}`);
    if (params.length) url += '?' + params.join('&');

    axios.get(url)
      .then(res => {
        setQuestions(res.data);
        setError('');
      })
      .catch(err => {
        setError('Failed to load questions.');
      });
  }, [institutionId, tag]);

  const getOptionLabel = (i) => ['A', 'B', 'C', 'D', 'E'][i] || '?';

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>All Questions</h1>

      {/* Dropdowns for filtering */}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Institution:
          <select value={institutionId} onChange={e => setInstitutionId(e.target.value)}>
            <option value="">All</option>
            <option value="1">BUET</option>
            <option value="2">CUET</option>
            <option value="3">Dhaka University</option>
          </select>
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Tag:
          <select value={tag} onChange={e => setTag(e.target.value)}>
            <option value="">All</option>
            <option value="easy">easy</option>
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
          </select>
        </label>
      </div>

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