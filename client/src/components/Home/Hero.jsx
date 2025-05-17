// src/components/Hero.jsx
import React from 'react';
import PawIcon from '../icons/PawIcon';
import './styles/Hero.css';
import { useNavigate } from 'react-router-dom';

const Hero = ({ languageType = 'en' }) => { // Added languageType prop
  const navigate = useNavigate();

  // Language content
  const content = {
    en: {
      title: 'Register Your Pet Today for Identification and Verification',
      paragraph: 'We Encourage to register your pet Identification and provide a search database to identify the Pet Information and Owner verification.',
      buttonText: 'Register Now'
    },
    hi: {
      title: 'अपने पालतू जानवर को पहचान और सत्यापन के लिए आज ही पंजीकृत करें',
      paragraph: 'हम आपके पालतू जानवर की पहचान पंजीकृत करने और पालतू जानवर की जानकारी तथा मालिक के सत्यापन के लिए एक खोज डेटाबेस प्रदान करने के लिए प्रोत्साहित करते हैं।',
      buttonText: 'अभी पंजीकरण करें'
    }
  };

  const currentContent = content[languageType] || content.en; // Default to English

  return (
    <div className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>{currentContent.title}</h1> {/* Dynamic title */}
            <p>
              {currentContent.paragraph} {/* Dynamic paragraph */}
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/pet-register')}>{currentContent.buttonText}</button> {/* Dynamic button text */}
          </div>
          <div className="hero-image">
            <div className="pet-circle">
              <img
                src="./dog.webp"
                alt="pet placeholder"
                className="responsive-cover"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="paw-decorations">
        {/* Paw icons remain the same as they are SVG and don't need translation */}
        <div className="paw-icon light-purple top-right"><PawIcon /></div>
        <div className="paw-icon navy bottom-left"><PawIcon /></div>
        <div className="paw-icon pink bottom-right"><PawIcon /></div>
      </div>
    </div>
  );
};

export default Hero;