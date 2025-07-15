import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faCrown, faExclamationTriangle, faStar, faInfoCircle, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import md5 from 'md5';
import './Profile.css';

export default function Profile() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || {
      user_id: null,
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      name: 'Guest',
      role: 'student',
      created_at: null,
      last_login: null,
      updated_at: null,
    }
  );
  const [examHistory, setExamHistory] = useState([]);
  const [preferredMusic, setPreferredMusic] = useState([]);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No token found');
        }
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        setExamHistory(response.data.examHistory);
        setPreferredMusic(response.data.preferredMusic);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error) {
        console.error('Failed to fetch profile:', error.response?.data?.error || error.message);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
      }
    };

    if (localStorage.getItem('authToken')) {
      fetchProfile();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (scrollPosition >= documentHeight - 100) {
        setShowBottomBar(true);
      } else {
        setShowBottomBar(false);
      }
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

  return (
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
        <div className="card flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Focus: Your Profile</h1>
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-800 px-3 py-1 rounded-full text-white">
            <FontAwesomeIcon icon={faFire} className="text-sm" />
            <span className="font-bold">০</span>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="relative">
                <img
                  src={`https://www.gravatar.com/avatar/${user.email ? md5(user.email.toLowerCase().trim()) : 'default'}?s=500&d=robohash`}
                  className="w-28 h-28 rounded-full border-4 border-gray-700 shadow-lg"
                  alt="Profile"
                />
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full p-2">
                  <FontAwesomeIcon icon={faCrown} className="text-amber-900 text-base" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-100">{user.name}</h2>
                <span className="inline-block mt-2 px-4 py-1 bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-full text-sm font-bold">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <p className="text-sm text-gray-400 mt-1">@{user.username}</p>
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
                <p className="text-gray-400">Role: <span className="text-gray-100">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></p>
                <p className="text-gray-400">Account Created: <span className="text-gray-100">{formatDate(user.created_at)}</span></p>
                <p className="text-gray-400">Last Login: <span className="text-gray-100">{formatDate(user.last_login)}</span></p>
                <p className="text-gray-400">Last Updated: <span className="text-gray-100">{formatDate(user.updated_at)}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">পূর্ববর্তী পরীক্ষার আর্কাইভ</h3>
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
            <div className="space-y-4">
              {examHistory.length > 0 ? (
                examHistory.map((exam, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-100">{exam.subject} - {formatDate(exam.date)}</p>
                    <p className="text-sm text-gray-400">Score: {exam.score}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No exam history available</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">পূর্ববর্তী ভুল</h3>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-gray-400" />
              </div>
              <p className="text-gray-400">এখনো কোনো ভুল রেকর্ড করা হয়নি</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">আপনার পছন্দের প্রশ্ন</h3>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faStar} className="text-2xl text-gray-400" />
              </div>
              <p className="text-gray-400">এখনো কোনো প্রশ্ন পছন্দ করা হয়নি</p>
            </div>
          </div>

          <div className="card md:col-span-2">
            <div className="flex justify-center relative mb-6">
              <h3 className="text-xl font-semibold text-gray-100">সাপ্তাহিক পয়েন্ট</h3>
              <div className="absolute right-0 top-0">
                <button className="text-gray-400 hover:text-amber-500 relative group">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <div className="absolute hidden group-hover:block bg-gray-700 p-3 rounded-lg shadow-lg z-10 w-64 right-0">
                    <h4 className="font-bold mb-1 text-gray-100">সাপ্তাহিক পয়েন্ট</h4>
                    <p className="text-sm text-gray-400">প্রতি সপ্তাহে শনিবার সাপ্তাহিক পয়েন্ট রিসেট হয়ে যায়</p>
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
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">পছন্দের সঙ্গীত</h3>
            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
              <div className="space-y-4">
                {preferredMusic.length > 0 ? (
                  preferredMusic.map((music, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-100">Song: {music.song}</p>
                      <p className="text-sm text-gray-400">Artist: {music.artist}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No preferred music available</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <button className="text-gray-400 hover:text-amber-500">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <h3 className="text-xl font-semibold text-gray-100">স্ট্রিক July 2025</h3>
              <button className="text-gray-400 hover:text-amber-500">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'].map((day, index) => (
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
              <p className="font-bold text-gray-300">এই মাসে তুমি ০ দিন প্র্যাকটিস করেছো</p>
            </div>
          </div>

          <div className="card md:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-100">প্রোগ্রেস রিপোর্ট</h3>
            <div className="space-y-3">
              {[
                { subject: 'পদার্থবিজ্ঞান', progress: 3 },
                { subject: 'রসায়ন', progress: 3 },
                { subject: 'উচ্চতর গণিত', progress: 2 },
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
          </div>
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
  );
}