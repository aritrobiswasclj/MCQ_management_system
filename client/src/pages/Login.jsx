import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // CSS with background etc.

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false);
  const navigate = useNavigate();

  // Scroll detection for bottom bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      setIsBottomBarVisible(scrollPosition >= documentHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Sending login request:', { email, password });
    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password
      });
      console.log('Login response:', response.data);
      // Store token in localStorage
      localStorage.setItem('authToken', response.data.token);
      alert("Login successful!");
      // Redirect to profile page
      navigate('/profile'); // Fixed: Use URL route instead of file path
    } catch (error) {
      console.error('Login failed:', error.response?.data?.error || error.message);
      alert("Login failed: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="top-bar">
        <div>📘 Focus App</div>
        <div className="nav-buttons">
          <a href="#">Homepage</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </div>

      {/* Hero */}
      <div className="headline">
        <h2>Focus</h2>
        <span className="subtitle">The Only Study Companion You Need!!!</span>
      </div>

      {/* Login Container */}
      <div className="login-container">
        <div className="scenery-section">
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
          <div className="cloud cloud3"></div>
        </div>

        <div className="login-section">
          <h1>Welcome Back</h1>

          {/* ✅ Single Form */}
          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                id="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label className="input-label" htmlFor="email">Email</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                id="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label className="input-label" htmlFor="password">Password</label>
            </div>

            <button type="submit" className="login-btn">Login</button>
          </form>

          <div className="footer">
            <p>New to MCQ System? <Link to="/register">Create Account</Link></p>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="content-spacer"></div>

      {/* Bottom Bar */}
      <div className={`bottom-bar ${isBottomBarVisible ? 'visible' : ''}`} id="bottomAnnie">
        <p>📞 Contact Us: +880-1234567890</p>
        <p>📧 Email: <a href="mailto:support@focusmcq.com">support@focusmcq.com</a></p>
        <p>🏢 Address: <a href="https://www.google.com/maps/search/Level+4,+House+7,+Road+5,+Dhanmondi,+Dhaka,+Bangladesh" target="_blank" rel="noopener noreferrer">
          Level 4, House 7, Road 5, Dhanmondi, Dhaka, Bangladesh</a></p>
        <p>© 2025 Focus MCQ. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;