// Login.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For navigation links
import './Login.css'; // Import the CSS file (use './Login.module.css' for CSS Modules)

const Login = () => {
  // State for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // State for bottom bar visibility
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false);

  // Handle scroll event for bottom bar visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      // Show bottom bar when scrolled near the bottom (within 100px)
      setIsBottomBarVisible(scrollPosition >= documentHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // Cleanup
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Logging in with Username: ${username}`);
    // Add your login logic here (e.g., API call)
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="top-bar">
        <div>📘 Focus App</div>
        <div className="nav-buttons">
          <Link to="/">Homepage</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      {/* Hero */}
      <div className="headline">
        <h2>Focus</h2>
        <span className="subtitle">The Only Study Companion You Need!!!</span>
      </div>

      {/* Login Box */}
      <div className="login-container">
        <div className="scenery-section ">
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
          <div className="cloud cloud3"></div>
        </div>
        <div className="login-section">
          <h1>Welcome Back</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" "
                required
              />
              <label className="input-label" htmlFor="username">Username</label>
            </div>
            <div className="input-group">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
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

      {/* Spacer to allow scrolling */}
      <div className="content-spacer"></div>

      {/* Bottom Bar */}
      <div className={`bottom-bar ${isBottomBarVisible ? 'visible' : ''}`}>
        <p>📞 Contact Us: +880-1234567890</p>
        <p>📧 Email: <a href="mailto:support@focusmcq.com">support@focusmcq.com</a></p>
        <p>
          🏢 Address: <a href="https://www.google.com/maps/search/Level+4,+House+7,+Road+5,+Dhanmondi,+Dhaka,+Bangladesh" target="_blank">
            Level 4, House 7, Road 5, Dhanmondi, Dhaka, Bangladesh
          </a>
        </p>
        <p>© 2025 Focus MCQ. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;