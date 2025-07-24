import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { Tilt } from 'react-tilt';
import './QuizAttempt.css';

export default function QuizAttempt() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        // Fetch user profile, categories, institutions, and tags
        const [profileResponse, categoriesResponse, institutionsResponse, tagsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/profile', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/categories', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/institutions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/tags', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUser(profileResponse.data.user || {});
        setCategories(categoriesResponse.data || []);
        setInstitutions(institutionsResponse.data || []);
        setTags(tagsResponse.data || []);

        // Fetch quizzes
        await fetchQuizzes();
      } catch (err) {
        console.error('Fetch initial data error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError(err.response?.data?.error || 'Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedInstitution) params.institution_id = selectedInstitution;
      if (selectedTag) params.tags = selectedTag; // Single tag ID

      const quizzesResponse = await axios.get('http://localhost:5000/api/quizzes/available', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setQuizzes(quizzesResponse.data || []);
      setError(null);
    } catch (err) {
      console.error('Fetch quizzes error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        params,
      });
      setError(err.response?.data?.details || err.response?.data?.error || 'Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [selectedCategory, selectedInstitution, selectedTag]);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedInstitution('');
    setSelectedTag('');
  };

  const handleQuizSelect = (quizId) => {
    navigate(`/quiz-attempt/${quizId}`);
  };

  return (
    <div className="quiz-attempt-page container mx-auto px-4 py-6 max-w-6xl">
      <Tilt className="card flex justify-between items-center border-b border-gray-700 pb-4 mb-6" options={{ max: 15, scale: 1.02 }}>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-100">Select a Quiz to Attempt</h1>
      </Tilt>

      {/* Filter Buttons */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Filter Quizzes</h2>
          <button
            onClick={handleClearFilters}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all"
          >
            Clear Filters
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.length === 0 && <p className="text-gray-400 text-sm">No categories available.</p>}
              {categories.map((cat) => (
                <button
                  key={cat.category_id}
                  onClick={() => setSelectedCategory(cat.category_id === selectedCategory ? '' : cat.category_id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === cat.category_id
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-700 text-gray-100 border border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  {cat.category_name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Institutions</label>
            <div className="flex flex-wrap gap-2">
              {institutions.length === 0 && <p className="text-gray-400 text-sm">No institutions available.</p>}
              {institutions.map((inst) => (
                <button
                  key={inst.institution_id}
                  onClick={() => setSelectedInstitution(inst.institution_id === selectedInstitution ? '' : inst.institution_id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedInstitution === inst.institution_id
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-700 text-gray-100 border border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  {inst.institution_name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 && <p className="text-gray-400 text-sm">No tags available.</p>}
              {tags.map((tag) => (
                <button
                  key={tag.tag_id}
                  onClick={() => setSelectedTag(tag.tag_id === selectedTag ? '' : tag.tag_id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTag === tag.tag_id
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-700 text-gray-100 border border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  {tag.tag_name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && <p className="text-gray-400 text-center">Loading quizzes...</p>}

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && quizzes.length === 0 && (
        <p className="text-gray-400 text-center">No quizzes available to attempt.</p>
      )}

      {!loading && !error && quizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <Tilt key={quiz.quiz_id} className="card" options={{ max: 15, scale: 1.02 }}>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-100 mb-2">{quiz.quiz_title}</h3>
                <p className="text-gray-400 text-sm mb-2">{quiz.description || 'No description'}</p>
                <p className="text-gray-400 text-sm mb-2">Institution: {quiz.institution_name || 'N/A'}</p>
                <p className="text-gray-400 text-sm mb-2">
                  Time Limit: {quiz.time_limit ? `${quiz.time_limit} minutes` : 'None'}
                </p>
                <p className="text-gray-400 text-sm mb-2">
                  Pass Percentage: {quiz.pass_percentage ? `${quiz.pass_percentage}%` : 'N/A'}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Match Score: {quiz.match_percentage.toFixed(2)}%
                </p>
                <button
                  onClick={() => handleQuizSelect(quiz.quiz_id)}
                  className="bg-gradient-to-r from-amber-600 to-amber-800 text-white px-6 py-2 rounded-lg hover:from-amber-500 hover:to-amber-700 transition-all flex items-center"
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2" />
                  Attempt Quiz
                </button>
              </div>
            </Tilt>
          ))}
        </div>
      )}
    </div>
  );
}