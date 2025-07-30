import React, { useState } from 'react';
import NavBar from './NavBar';
import './About.css';

const About = () => {
  const features = [
    {
      title: 'Fast-Paced MCQ Quizzes',
      description: 'Engage with our dynamic multiple-choice question system designed to test your knowledge quickly and effectively, helping you master concepts in less time.',
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with our robust system that records all your quiz attempts, providing insights into your strengths and areas for improvement.',
    },
    {
      title: 'Music While Studying',
      description: 'Stay focused and relaxed with our unique feature that lets you listen to music during practice sessions or exams, enhancing your study experience.',
    },
    {
      title: 'Personalized Feedback',
      description: 'Receive tailored feedback after each quiz to understand your mistakes and improve your performance with actionable insights.',
    },
    {
      title: 'User-Friendly Interface',
      description: 'Navigate effortlessly through our intuitive platform, designed to make your study sessions seamless and productive.',
    },
  ];

  const reviews = [
    {
      text: 'This platform transformed my study habits! The MCQ quizzes are quick and effective, and I love listening to music while I practice.',
      author: 'Sarah Johnson',
    },
    {
      text: 'The progress tracking feature helped me identify my weak areas and improve my scores significantly. Highly recommend!',
      author: 'Michael Chen',
    },
    {
      text: 'The personalized feedback is a game-changer. It’s like having a tutor guide me through my mistakes.',
      author: 'Emily Davis',
    },
  ];

  const [currentFeature, setCurrentFeature] = useState(0);

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <div className="about-page">
      <NavBar />
      <header className="about-header">
        <h1><i className="fas fa-info-circle mr-2"></i>About Us</h1>
      </header>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <section className="about-section">
          <h2>Our Platform</h2>
          <p>
            Welcome to our innovative study platform, crafted to elevate your learning experience. Whether you're preparing for exams or sharpening your skills, our platform empowers you with tools to succeed. Our mission is to make studying engaging, efficient, and tailored to your needs.
          </p>
          <h3>Why Choose Us?</h3>
          <ul className="about-list">
            <li><i className="fas fa-check mr-2"></i><strong>Boost Your Confidence:</strong> Our fast-paced quizzes simulate real exam conditions, helping you build confidence and reduce test anxiety.</li>
            <li><i className="fas fa-check mr-2"></i><strong>Learn Smarter:</strong> Detailed progress tracking and personalized feedback ensure you focus on what matters most, maximizing your study efficiency.</li>
            <li><i className="fas fa-check mr-2"></i><strong>Stay Motivated:</strong> Enjoy a unique study environment with music integration, keeping you engaged and motivated during long study sessions.</li>
            <li><i className="fas fa-check mr-2"></i><strong>Accessible Anywhere:</strong> Our user-friendly interface works seamlessly on any device, so you can study anytime, anywhere.</li>
            <li><i className="fas fa-check mr-2"></i><strong>Trusted by Students:</strong> Join thousands of learners who have improved their grades and mastered their subjects with our platform.</li>
          </ul>
        </section>
        <section className="about-section">
          <h2>Our Features</h2>
          <div className="feature-card">
            <h3><i className="fas fa-star mr-2"></i>{features[currentFeature].title}</h3>
            <p>{features[currentFeature].description}</p>
            <div className="feature-controls">
              <button onClick={prevFeature}>
                <i className="fas fa-arrow-left mr-2"></i>Previous
              </button>
              <button onClick={nextFeature}>
                Next<i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        </section>
        <section className="about-section">
          <h2>What Our Users Say</h2>
          <div className="review-list">
            {reviews.map((review, index) => (
              <div key={index} className="review-card">
                <p className="review-text">"{review.text}"</p>
                <p className="review-author">
                  <i className="fas fa-user-circle mr-2"></i>- {review.author}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;