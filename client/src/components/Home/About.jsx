// src/components/About.jsx
import React from 'react';
import './styles/About.css';

const About = () => {
  return (
    <section className="about-section">
      <div className="container">
        {/* Changed about-grid to be the 2x2 grid container */}
        <div className="about-grid">
          {/* Grid Item 1: Text Content (Row 1, Col 1) */}
          <div className="about-content">
            <h2 className="section-heading">About Us</h2>
            <div className="section-description">
              <p>
                Nagar Nigam GKP, also known as GKP Municipal Corporation, is
                the governing body responsible for the administration and
                development of GKP city. Established with the aim of enhancing the
                quality of life for citizens, we strive to deliver essential services in areas
                such as sanitation, water supply, urban planning, and community
                development.
              </p>
              <button className="btn-primary">More About Us</button>
            </div>
          </div>

          {/* Grid Item 2: Main Official (Row 1, Col 2) */}
          {/* Added a wrapper div to make it a direct grid item if needed, or style official-card directly */}
          <div className="grid-item main-official-grid-item">
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


          {/* Grid Item 3: Second Official (Row 2, Col 1) */}
          <div className="grid-item">
              <div className="official-card">
                <div className="official-image">
                  <img src="https://picsum.photos/seed/Inderajeet Singh/200" alt="Inderajeet Singh" />
                </div>
                <div className="official-info">
                  <h3>Shri Inderajeet Singh</h3>
                  <p>Nagar Ayukt GKP</p>
                </div>
              </div>
          </div>


          {/* Grid Item 4: Third Official (Row 2, Col 2) */}
          <div className="grid-item">
              <div className="official-card">
                <div className="official-image">
                  <img src="https://picsum.photos/seed/Sushma Kharkwal/200" alt="Sushma Kharkwal" />
                </div>
                <div className="official-info">
                  <h3>Shrmati Sushma Kharkwal</h3>
                  <p>Mayor GKP</p>
                </div>
              </div>
          </div>

        </div> {/* end about-grid */}
      </div> {/* end container */}
    </section>
  );
};

export default About;