import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faCrown, faExclamationTriangle, faStar, faInfoCircle, faChevronLeft, faChevronRight, faQuestion, faPen, faPlay } from '@fortawesome/free-solid-svg-icons';
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
  const [currentDate, setCurrentDate] = useState(new Date('2025-07-24'));

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
      if (user.role === 'teacher' || user.role === 'admin') {
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

  // Calendar logic
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
    const today = new Date('2025-07-24');
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Placeholder for streak days
  const isStreakDay = (day) => {
    return day && [10, 15, 20].includes(day);
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

          {user.role === 'student' && (
            <div className="mb-6">
              <button
                onClick={() => navigate('/quiz-attempt')}
                className="bg-gradient-to-r from-amber-600 to-amber-800 text-white px-6 py-2 rounded-lg hover:from-amber-500 hover:to-amber-700 transition-all flex items-center"
              >
                <FontAwesomeIcon icon={faPlay} className="mr-2" />
                Take Quiz
              </button>
            </div>
          )}

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
                <button
                  onClick={() => navigate('/question-creation')}
                  className="bg-gradient-to-r from-amber-600 to-amber-800 text-white px-6 py-2 rounded-lg hover:from-amber-500 hover:to-amber-700 transition-all flex items-center"
                >
                  <FontAwesomeIcon icon={faQuestion} className="mr-2" />
                  Create Question
                </button>
              </Tilt>

              <Tilt className="card" options={{ max: 15, scale: 1.02 }}>
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Create a Quiz</h3>
                <button
                  onClick={() => navigate('/quiz-creation')}
                  className="bg-gradient-to-r from-amber-600 to-amber-800 text-white px-6 py-2 rounded-lg hover:from-amber-500 hover:to-amber-700 transition-all flex items-center"
                >
                  <FontAwesomeIcon icon={faPen} className="mr-2" />
                  Create Quiz
                </button>
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
              <div className="flex justify-between items-center mb-3">
                <button
                  onClick={handlePrevMonth}
                  className="text-gray-400"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <h3 className="text-lg font-semibold text-gray-100">
                  {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="text-gray-400"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
              <AnimatePresence>
                <motion.div
                  key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-gray-800 p-3 rounded-md">
                    <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <div key={index} className="text-xs font-medium text-gray-400">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 text-center">
                      {getCalendarDays(currentDate).map((day, index) => (
                        <div
                          key={index}
                          className={`w-10 h-10 flex flex-col items-center justify-center text-sm font-medium border border-gray-700 relative ${
                            day === null
                              ? 'bg-gray-800 text-gray-800'
                              : isToday(day)
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-700 text-gray-100'
                          }`}
                        >
                          {day || ''}
                          {isStreakDay(day) && (
                            <div className="absolute bottom-1 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="border-t border-gray-700 pt-3 mt-3 text-center">
                <p className="text-sm text-gray-300">Practiced 3 days this month</p>
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