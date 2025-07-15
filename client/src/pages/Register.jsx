import React, { useState, useEffect } from 'react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: '', // Empty default to match HTML select behavior
  });

  const [showBottomBar, setShowBottomBar] = useState(false);

  // Handle scroll event for bottom bar visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show bottom bar when scrolled near the bottom (within 100px)
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.email || 
        !formData.username || !formData.password || !formData.role) {
      alert('Please fill in all fields');
      return;
    }
    
    console.log('Form Data:', formData);
    
    // Display alert with user info (matching HTML behavior)
    alert(`Creating account for: ${formData.first_name} ${formData.last_name}\nEmail: ${formData.email}\nUsername: ${formData.username}\nUser Type: ${formData.role}`);
    
    // TODO: Replace with actual backend endpoint
    // For now, just simulate success
    alert('Registration successful!');
  };

  return (
    <div className="register-page">
      {/* Top Bar */}
      <div className="top-bar">
        <div>📘 MCQ Management App</div>
        <div className="nav-buttons">
          <a href="#">Homepage</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="headline">
        <h2>MCQ Managament System</h2>
        <span className="subtitle">The Only Study Companion You Need!!!</span>
      </div>

      {/* Registration Container */}
      <div className="login-container ">
        <div className="scenery-section">
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
          <div className="cloud cloud3"></div>
        </div>
        
        <div className="login-section">
          <h1>Create Account</h1>
          <div className="login-form">
            <div className="input-group">
              <input
                type="text"
                id="first_name"
                name="first_name"
                placeholder=" "
                required
                value={formData.first_name}
                onChange={handleChange}
              />
              <label className="input-label" htmlFor="first_name">First Name</label>
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
              />
              <label className="input-label" htmlFor="last_name">Last Name</label>
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
              />
              <label className="input-label" htmlFor="email">Email</label>
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
              />
              <label className="input-label" htmlFor="username">Username</label>
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
              />
              <label className="input-label" htmlFor="password">Password</label>
            </div>
            
            <div className="input-group">
              <label className="input-label" htmlFor="role">User Type</label>
              <select
                className='p-5'
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
              >
                <option value="" disabled>Select User Type</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
              
            </div>
            
            <button type="button" className="login-btn" onClick={handleSubmit}>Create</button>
          </div>
          
          <div className="footer">
            <p>Already have an account? <a href="/login">Login</a></p>
          </div>
        </div>
      </div>

      {/* Spacer to allow scrolling */}
      <div className="content-spacer"></div>

      {/* Bottom Bar */}
      <div className={`bottom-bar ${showBottomBar ? 'visible' : ''}`}>
        <p>📞 Contact Us: +880-1234567890</p>
        <p>📧 Email: <a href="mailto:support@focusmcq.com">support@focusmcq.com</a></p>
        <p>🏢 Address: <a href="https://www.google.com/maps/search/Level+4,+House+7,+Road+5,+Dhanmondi,+Dhaka,+Bangladesh" target="_blank" rel="noopener noreferrer">Level 4, House 7, Road 5, Dhanmondi, Dhaka, Bangladesh</a></p>
        <p>© 2025 Focus MCQ. All rights reserved.</p>
      </div>
    </div>
  );
}