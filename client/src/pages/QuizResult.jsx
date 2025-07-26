import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const QuizResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }
        const response = await axios.get(
          `http://localhost:5000/api/quiz-attempt/${attemptId}/result`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResult(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load results");
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId, navigate]);

  if (loading) return <p>Loading results...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Quiz Results</h1>
      <p>
        Score: {result.score} / {result.total_points}
      </p>
      <p>Passed: {result.passed ? "Yes" : "No"}</p>
      <button
        onClick={() => navigate("/quiz-attempt")}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Back to Quizzes
      </button>
    </div>
  );
};

export default QuizResult;
