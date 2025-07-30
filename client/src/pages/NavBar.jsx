import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="navbar-logo">
          <i className="fas fa-book-open mr-2"></i>StudyPlatform
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="navbar-toggle md:hidden"
          aria-label="Toggle menu"
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
        </button>
        <div className={`navbar-menu ${isOpen ? 'open' : ''}`}>
          <Link to="/home" className="navbar-link">
            <i className="fas fa-home mr-2"></i>Home
          </Link>
          <Link to="/profile" className="navbar-link">
            <i className="fas fa-user mr-2"></i>Profile
          </Link>
          <Link to="/login" className="navbar-link">
            <i className="fas fa-sign-in-alt mr-2"></i>Login
          </Link>
          <Link to="/about" className="navbar-link">
            <i className="fas fa-info-circle mr-2"></i>About Us
          </Link>
          <Link to="/contact" className="navbar-link">
            <i className="fas fa-envelope mr-2"></i>Contact Us
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;