import React, { useState } from 'react';

import './Register.css';
import axios from 'axios';
import './styles/Login.css'; // adjust path if needed


export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'student', // default role
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual backend endpoint
      console.log(formData);
      await axios.post('http://localhost:3000/api/users/register', formData);
      alert('Registration successful!');
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.error || err.message);
      alert('Registration failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="firstname"
          name="first_name"
          placeholder="firstname"
          required
          value={formData.firstname}
          onChange={handleChange}
        />
        <input
          type="lastname"
          name="last_name"
          placeholder="lastname"
          required
          value={formData.lastname}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Register</button>
        <p>Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
}
