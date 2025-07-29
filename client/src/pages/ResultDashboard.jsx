import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResultDashboard.css';

const ResultDashboard = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlyMe, setOnlyMe] = useState(false);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view rankings');
          setLoading(false);
          return;
        }

        // Fetch quiz title
        const quizResponse = await axios.get(`http://localhost:5000/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizTitle(quizResponse.data.quiz_title);

        // Fetch rankings
        const rankingsResponse = await axios.get(
          `http://localhost:5000/api/quiz/${quizId}/rankings${onlyMe ? '?onlyMe=true' : ''}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRankings(rankingsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rankings:', err);
        setError(err.response?.data?.error || 'Failed to load rankings');
        setLoading(false);
      }
    };

    fetchRankings();
  }, [quizId, onlyMe]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="result-dashboard">
      <h2>Rankings for {quizTitle}</h2>
      <div className="filter-container">
        <label className="only-me-checkbox">
          <input
            type="checkbox"
            checked={onlyMe}
            onChange={(e) => setOnlyMe(e.target.checked)}
          />
          Show Only My Rank
        </label>
      </div>
      {rankings.length === 0 ? (
        <p>No rankings available for this quiz.</p>
      ) : (
        <table className="rankings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Best Score</th>
              <th>Attempts</th>
              <th>Best Attempt Date</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((entry) => (
              <tr key={entry.username} className={onlyMe ? 'highlight' : ''}>
                <td>{entry.rank}</td>
                <td>{entry.username}</td>
                <td>{entry.best_score}</td>
                <td>{entry.attempt_count}</td>
                <td>{new Date(entry.best_attempt_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={() => navigate('/profile')} className="back-button">
        Back to Profile
      </button>
    </div>
  );
};

export default ResultDashboard;