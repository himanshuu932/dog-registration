// src/components/About.jsx
import React from 'react';
import './styles/About.css';

const About = () => {
  return (
    <section className="About-section">
      <div className="About-container">
        {/* The About-grid will arrange its direct children (About-images-horizontal-row and About-content) vertically */}
        <div className="About-grid">
           <h2 className="About-section-heading">About Us</h2>
          {/* Container for all Official Cards arranged horizontally (This will be the top row) */}
          <div className="About-images-horizontal-row"> {/* <-- New Wrapper Div */}

             {/* Main Official Card */}
             {/* Removed specific grid-item classes */}
             <div className="About-official-card About-main-official">
                <div className="About-official-image">
                  {/* Assuming yogi.png is in your public folder or accessible path */}
                  <img src="./yogi.png" alt="Chief Minister" />
                </div>
                <div className="About-official-info">
                  <h3>Shri Yogi Adityanath</h3>
                  <p>Chief Minister</p>
                </div>
              </div>

              {/* Second Official Card */}
              <div className="About-official-card">
                <div className="About-official-image">
                  {/* Using placeholder images */}
                  <img src="https://picsum.photos/seed/Inderajeet Singh/200" alt="Shri Inderajeet Singh" />
                </div>
                <div className="About-official-info">
                  <h3>Shri Inderajeet Singh</h3>
                  <p>Nagar Ayukt GKP</p>
                </div>
              </div>

              {/* Third Official Card */}
              <div className="About-official-card">
                <div className="About-official-image">
                   {/* Using placeholder images */}
                  <img src="https://picsum.photos/seed/Sushma Kharkwal/200" alt="Shrmati Sushma Kharkwal" />
                </div>
                <div className="About-official-info">
                  <h3>Shrmati Sushma Kharkwal</h3>
                  <p>Mayor GKP</p>
                </div>
              </div>
          </div> {/* end About-images-horizontal-row */}

          {/* Text Content (This will be the bottom row) */}
          <div className="About-content">

            <div className="About-section-description">
              <p>
                Nagar Nigam GKP, also known as GKP Municipal Corporation, is
                the governing body responsible for the administration and
                development of GKP city. Established with the aim of enhancing the
                quality of life for citizens, we strive to deliver essential services in areas
                such as sanitation, water supply, urban planning, and community
                development.
              </p>
              <button className="About-btn-primary">More About Us</button>
            </div>
          </div> {/* end About-content */}

        </div> {/* end About-grid */}
      </div> {/* end About-container */}
    </section>
  );
};

export default About;