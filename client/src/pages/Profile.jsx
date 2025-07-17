import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faCrown, faExclamationTriangle, faStar, faInfoCircle, faChevronLeft, faChevronRight, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Tilt } from 'react-tilt';
import md5 from 'md5';
import './Profile.css';

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>Error: {this.state.error}</div>;
    }
    return this.props.children;
  }
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {
        user_id: null,
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'student',
        created_at: null,
        last_login: null,
        updated_at: null,
      };
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      return {
        user_id: null,
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'student',
        created_at: null,
        last_login: null,
        updated_at: null,
      };
    }
  });
  const [examHistory, setExamHistory] = useState([]);
  const [preferredMusic, setPreferredMusic] = useState([]);
  const [categories, setCategories] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [showBottomBar, setShowBottomBar] = useState(false);
  // Question creation state
  const [question, setQuestion] = useState({
    question_text: '',
    category_id: '',
    institution_id: '',
    difficulty_level: 1,
    is_public: false,
    options: ['', '', '', ''],
    correct_answer_index: '',
  });
  const [questionError, setQuestionError] = useState('');
  const [questionSuccess, setQuestionSuccess] = useState('');
  // Quiz creation state
  const [quiz, setQuiz] = useState({
    quiz_title: '',
    description: '',
    time_limit: '',
    pass_percentage: 70,
    is_public: false,
    questions: [],
  });
  const [quizError, setQuizError] = useState('');
  const [quizSuccess, setQuizSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Profile: Token retrieved:', token);
        if (!token) {
          console.log('Profile: No token, redirecting to /login');
          navigate('/login', { replace: true });
          return;
        }
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Profile: API response:', response.data);
        setUser(response.data.user || {});
        setExamHistory(response.data.examHistory || []);
        setPreferredMusic(response.data.preferredMusic || []);
        localStorage.setItem('user', JSON.stringify(response.data.user || {}));
      } catch (error) {
        console.error('Failed to fetch profile:', error.response?.data?.error || error.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error.response?.data?.error || error.message);
      }
    };

    const fetchInstitutions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/institutions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setInstitutions(response.data);
      } catch (error) {
        console.error('Failed to fetch institutions:', error.response?.data?.error || error.message);
      }
    };

    if (localStorage.getItem('token')) {
      console.log('Profile: Initiating fetchProfile');
      fetchProfile();
      if (user.role === 'teacher') {
        fetchCategories();
        fetchInstitutions();
      }
    } else {
      console.log('Profile: No token, redirecting to /login');
      navigate('/login', { replace: true });
    }
  }, [navigate, user.role]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      setShowBottomBar(scrollPosition >= documentHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRole = (role) => {
    if (!role || typeof role !== 'string') return 'N/A';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const gravatarUrl = user.email
    ? `https://www.gravatar.com/avatar/${md5(user.email.toLowerCase().trim())}?s=500&d=robohash`
    : 'https://www.gravatar.com/avatar/default?s=500&d=robohash';

  // Handle question form input changes
  const handleQuestionChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    if (name === 'options') {
      const newOptions = [...question.options];
      newOptions[index] = value;
      setQuestion({ ...question, options: newOptions });
    } else if (type === 'checkbox') {
      setQuestion({ ...question, [name]: checked });
    } else {
      setQuestion({ ...question, [name]: value });
    }
  };

  // Handle question submission
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setQuestionError('');
    setQuestionSuccess('');
    if (!question.question_text) {
      setQuestionError('Question text is required');
      return;
    }
    if (!question.category_id) {
      setQuestionError('Category is required');
      return;
    }
    if (!question.institution_id) {
      setQuestionError('Institution is required');
      return;
    }
    if (!question.difficulty_level || question.difficulty_level < 1 || question.difficulty_level > 10) {
      setQuestionError('Difficulty level must be between 1 and 10');
      return;
    }
    if (question.options.some(opt => !opt)) {
      setQuestionError('All options must be filled');
      return;
    }
    if (!question.correct_answer_index) {
      setQuestionError('Correct answer is required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/questions/create',
        {
          question_text: question.question_text,
          category_id: parseInt(question.category_id),
          institution_id: parseInt(question.institution_id),
          difficulty_level: parseInt(question.difficulty_level),
          is_public: question.is_public,
          options: question.options.map((option_text, index) => ({
            option_text,
            is_correct: index === parseInt(question.correct_answer_index),
            display_order: index + 1,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestionSuccess('Question created successfully!');
      setQuiz({
        ...quiz,
        questions: [...quiz.questions, response.data.question],
      });
      setQuestion({
        question_text: '',
        category_id: '',
        institution_id: '',
        difficulty_level: 1,
        is_public: false,
        options: ['', '', '', ''],
        correct_answer_index: '',
      });
    } catch (error) {
      setQuestionError(error.response?.data?.error || 'Failed to create question');
    }
  };

  // Handle quiz form input changes
  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuiz({ ...quiz, [name]: type === 'checkbox' ? checked : value });
  };

  // Handle quiz submission
  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setQuizError('');
    setQuizSuccess('');
    if (!quiz.quiz_title) {
      setQuizError('Quiz title is required');
      return;
    }
    if (quiz.questions.length === 0) {
      setQuizError('At least one question is required');
      return;
    }
    if (quiz.time_limit && quiz.time_limit <= 0) {
      setQuizError('Time limit must be positive');
      return;
    }
    if (quiz.pass_percentage < 0 || quiz.pass_percentage > 100) {
      setQuizError('Pass percentage must be between 0 and 100');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/quizzes/create',
        {
          quiz_title: quiz.quiz_title,
          description: quiz.description,
          time_limit: quiz.time_limit ? parseInt(quiz.time_limit) : null,
          pass_percentage: parseInt(quiz.pass_percentage),
          is_public: quiz.is_public,
          question_ids: quiz.questions.map(q => q.question_id),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizSuccess('Quiz created successfully!');
      setQuiz({
        quiz_title: '',
        description: '',
        time_limit: '',
        pass_percentage: 70,
        is_public: false,
        questions: [],
      });
    } catch (error) {
      setQuizError(error.response?.data?.error || 'Failed to create quiz');
    }
  };

  return (
    <ErrorBoundary>
      <div className="profile-page">
        <div className="top-bar">
          <div>📘 MCQ Management App</div>
          <div className="nav-buttons">
            <Link to="/">Homepage</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        <div className="headline">
          <h2>MCQ Management System</h2>
          <span className="subtitle">The Only Study Companion You Need!!!</span>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <Tilt className="card flex justify-between items-center border-b border-gray-700 pb-4 mb-6" options={{ max: 15, scale: 1.02 }}>
            <h1 className="text-3xl font-extrabold tracking-tight">Focus: Your Profile</h1>
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-800 px-3 py-1 rounded-full text-white">
              <FontAwesomeIcon icon={faFire} className="text-sm" />
              <span className="font-bold">0</span>
            </div>
          </Tilt>

          <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
            <div className="flex flex-col md:flex-row justify-center items-center">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <div className="relative">
                  <img
                    src={gravatarUrl}
                    className="w-28 h-28 rounded-full border-4 border-gray-700 shadow-lg profile-image"
                    alt="Profile"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full p-2">
                    <FontAwesomeIcon icon={faCrown} className="text-amber-900 text-base" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-100">{user.first_name || 'N/A'} {user.last_name || 'N/A'}</h2>
                  <span className="inline-block mt-2 px-4 py-1 bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-full text-sm font-bold">
                    {formatRole(user.role)}
                  </span>
                  <p className="text-sm text-gray-400 mt-1">@{user.username || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">User ID: <span className="text-gray-100">{user.user_id || 'N/A'}</span></p>
                  <p className="text-gray-400">Username: <span className="text-gray-100">{user.username || 'N/A'}</span></p>
                  <p className="text-gray-400">Email: <span className="text-gray-100">{user.email || 'N/A'}</span></p>
                  <p className="text-gray-400">First Name: <span className="text-gray-100">{user.first_name || 'N/A'}</span></p>
                  <p className="text-gray-400">Last Name: <span className="text-gray-100">{user.last_name || 'N/A'}</span></p>
                </div>
                <div>
                  <p className="text-gray-400">Role: <span className="text-gray-100">{formatRole(user.role)}</span></p>
                  <p className="text-gray-400">Account Created: <span className="text-gray-100">{formatDate(user.created_at)}</span></p>
                  <p className="text-gray-400">Last Login: <span className="text-gray-100">{formatDate(user.last_login)}</span></p>
                  <p className="text-gray-400">Last Updated: <span className="text-gray-100">{formatDate(user.updated_at)}</span></p>
                </div>
              </div>
            </div>
          </Tilt>

          {user.role === 'teacher' && (
            <>
              <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Create a Question</h3>
                <form onSubmit={handleQuestionSubmit} className="space-y-4">
                  <div>
                    <label className="text-gray-400">Question Text</label>
                    <textarea
                      name="question_text"
                      value={question.question_text}
                      onChange={handleQuestionChange}
                      className="w-full bg-gray-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows="4"
                      placeholder="Enter your question"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400">Category</label>
                    <select
                      name="category_id"
                      value={question.category_id}
                      onChange={handleQuestionChange}
                      className="w-full bg-gray-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400">Institution</label>
                    <select
                      name="institution_id"
                      value={question.institution_id}
                      onChange={handleQuestionChange}
                      className="w-full bg-gray-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select an institution</option>
                      {institutions.map(institution => (
                        <option key={institution.institution_id} value={institution.institution_id}>
                          {institution.institution_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400">Difficulty Level (1-10)</label>
                    <input
                      type="number"
                      name="difficulty_level"
                      value={question.difficulty_level}
                      onChange={handleQuestionChange}
                      className="w-full bg-gray-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      min="1"
                      max="10"
                      placeholder="Enter difficulty level"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400">Options</label>
                    {question.options.map((opt, index) => (
                      <input
                        key={index}
                        type="text"
                        name="options"
                        value={opt}
                        onChange={(e) => handleQuestionChange(e, index)}
                        className="w-full bg-gray-700 text-gray-100 rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder={`Option ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div>
                    <label className="text-gray-400">Correct Answer</label>
                    <select
                      name="correct_answer_index"
                      value={question.correct_answer_index}
                      onChange={handleQuestionChange}
                      className="w-full bg-gray-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select correct option</option>
                      {question.options.map((opt, index) => (
                        <option key={index} value={index}>
                          {opt || `Option ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 flex items-center">
                      <input
                        type="checkbox"
                        name="is_public"
                        checked={question.is_public}
                        onChange={handleQuestionChange}
                        className="mr-2"
                      />
                      Make question public
                    </label>
                  </div>
                  {questionError && <p className="text-red-500">{questionError}</p>}
                  {questionSuccess && (
                    <p className="text-green-500 flex items-center">
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      {questionSuccess}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-amber-600 to-amber-800 text-white px-6 py-2 rounded-lg hover:from-amber-500 hover:to-amber-700 transition-all flex items-center"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Create Question
                  </button>
                </form>
              </Tilt>

              <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Create a Quiz</h3>
                <form onSubmit={handleQuizSubmit} className="space-y-4">
                  <div>
                    <label className="text-gray-400">Quiz Title</label>
                    <input
                      type="text"
                      name="quiz_title"
                      value={quiz.quiz_title}
                      onChange={handleQuizChange}
                      className="w-full bg-gray-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter quiz title"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400">Description</label>
                    <textarea
                      name="description"
                      value={quiz.description}
                      onChange={handleQuizChange}
                      className="w-full bg-gray-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows="4"
                      placeholder="Enter quiz description"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400">Time Limit (minutes, optional)</label>
                    <input
                      type="number"
                      name="time_limit"
                      value={quiz.time_limit}
                      onChange={handleQuizChange}
                      className="w-full bg-gray-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter time limit"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400">Pass Percentage (0-100)</label>
                    <input
                      type="number"
                      name="pass_percentage"
                      value={quiz.pass_percentage}
                      onChange={handleQuizChange}
                      className="w-full bg-gray-700 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter pass percentage"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400">Questions</label>
                    <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
                      {quiz.questions.length > 0 ? (
                        quiz.questions.map((q, index) => (
                          <div key={index} className="bg-gray-700 p-4 rounded-lg mb-2">
                            <p className="text-gray-100">{q.question_text}</p>
                            <p className="text-sm text-gray-400">Difficulty: {q.difficulty_level}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400">No questions added yet</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 flex items-center">
                      <input
                        type="checkbox"
                        name="is_public"
                        checked={quiz.is_public}
                        onChange={handleQuizChange}
                        className="mr-2"
                      />
                      Make quiz public
                    </label>
                  </div>
                  {quizError && <p className="text-red-500">{quizError}</p>}
                  {quizSuccess && (
                    <p className="text-green-500 flex items-center">
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      {quizSuccess}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-amber-600 to-amber-800 text-white px-6 py-2 rounded-lg hover:from-amber-500 hover:to-amber-700 transition-all flex items-center"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Create Quiz
                  </button>
                </form>
              </Tilt>
            </>
          )}

          <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Previous Attempted Exam Archive</h3>
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
              <div className="space-y-4">
                {examHistory.length > 0 ? (
                  examHistory.map((exam, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg exam-item">
                      <p className="text-gray-100">{exam.subject} - {formatDate(exam.date)}</p>
                      <p className="text-sm text-gray-400">Score: {exam.score}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No exam history available</p>
                )}
              </div>
            </div>
          </Tilt>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
            <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Previous Errors</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-gray-400" />
                </div>
                <p className="text-gray-400">No wrong answers recorded yet</p>
              </div>
            </Tilt>

            <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Your Favorite MCQ</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faStar} className="text-2xl text-gray-400" />
                </div>
                <p className="text-gray-400">No questions liked yet</p>
              </div>
            </Tilt>

            <Tilt className="card md:col-span-2" options={{ max: 15, scale: 1.02 }}>
              <div className="flex justify-center relative mb-6">
                <h3 className="text-xl font-semibold text-gray-100">Weekly Points</h3>
                <div className="absolute right-0 top-0">
                  <button className="text-gray-400 hover:text-amber-500 relative group">
                    <FontAwesomeIcon icon={faInfoCircle} className="icon-hover" />
                    <div className="absolute hidden group-hover:block bg-gray-700 p-3 rounded-lg shadow-lg z-10 w-64 right-0">
                      <h4 className="font-bold mb-1 text-gray-100">Weekly Points</h4>
                      <p className="text-sm text-gray-400">Weekly points reset every Saturday</p>
                    </div>
                  </button>
                </div>
              </div>
              <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <p className="text-gray-400">Weekly points chart would appear here</p>
              </div>
              <div className="text-center">
                <span className="text-gray-400 font-medium">Jul 13 - Jul 19, 2025</span>
              </div>
            </Tilt>

            <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Favorite Music</h3>
              <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
                <div className="space-y-4">
                  {preferredMusic.length > 0 ? (
                    preferredMusic.map((music, index) => (
                      <div key={index} className="bg-gray-700 p-4 rounded-lg music-item">
                        <p className="text-gray-100">Song: {music.song}</p>
                        <p className="text-sm text-gray-400">Artist: {music.artist}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No preferred music available</p>
                  )}
                </div>
              </div>
            </Tilt>

            <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
              <div className="flex justify-between items-center mb-4">
                <button className="text-gray-400 hover:text-amber-500 icon-hover">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <h3 className="text-xl font-semibold text-gray-100">Streak July 2025</h3>
                <button className="text-gray-400 hover:text-amber-500 icon-hover">
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={index} className="text-sm font-bold text-gray-400">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['29', '30', '1', '2', '3', '4', '5', '13', '31', '1', '2'].map((day, index) => (
                  <div
                    key={index}
                    className={`day ${index < 2 || index > 8 ? 'inactive' : ''} ${day === '13' ? 'active' : ''}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 pt-4 mt-4 text-center">
                <p className="font-bold text-gray-300">You practiced 0 days this month</p>
              </div>
            </Tilt>

            <Tilt className="card md:col-span-2" options={{ max: 15, scale: 1.02 }}>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-100">Progress Report</h3>
              <div className="space-y-3">
                {[
                  { subject: 'Physics', progress: 3 },
                  { subject: 'Chemistry', progress: 3 },
                  { subject: 'Higher Math', progress: 2 },
                ].map((item, index) => (
                  <div key={index} className="progress-item">
                    <div className="flex justify-between items-center">
                      <span>{item.subject}</span>
                      <span className="text-xs font-bold text-amber-500">{item.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${item.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </Tilt>
          </div>
        </div>

        <div className="content-spacer"></div>

        <div className={`bottom-bar ${showBottomBar ? 'visible' : ''}`}>
          <p>📞 Contact Us: +880-1234567890</p>
          <p>
            📧 Email: <a href="mailto:support@focusmcq.com">support@focusmcq.com</a>
          </p>
          <p>
            🏢 Address:{' '}
            <a
              href="https://www.google.com/maps/search/Level+4,+House+7,+Road+5,+Dhanmondi,+Dhaka,+Bangladesh"
              target="_blank"
              rel="noopener noreferrer"
            >
              Level 4, House 7, Road 5, Dhanmondi, Dhaka, Bangladesh
            </a>
          </p>
          <p>© 2025 Focus MCQ. All rights reserved.</p>
        </div>
      </div>
    </ErrorBoundary>
  );
}