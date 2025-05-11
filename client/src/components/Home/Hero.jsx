// src/components/Hero.jsx
import React from 'react';
import PawIcon from '../icons/PawIcon';
import './styles/Hero.css';

const Hero = () => {
  return (
    <div className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Register Your Pet Today for Identification and Verification</h1>
            <p>
              We Encourage to register your pet Identification and provide a search
              database to identify the Pet Information and Owner verification.
            </p>
            <button className="btn btn-primary">Register Now</button>
          </div>
          <div className="hero-image">
            <div className="pet-circle">
              <img
                src="https://picsum.photos/seed/pet/400/400"
                alt="pet placeholder"
                className="responsive-cover"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="paw-decorations">
        <div className="paw-icon light-purple top-right"><PawIcon /></div>
        <div className="paw-icon navy bottom-left"><PawIcon /></div>
        <div className="paw-icon pink bottom-right"><PawIcon /></div>
      </div>
    </div>
  );
};

export default Hero;