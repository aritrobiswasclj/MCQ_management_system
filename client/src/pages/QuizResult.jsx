import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./QuizResult.css";

const QuizResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Fetch Result and Questions
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const [resultResponse, questionsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/quiz-attempt/${attemptId}/result`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/quiz-attempt/${attemptId}/answers`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setResult(resultResponse.data);
        setQuestions(questionsResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load results");
        setLoading(false);
      }
    };

    fetchResult();

    // Star Canvas Setup
    const canvas = canvasRef.current;

    if (canvas) { // Check if canvas is not null
      const ctx = canvas.getContext("2d");
      let stars = [];
      const numberOfStars = 200;

      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      const createStars = () => {
        stars = [];
        for (let i = 0; i < numberOfStars; i++) {
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            opacity: Math.random(),
          });
        }
      };

      const drawStars = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach((star) => {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.fill();
        });
      };

      resizeCanvas();
      createStars();
      drawStars();

      window.addEventListener("resize", () => {
        resizeCanvas();
        createStars();
        drawStars();
      });

      return () => {
        window.removeEventListener("resize", () => {
          resizeCanvas();
          createStars();
          drawStars();
        });
      };
    }
  }, [attemptId, navigate]);

  if (loading) return <p className="text-white">Loading results...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen relative">
      {/* Star Canvas Background */}
      <canvas
        id="star-canvas"
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-[-1]"
      ></canvas>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 text-white">
        {/* Result Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Quiz Results
          </h1>
        </header>

        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl shadow-lg border border-blue-800/20">
            <h2 className="text-2xl font-semibold mb-2">Score</h2>
            <p className="text-4xl font-bold">{result.score} / {result.total_points}</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl shadow-lg border border-blue-800/20">
            <h2 className="text-2xl font-semibold mb-2">Percentage</h2>
            <p className="text-4xl font-bold">
              {Math.round((result.score / result.total_points) * 100)}%
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl shadow-lg border border-blue-800/20">
            <h2 className="text-2xl font-semibold mb-2">Status</h2>
            <p className={`text-4xl font-bold ${result.passed ? "text-green-400" : "text-red-400"}`}>
              {result.passed ? "PASSED" : "FAILED"}
            </p>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          {questions.map((q, index) => (
            <article
              key={q.question_id}
              className="bg-gradient-to-br from-blue-900/60 via-purple-900/40 to-indigo-900/60 rounded-3xl p-6 shadow-2xl border border-blue-500/30"
            >
              {/* Question Header */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <span className="text-blue-300 mr-2">Q{index + 1}:</span>
                  <span className="flex-1">{q.question_text}</span>
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, optIndex) => {
                  const isCorrect = opt.is_correct;
                  const isSelected = q.selected_option_id === opt.option_id;

                  return (
                    <div
                      key={opt.option_id}
                      className={`
                        flex items-center p-3 rounded-xl border transition-all duration-300
                        ${isCorrect
                          ? "bg-green-500/10 border-green-400/30"
                          : isSelected
                          ? "bg-red-500/10 border-red-400/30"
                          : "bg-gray-800/20 border-gray-700/30"}
                      `}
                    >
                      <span className={`
                        w-7 h-7 flex items-center justify-center rounded-lg font-bold
                        ${isCorrect
                          ? "bg-green-500/80 text-white"
                          : isSelected
                          ? "bg-red-500/80 text-white"
                          : "bg-gray-700/60 text-gray-200"}
                      `}>
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="text-white flex-1">{opt.option_text}</span>
                      {isCorrect && (
                        <span className="text-green-400 text-lg">&#10004;</span> // Checkmark
                      )}
                      {isSelected && !isCorrect && (
                        <span className="text-red-400 text-lg">&#10006;</span> // X mark
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={() => navigate("/quiz-attempt")}
            className="relative px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-semibold shadow-md button-hover"
          >
            <span className="relative z-10">Try Another Quiz</span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="relative px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg text-sm font-semibold shadow-md button-hover"
          >
            <span className="relative z-10">Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
