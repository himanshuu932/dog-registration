// src/components/About.jsx
import React from 'react';
import './styles/About.css';

const About = () => {
  return (
    <section className="about-section">
      <div className="container">
        <div className="about-grid">
          {/* Left Side - Text Content */}
          <div className="about-content">
            <h2 className="section-heading">About Us</h2>
            <div className="section-description">
              <p>
                Nagar Nigam Lucknow, also known as Lucknow Municipal Corporation, is
                the governing body responsible for the administration and
                development of Lucknow city. Established with the aim of enhancing the
                quality of life for citizens, we strive to deliver essential services in areas
                such as sanitation, water supply, urban planning, and community
                development.
              </p>
              <button className="btn-primary">More About Us</button>
            </div>
          </div>

          {/* Right Side - Officials Gallery */}
          <div className="officials-gallery">
            {/* First Row - Single Official */}
            <div className="gallery-row main-official-row">
              <div className="official-card main-official">
                <div className="official-image">
                  <img src="./yogi.png" alt="Chief Minister" />
                </div>
                <div className="official-info">
                  <h3>Shri Yogi Adityanath</h3>
                  <p>Chief Minister</p>
                </div>
              </div>
            </div>
            
          
          </div>
            {/* Second Row - Two Officials */}
            <div className="gallery-row secondary-officials-row">
              <div className="official-card">
                <div className="official-image">
                  <img src="https://picsum.photos/seed/Inderajeet Singh/200" alt="Inderajeet Singh" />
                </div>
                <div className="official-info">
                  <h3>Shri Inderajeet Singh</h3>
                  <p>Nagar Ayukt Lucknow</p>
                </div>
              </div>
              
              <div className="official-card">
                <div className="official-image">
                  <img src="https://picsum.photos/seed/Sushma Kharkwal/200" alt="Sushma Kharkwal" />
                </div>
                <div className="official-info">
                  <h3>Shrmati Sushma Kharkwal</h3>
                  <p>Mayor Lucknow</p>
                </div>
              </div>
            </div>
        </div>
        
      </div>
    </section>
  );
};

export default About;