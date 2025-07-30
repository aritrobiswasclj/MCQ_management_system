import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import './Register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: '',
    admin_secret: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const starCanvasRef = useRef(null);

  useEffect(() => {
    // Scroll handler for bottom bar
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      setShowBottomBar(scrollPosition >= documentHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    if (!formData.password || formData.password.length < 4) {
      setError('Password must be at least 4 characters long');
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
    if (formData.role === 'admin' && !formData.admin_secret) {
      setError('Admin secret password is required for admin registration');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', formData);
      localStorage.setItem('token', response.data.token);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <NavBar />
      <canvas
        id="star-canvas"
        ref={starCanvasRef}
        className="fixed top-0 left-0 w-full h-full z-[-1]"
      ></canvas>
      <div className="headline">
        <h2><i className="fas fa-user-plus mr-2"></i>Focus</h2>
        <span className="subtitle">The Only Study Companion You Need!</span>
      </div>
      <div className="register-container">
        <div className="register-section">
          <h1><i className="fas fa-user-plus mr-2"></i>Create Account</h1>
          {error && <p className="error-message"><i className="fas fa-exclamation-circle mr-2"></i>{error}</p>}
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fas fa-user input-icon"></i>
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
              <label className="input-label" htmlFor="first_name">First Name</label>
            </div>
            <div className="input-group">
              <i className="fas fa-user input-icon"></i>
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
              <label className="input-label" htmlFor="last_name">Last Name</label>
            </div>
            <div className="input-group">
              <i className="fas fa-envelope input-icon"></i>
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
              <label className="input-label" htmlFor="email">Email</label>
            </div>
            <div className="input-group">
              <i className="fas fa-user-tag input-icon"></i>
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
              <label className="input-label" htmlFor="username">Username</label>
            </div>
            <div className="input-group">
              <i className="fas fa-lock input-icon"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder=" "
                required
                value={formData.password}
                onChange={handleChange}
                aria-label="Password"
              />
              <label className="input-label" htmlFor="password">Password</label>
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            <div className="input-group">
              <i className="fas fa-users input-icon"></i>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                aria-label="User Type"
              >
                <option value="" disabled>Select User Type</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
              <label className="input-label" htmlFor="role">User Type</label>
            </div>
            {formData.role === 'admin' && (
              <div className="input-group">
                <i className="fas fa-key input-icon"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="admin_secret"
                  name="admin_secret"
                  placeholder=" "
                  required={formData.role === 'admin'}
                  value={formData.admin_secret}
                  onChange={handleChange}
                  aria-label="Admin Secret Password"
                />
                <label className="input-label" htmlFor="admin_secret">Admin Secret Password</label>
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide admin secret' : 'Show admin secret'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            )}
            <button type="submit" className="register-btn" disabled={isLoading}>
              <i className="fas fa-user-plus mr-2"></i>{isLoading ? 'Creating...' : 'Create'}
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
  );
}