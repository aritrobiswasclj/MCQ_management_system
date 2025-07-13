import React, { useState } from "react";
import { Link } from 'react-router-dom';
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Logging in with Username: ${username}`);
    // Add your login logic here (e.g., API call)
  };

  const handleScroll = () => {
    const bottomBar = document.getElementById('bottomAnnie');
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollPosition >= documentHeight - 100) {
      bottomBar.classList.add('visible');
    } else {
      bottomBar.classList.remove('visible');
    }
  };

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="top-bar">
        <div>📘 Focus App</div>
        <div className="nav-buttons">
          <a href="#">Homepage</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </div>

      <div className="headline">
        <h2>Focus</h2>
        <span className="subtitle">The Only Study Companion You Need!!!</span>
      </div>

      <div className="login-container">
        <div className="scenery-section">
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
          <div className="cloud cloud3"></div>
        </div>
        <div className="login-section">
          <h1>Welcome Back</h1>
          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="text"
                id="username"
                placeholder=" "
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label className="input-label" htmlFor="username">Username</label>
            </div>
            <div className="input-group">
              <input
                type="password"
                id="password"
                placeholder=" "
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

      <div className="content-spacer"></div>

      <div className="bottom-bar" id="bottomAnnie">
        <p>📞 Contact Us: +880-1234567890</p>
        <p>📧 Email: <a href="mailto:support@focusmcq.com">support@focusmcq.com</a></p>
        <p>🏢 Address: <a href="https://www.google.com/maps/search/Level+4,+House+7,+Road+5,+Dhanmondi,+Dhaka,+Bangladesh" target="_blank">Level 4, House 7, Road 5, Dhanmondi, Dhaka, Bangladesh</a></p>
        <p>© 2025 Focus MCQ. All rights reserved.</p>
      </div>
    </>
  );
}

export default Login;