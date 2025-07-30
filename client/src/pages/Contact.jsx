import React from 'react';

const Contact = () => {
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
          .contact-member {
            display: flex;
            align-items: center;
            margin: 20px 0;
            flex-wrap: wrap;
          }
          .contact-member.reverse {
            flex-direction: row-reverse;
          }
          .contact-member img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            margin: 10px;
            object-fit: cover;
            background: #4a4a4a;
          }
          .contact-details {
            flex: 1;
            padding: 10px;
            text-align: left;
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
          .note {
            color: #ff6666;
            font-style: italic;
          }
          @media (max-width: 600px) {
            .contact-member, .contact-member.reverse {
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            .contact-member img {
              margin: 10px auto;
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
        <a href="#">About Us</a>
      </div>
      <header>
        <h1>Contact Us</h1>
      </header>
      <div className="container">
        <div className="section">
          <h2>Get in Touch</h2>
          <p>Have questions or need support? Reach out to our team!</p>
          <div className="contact-member reverse">
            <div className="contact-details">
              <h3>Aritro Shankar Biswas</h3>
              <p>BSc, BUET CSE</p>
              <p>Mob: <a href="tel:+1234567890">+123-456-7890</a></p>
              <p>Facebook: <a href="https://www.facebook.com/aritro.biswas.967" target="_blank">Aritro Biswas</a></p>
            </div>
            <img src="client/src/pictures/aritro.jpg" alt="Photo of Aritro Shankar Biswas" onError={(e) => (e.target.style.display = 'none')} />
          </div>
          <div className="contact-member">
            <img src="client/src/pictures/abid.jpg" alt="Photo of Tahmidul Yeasin Abid" onError={(e) => (e.target.style.display = 'none')} />
            <div className="contact-details">
              <h3>Tahmidul Yeasin Abid</h3>
              <p>BSc, BUET CSE</p>
              <p>Mob: <a href="tel:+0987654321">+098-765-4321</a></p>
              <p>Facebook: <a href="https://www.facebook.com/076.tahmidul.yeasin.abid.923/" target="_blank">Tahmidul Yeasin Abid</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;