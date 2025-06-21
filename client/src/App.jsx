import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/quizzes')
      .then(res => setQuizzes(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h1>Available Quizzes</h1>
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.quiz_id}>{quiz.quiz_title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
