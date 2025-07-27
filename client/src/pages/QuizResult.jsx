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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Quiz Results</h1>

          {/* Score Card */}
          <div className="bg-white/5 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <h3 className="text-lg text-gray-300 mb-2">Score</h3>
                <p className="text-3xl font-bold">
                  {result.score} / {result.total_points}
                </p>
              </div>
              <div className="p-4">
                <h3 className="text-lg text-gray-300 mb-2">Percentage</h3>
                <p className="text-3xl font-bold">
                  {Math.round((result.score / result.total_points) * 100)}%
                </p>
              </div>
              <div className="p-4">
                <h3 className="text-lg text-gray-300 mb-2">Status</h3>
                <p
                  className={`text-3xl font-bold ${
                    result.passed ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result.passed ? "PASSED" : "FAILED"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/quiz-attempt")}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Try Another Quiz
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
