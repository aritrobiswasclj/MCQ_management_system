import React from 'react';
import NavBar from './NavBar';
//import placeholderImage from './pictures/placeholder.jpg';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <NavBar />
      <header className="contact-header">
        <h1><i className="fas fa-envelope mr-2"></i>Contact Us</h1>
      </header>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <section className="contact-section">
          <h2>Get in Touch</h2>
          <p>
            Have questions or need support? Reach out to our team! Below are our team members' photos and contact details
          </p>
          <div className="contact-card contact-card-reverse">
            <div className="contact-details">
              <h3><i className="fas fa-user mr-2"></i>Aritro Shankar Biswas</h3>
              <p>BSc, BUET CSE</p>
              <p>
                Mob: <a href="tel:+1234567890" className="contact-link">
                  <i className="fas fa-phone mr-1"></i>+8801976718178
                </a>
              </p>
              <p>
                Facebook: <a href="https://www.facebook.com/aritro.biswas.967" target="_blank" className="contact-link">
                  <i className="fab fa-facebook mr-1"></i>Aritro Biswas
                </a>
              </p>
            </div>
            <img
              src="src/pictures/aritro.jpg"
              alt="Photo of Aritro Shankar Biswas"
              className="contact-image"
              onError={(e) => (e.target.src = placeholderImage)}
            />
          </div>
          <div className="contact-card">
            <img
              src="src/pictures/abid.jpg"
              alt="Photo of Tahmidul Yeasin Abid"
              className="contact-image"
              onError={(e) => (e.target.src = placeholderImage)}
            />
            <div className="contact-details">
              <h3><i className="fas fa-user mr-2"></i>Tahmidul Yeasin Abid</h3>
              <p>BSc, BUET CSE</p>
              <p>
                Mob: <a href="tel:+0987654321" className="contact-link">
                  <i className="fas fa-phone mr-1"></i>+098-765-4321
                </a>
              </p>
              <p>
                Facebook: <a href="https://www.facebook.com/076.tahmidul.yeasin.abid.923/" target="_blank" className="contact-link">
                  <i className="fab fa-facebook mr-1"></i>Tahmidul Yeasin Abid
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;