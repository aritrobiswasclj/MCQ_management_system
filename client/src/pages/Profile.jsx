import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import { Tilt } from 'react-tilt';
import { motion, AnimatePresence } from 'framer-motion';
import md5 from 'md5';
import './Profile.css';

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return <div className="error-message">Error: {this.state.error}</div>;
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
  const [quizzes, setQuizzes] = useState([]);
  const [preferredMusic, setPreferredMusic] = useState([]);
  const [categories, setCategories] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date('2025-07-30'));
  const starCanvasRef = useRef(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const fetchProfileAndQuizzes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }
        const profileResponse = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(profileResponse.data.user || {});
        setPreferredMusic(profileResponse.data.preferredMusic || []);
        localStorage.setItem('user', JSON.stringify(profileResponse.data.user || {}));

        const quizzesResponse = await axios.get('http://localhost:5000/api/quiz/my-quizzes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(quizzesResponse.data);
      } catch (error) {
        console.error('Failed to fetch profile/quizzes:', error.response?.data?.error || error.message);
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
      fetchProfileAndQuizzes();
      if (user.role === 'teacher' || user.role === 'admin') {
        fetchCategories();
        fetchInstitutions();
      }
    } else {
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

  const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return [
      ...Array(firstDayOfMonth).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date('2025-07-30');
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isStreakDay = (day) => {
    return day && [10, 15, 20].includes(day);
  };

  return (
    <ErrorBoundary>
      <div className="profile-page">
        <NavBar />
        <canvas
          id="star-canvas"
          ref={starCanvasRef}
          className="fixed top-0 left-0 w-full h-full z-[-1]"
        ></canvas>
        <div className="headline">
          <h2><i className="fas fa-user mr-2"></i>Focus</h2>
          <span className="subtitle">The Only Study Companion You Need!</span>
        </div>
        <div className="profile-container">
          <Tilt className="card profile-header" options={{ max: 15, scale: 1.02 }}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h1 className="text-3xl font-extrabold text-white">Your Profile</h1>
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-full text-white">
                <i className="fas fa-fire text-sm"></i>
                <span className="font-bold">0</span>
              </div>
            </div>
          </Tilt>

          {user.role === 'student' && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => navigate('/quiz-attempt')}
                className="profile-btn take-quiz-btn"
              >
                <i className="fas fa-play mr-2"></i>Take Quiz
              </button>
            </motion.div>
          )}

          {user.role === 'admin' && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="profile-btn admin-btn"
              >
                <i className="fas fa-shield-alt mr-2"></i>Admin Dashboard
              </button>
            </motion.div>
          )}

          <Tilt className="card user-info" options={{ max: 15, scale: 1.02 }}>
            <div className="flex flex-col md:flex-row justify-center items-center">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <div className="relative">
                  <img
                    src={gravatarUrl}
                    className="w-28 h-28 rounded-full border-4 border-gray-800 shadow-lg profile-image"
                    alt="Profile"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
                    <i className="fas fa-crown text-white text-base"></i>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.first_name || 'N/A'} {user.last_name || 'N/A'}</h2>
                  <span className="inline-block mt-2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-bold">
                    {formatRole(user.role)}
                  </span>
                  <p className="text-sm text-gray-300 mt-1">@{user.username || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white mb-4">User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-300">User ID: <span className="text-white">{user.user_id || 'N/A'}</span></p>
                  <p className="text-gray-300">Username: <span className="text-white">{user.username || 'N/A'}</span></p>
                  <p className="text-gray-300">Email: <span className="text-white">{user.email || 'N/A'}</span></p>
                  <p className="text-gray-300">First Name: <span className="text-white">{user.first_name || 'N/A'}</span></p>
                  <p className="text-gray-300">Last Name: <span className="text-white">{user.last_name || 'N/A'}</span></p>
                </div>
                <div>
                  <p className="text-gray-300">Role: <span className="text-white">{formatRole(user.role)}</span></p>
                  <p className="text-gray-300">Account Created: <span className="text-white">{formatDate(user.created_at)}</span></p>
                  <p className="text-gray-300">Last Login: <span className="text-white">{formatDate(user.last_login)}</span></p>
                  <p className="text-gray-300">Last Updated: <span className="text-white">{formatDate(user.updated_at)}</span></p>
                </div>
              </div>
            </div>
          </Tilt>

          {user.role === 'teacher' && (
            <>
              <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
                <h3 className="text-xl font-semibold text-white mb-4">Create a Question</h3>
                <button
                  onClick={() => navigate('/question-creation')}
                  className="profile-btn create-btn"
                >
                  <i className="fas fa-question mr-2"></i>Create Question
                </button>
              </Tilt>

              <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
                <h3 className="text-xl font-semibold text-white mb-4">Create a Quiz</h3>
                <button
                  onClick={() => navigate('/quiz-creation')}
                  className="profile-btn create-btn"
                >
                  <i className="fas fa-pen mr-2"></i>Create Quiz
                </button>
              </Tilt>
            </>
          )}

          <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
            <h3 className="text-xl font-semibold text-white mb-4">Previous Attempted Quizzes</h3>
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              <div className="space-y-4">
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => (
                    <motion.div
                      key={quiz.quiz_id}
                      className="quiz-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="text-white">{quiz.quiz_title}</p>
                      <button
                        onClick={() => navigate(`/result-dashboard/${quiz.quiz_id}`)}
                        className="profile-btn view-btn"
                      >
                        View Rankings
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-300">No quizzes attempted yet</p>
                )}
              </div>
            </div>
          </Tilt>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
            <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
              <h3 className="text-xl font-semibold text-white mb-4">Previous Errors</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-800 rounded-full flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-2xl text-gray-300"></i>
                </div>
                <p className="text-gray-300">No wrong answers recorded yet</p>
              </div>
            </Tilt>

            <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
              <h3 className="text-xl font-semibold text-white mb-4">Your Favorite MCQ</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-800 rounded-full flex items-center justify-center">
                  <i className="fas fa-star text-2xl text-gray-300"></i>
                </div>
                <p className="text-gray-300">No questions liked yet</p>
              </div>
            </Tilt>

            <Tilt className="card md:col-span-2" options={{ max: 15, scale: 1.02 }}>
              <div className="flex justify-center relative mb-6">
                <h3 className="text-xl font-semibold text-white">Weekly Points</h3>
                <div className="absolute right-0 top-0">
                  <button className="text-gray-300 hover:text-blue-500 relative group">
                    <i className="fas fa-info-circle icon-hover"></i>
                    <div className="tooltip">
                      <h4 className="font-bold mb-1 text-white">Weekly Points</h4>
                      <p className="text-sm text-gray-300">Weekly points reset every Saturday</p>
                    </div>
                  </button>
                </div>
              </div>
              <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <p className="text-gray-300">Weekly points chart would appear here</p>
              </div>
              <div className="text-center">
                <span className="text-gray-300 font-medium">Jul 24 - Jul 30, 2025</span>
              </div>
            </Tilt>

            <Tilt className="card calendar-card" options={{ max: 15, scale: 1.02 }}>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="calendar-btn"
                  aria-label="Previous Month"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <h3 className="text-lg font-semibold text-white">
                  {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="calendar-btn"
                  aria-label="Next Month"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <AnimatePresence>
                <motion.div
                  key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="calendar-grid"
                >
                  <div className="grid grid-cols-7 gap-0.5 text-center mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <div key={index} className="text-sm font-medium text-gray-300">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {getCalendarDays(currentDate).map((day, index) => (
                      <div
                        key={index}
                        className={`calendar-day ${day === null ? 'inactive' : ''} ${
                          isToday(day) ? 'today' : ''
                        } ${isStreakDay(day) ? 'streak' : ''}`}
                      >
                        {day || ''}
                        {isStreakDay(day) && (
                          <i className="fas fa-fire streak-icon"></i>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="border-t border-gray-800 pt-3 mt-3 text-center">
                <p className="text-sm text-gray-300">Practiced 3 days this month</p>
              </div>
            </Tilt>

            <Tilt className="card md:col-span-2" options={{ max: 15, scale: 1.02 }}>
              <h3 className="text-xl font-semibold mb-4 text-center text-white">Progress Report</h3>
              <div className="space-y-4">
                {[
                  { subject: 'Physics', progress: 3 },
                  { subject: 'Chemistry', progress: 3 },
                  { subject: 'Higher Math', progress: 2 },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="progress-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white">{item.subject}</span>
                      <span className="text-xs font-bold text-blue-400">{item.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Tilt>
          </div>
        </div>

        <div className="content-spacer"></div>

        <div className={`bottom-bar ${showBottomBar ? 'visible' : ''}`}>
          <p><i className="fas fa-phone mr-2"></i>Contact Us: +880-1234567890</p>
          <p>
            <i className="fas fa-envelope mr-2"></i>
            Email: <a href="mailto:support@focusmcq.com">support@focusmcq.com</a>
          </p>
          <p>
            <i className="fas fa-map-marker-alt mr-2"></i>
            Address:{' '}
            <a
              href="https://www.google.com/maps/search/Level+4,+House+7,+Road+5,+Dhanmondi,+Dhaka,+Bangladesh"
              target="_blank"
              rel="noopener noreferrer"
            >
              Level 4, House 7, Road 5, Dhanmondi, Dhaka, Bangladesh
            </a>
          </p>
          <p><i className="fas fa-copyright mr-2"></i>© 2025 Focus MCQ. All rights reserved.</p>
        </div>
      </div>
    </ErrorBoundary>
  );
}