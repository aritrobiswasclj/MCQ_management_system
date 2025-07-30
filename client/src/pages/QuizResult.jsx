import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import './QuizResult.css';

const QuizResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const starCanvasRef = useRef(null);
  const vennCanvasRef = useRef(null);

  useEffect(() => {
    // Fetch Result and Questions
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        const [resultResponse, questionsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/quiz-attempt/${attemptId}/result`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/api/quiz-attempt/${attemptId}/answers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setResult(resultResponse.data);
        setQuestions(questionsResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load results');
        setLoading(false);
      }
    };

    fetchResult();

    // Star Canvas Setup
    const starCanvas = starCanvasRef.current;
    if (starCanvas) {
      const ctx = starCanvas.getContext('2d');
      let stars = [];
      const numberOfStars = 200;

      const resizeStarCanvas = () => {
        starCanvas.width = window.innerWidth;
        starCanvas.height = window.innerHeight;
      };

      const createStars = () => {
        stars = [];
        for (let i = 0; i < numberOfStars; i++) {
          stars.push({
            x: Math.random() * starCanvas.width,
            y: Math.random() * starCanvas.height,
            size: Math.random() * 2 + 1,
            opacity: Math.random(),
          });
        }
      };

      const drawStars = () => {
        ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
        stars.forEach((star) => {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.fill();
        });
      };

      resizeStarCanvas();
      createStars();
      drawStars();

      window.addEventListener('resize', () => {
        resizeStarCanvas();
        createStars();
        drawStars();
      });

      return () => {
        window.removeEventListener('resize', () => {
          resizeStarCanvas();
          createStars();
          drawStars();
        });
      };
    }
  }, [attemptId, navigate]);

  useEffect(() => {
    // Venn Diagram Setup
    const vennCanvas = vennCanvasRef.current;
    if (vennCanvas && questions.length > 0) {
      const ctx = vennCanvas.getContext('2d');
      const width = vennCanvas.width;
      const height = vennCanvas.height;

      // Calculate statistics
      const totalQuestions = questions.length;
      const correct = questions.filter((q) => q.options.some((opt) => opt.is_correct && q.selected_option_id === opt.option_id)).length;
      const incorrect = questions.filter((q) => q.selected_option_id && !q.options.some((opt) => opt.is_correct && q.selected_option_id === opt.option_id)).length;
      const notAttempted = totalQuestions - correct - incorrect;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw Venn diagram (three overlapping circles)
      const radius = Math.min(width, height) / 4;
      const centerX1 = width / 4;
      const centerX2 = width / 2;
      const centerX3 = (3 * width) / 4;
      const centerY = height / 2;

      // Correct (Green)
      ctx.beginPath();
      ctx.arc(centerX1, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74, 222, 128, 0.5)';
      ctx.fill();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Correct: ${correct}`, centerX1, centerY);

      // Incorrect (Red)
      ctx.beginPath();
      ctx.arc(centerX2, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(248, 113, 113, 0.5)';
      ctx.fill();
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Incorrect: ${incorrect}`, centerX2, centerY);

      // Not Attempted (Yellow)
      ctx.beginPath();
      ctx.arc(centerX3, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.5)';
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Not Attempted: ${notAttempted}`, centerX3, centerY);
    }
  }, [questions]);

  if (loading) return <p className="text-white text-center text-xl">Loading results...</p>;
  if (error) return <p className="text-red-500 text-center text-xl">Error: {error}</p>;

  return (
    <div className="quiz-result-page">
      <NavBar />
      <canvas
        id="star-canvas"
        ref={starCanvasRef}
        className="fixed top-0 left-0 w-full h-full z-[-1]"
      ></canvas>
      <div className="container mx-auto px-4 py-12">
        <header className="quiz-result-header">
          <h1><i className="fas fa-trophy mr-2"></i>Quiz Results</h1>
        </header>
        <section className="quiz-result-section">
          <h2>Performance Overview</h2>
          <canvas ref={vennCanvasRef} className="venn-canvas" width="600" height="200"></canvas>
          <div className="score-grid">
            <div className="score-card">
              <h3><i className="fas fa-star mr-2"></i>Score</h3>
              <p>{result.score} / {result.total_points}</p>
            </div>
            <div className="score-card">
              <h3><i className="fas fa-percentage mr-2"></i>Percentage</h3>
              <p>{Math.round((result.score / result.total_points) * 100)}%</p>
            </div>
            <div className="score-card">
              <h3><i className={`fas ${result.passed ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>Status</h3>
              <p className={result.passed ? 'text-green-400' : 'text-red-400'}>
                {result.passed ? 'PASSED' : 'FAILED'}
              </p>
            </div>
          </div>
        </section>
        <section className="quiz-result-section">
          <h2>Question Review</h2>
          <div className="question-list">
            {questions.map((q, index) => (
              <article key={q.question_id} className="question-card">
                <div className="question-header">
                  <span className="question-number">Q{index + 1}:</span>
                  <span className="question-text">{q.question_text}</span>
                </div>
                <div className="option-grid">
                  {q.options.map((opt, optIndex) => {
                    const isCorrect = opt.is_correct;
                    const isSelected = q.selected_option_id === opt.option_id;
                    return (
                      <div
                        key={opt.option_id}
                        className={`option-card ${isCorrect ? 'correct' : isSelected ? 'incorrect' : ''}`}
                      >
                        <span className="option-letter">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="option-text">{opt.option_text}</span>
                        {isCorrect && <i className="fas fa-check text-green-400"></i>}
                        {isSelected && !isCorrect && <i className="fas fa-times text-red-400"></i>}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
        <div className="action-buttons">
          <button onClick={() => navigate('/quiz-attempt')} className="action-button primary">
            <i className="fas fa-redo mr-2"></i>Try Another Quiz
          </button>
          <button onClick={() => navigate('/profile')} className="action-button secondary">
            <i className="fas fa-home mr-2"></i>Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;