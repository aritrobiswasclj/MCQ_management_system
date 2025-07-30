import React, { useState } from 'react';

const About = () => {
  const features = [
    {
      title: 'Fast-Paced MCQ Quizzes',
      description: 'Engage with our dynamic multiple-choice question system designed to test your knowledge quickly and effectively, helping you master concepts in less time.'
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with our robust system that records all your quiz attempts, providing insights into your strengths and areas for improvement.'
    },
    {
      title: 'Music While Studying',
      description: 'Stay focused and relaxed with our unique feature that lets you listen to music during practice sessions or exams, enhancing your study experience.'
    },
    {
      title: 'Personalized Feedback',
      description: 'Receive tailored feedback after each quiz to understand your mistakes and improve your performance with actionable insights.'
    },
    {
      title: 'User-Friendly Interface',
      description: 'Navigate effortlessly through our intuitive platform, designed to make your study sessions seamless and productive.'
    }
  ];

  const reviews = [
    {
      text: 'This platform transformed my study habits! The MCQ quizzes are quick and effective, and I love listening to music while I practice.',
      author: 'Sarah Johnson'
    },
    {
      text: 'The progress tracking feature helped me identify my weak areas and improve my scores significantly. Highly recommend!',
      author: 'Michael Chen'
    },
    {
      text: 'The personalized feedback is a game-changer. It’s like having a tutor guide me through my mistakes.',
      author: 'Emily Davis'
    }
  ];

  const [currentFeature, setCurrentFeature] = useState(0);

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <div>
      <style>
        {`
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #1a1a1a;
            color: #e0e0e0;
          }
          .container {
            width: 80%;
            margin: auto;
            overflow: hidden;
            padding: 20px;
          }
          header {
            background: #0d0d0d;
            color: #ffffff;
            padding: 10px 0;
            text-align: center;
          }
          .nav-bar {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 10px;
          }
          .nav-bar a {
            display: inline-block;
            background: #4da8da;
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 3px;
            text-decoration: none;
            font-weight: bold;
          }
          .nav-bar a:hover {
            background: #72c2f1;
            text-decoration: none;
          }
          .section {
            background: #2b2b2b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
          }
          .team {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
          }
          .team-member {
            text-align: center;
            margin: 20px;
          }
          .team-member img {
            width: 150px;
            height: 150px;
            background: #4a4a4a;
            border-radius: 50%;
            margin-bottom: 10px;
          }
          .why-choose {
            list-style-type: disc;
            margin-left: 20px;
          }
          .flashcard {
            text-align: center;
            padding: 20px;
            background: #3a3a3a;
            border-radius: 5px;
            margin: 10px 0;
          }
          .flashcard-controls {
            margin-top: 10px;
          }
          .flashcard-controls button {
            background: #4da8da;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            margin: 0 5px;
            border-radius: 3px;
            cursor: pointer;
          }
          .flashcard-controls button:hover {
            background: #72c2f1;
          }
          .reviews {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .review {
            background: #3a3a3a;
            padding: 15px;
            border-radius: 5px;
          }
          .review-text {
            font-style: italic;
          }
          .review-author {
            font-weight: bold;
            text-align: right;
          }
          h1, h2, h3 {
            color: #ffffff;
          }
          a {
            color: #4da8da;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
            color: #72c2f1;
          }
          @media (max-width: 600px) {
            .team {
              flex-direction: column;
              align-items: center;
            }
            .nav-bar {
              position: static;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 10px 0;
            }
            .nav-bar a {
              display: block;
              margin: 5px 0;
              width: 120px;
              text-align: center;
            }
          }
        `}
      </style>
      <div className="nav-bar">
        <a href="#">Home</a>
        <a href="#">Login</a>
        <a href="#">Contact Us</a>
      </div>
      <header>
        <h1>About Us</h1>
      </header>
      <div className="container">
        <div className="section">
          <h2>Our Platform</h2>
          <p>Welcome to our innovative study platform, crafted to elevate your learning experience. Whether you're preparing for exams or sharpening your skills, our platform empowers you with tools to succeed. Our mission is to make studying engaging, efficient, and tailored to your needs.</p>
          <h3>Why Choose Us?</h3>
          <ul className="why-choose">
            <li><strong>Boost Your Confidence:</strong> Our fast-paced quizzes simulate real exam conditions, helping you build confidence and reduce test anxiety.</li>
            <li><strong>Learn Smarter:</strong> Detailed progress tracking and personalized feedback ensure you focus on what matters most, maximizing your study efficiency.</li>
            <li><strong>Stay Motivated:</strong> Enjoy a unique study environment with music integration, keeping you engaged and motivated during long study sessions.</li>
            <li><strong>Accessible Anywhere:</strong> Our user-friendly interface works seamlessly on any device, so you can study anytime, anywhere.</li>
            <li><strong>Trusted by Students:</strong> Join thousands of learners who have improved their grades and mastered their subjects with our platform.</li>
          </ul>
        </div>
        <div className="section">
          <h2>Our Features</h2>
          <div className="flashcard">
            <h3>{features[currentFeature].title}</h3>
            <p>{features[currentFeature].description}</p>
            <div className="flashcard-controls">
              <button onClick={prevFeature}>Previous</button>
              <button onClick={nextFeature}>Next</button>
            </div>
          </div>
        </div>
        <div className="section">
          <h2>What Our Users Say</h2>
          <div className="reviews">
            {reviews.map((review, index) => (
              <div key={index} className="review">
                <p className="review-text">"{review.text}"</p>
                <p className="review-author">- {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;