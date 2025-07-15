import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.username || formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      setIsLoading(false);
      return;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }
    if (!formData.first_name || !formData.last_name) {
      setError('First and last names are required');
      setIsLoading(false);
      return;
    }
    if (!formData.role) {
      setError('Please select a user type');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      localStorage.setItem('token', response.data.token);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
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

      <div className="login-container">
        <div className="scenery-section">
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
          <div className="cloud cloud3"></div>
        </div>

        <div className="login-section">
          <h1>Create Account</h1>
          {error && <p className="error-message">{error}</p>}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                id="first_name"
                name="first_name"
                placeholder=" "
                required
                value={formData.first_name}
                onChange={handleChange}
                aria-label="First Name"
              />
              <label className="input-label" htmlFor="first_name">
                First Name
              </label>
            </div>

            <div className="input-group">
              <input
                type="text"
                id="last_name"
                name="last_name"
                placeholder=" "
                required
                value={formData.last_name}
                onChange={handleChange}
                aria-label="Last Name"
              />
              <label className="input-label" htmlFor="last_name">
                Last Name
              </label>
            </div>

            <div className="input-group">
              <input
                type="email"
                id="email"
                name="email"
                placeholder=" "
                required
                value={formData.email}
                onChange={handleChange}
                aria-label="Email"
              />
              <label className="input-label" htmlFor="email">
                Email
              </label>
            </div>

            <div className="input-group">
              <input
                type="text"
                id="username"
                name="username"
                placeholder=" "
                required
                value={formData.username}
                onChange={handleChange}
                aria-label="Username"
              />
              <label className="input-label" htmlFor="username">
                Username
              </label>
            </div>

            <div className="input-group">
              <input
                type="password"
                id="password"
                name="password"
                placeholder=" "
                required
                value={formData.password}
                onChange={handleChange}
                aria-label="Password"
              />
              <label className="input-label" htmlFor="password">
                Password
              </label>
            </div>

            <div className="input-group">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                User Type
              </label>
              <select
                id="role"
                name="role"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={formData.role}
                onChange={handleChange}
                aria-label="User Type"
              >
                <option value="" disabled>
                  Select User Type
                </option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </form>

          <div className="footer">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
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