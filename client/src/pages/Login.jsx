import React, { useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import "./Login.css"; // Extracted styles if needed

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        username,
        password,
      });

      alert(`Welcome ${res.data.role}!`);
      // Redirect based on role
      // if (res.data.role === 'admin') navigate('/admin');
    } catch (err) {
      alert("Login failed: " + err.response?.data?.error);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Login</h1>
        <input
          type="text"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <p>
          New user? <a href="#">Register</a>
        </p>
        <div className="footer">
          <p>
            New to MCQ System? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
