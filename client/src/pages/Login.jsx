import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', formData);
      localStorage.setItem('token', response.data.token);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
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
          <h1>Login</h1>
          {error && <p className="error-message">{error}</p>}
          <form className="login-form" onSubmit={handleSubmit}>
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
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="footer">
            <p>
              Don't have an account? <Link to="/register">Register</Link>
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