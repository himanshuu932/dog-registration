import React from 'react';
import './styles/About.css';

const About = () => {
  return (
    <section className="About-section">
      <div className="About-container">
        <div className="About-grid">
           <h2 className="About-section-heading">About Us</h2>
          <div className="About-images-horizontal-row">

             <div className="About-official-card About-main-official">
                <div className="About-official-image">
                  <img src="./yogi.png" alt="Chief Minister" />
                </div>
                <div className="About-official-info">
                  <h3>Shri Yogi Adityanath</h3>
                  <p>Chief Minister</p>
                </div>
              </div>

              <div className="About-official-card">
                <div className="About-official-image">
                  <img src="https://picsum.photos/seed/Inderajeet Singh/200" alt="Shri Inderajeet Singh" />
                </div>
                <div className="About-official-info">
                  <h3>Shri Inderajeet Singh</h3>
                  <p>Nagar Ayukt GKP</p>
                </div>
              </div>

              <div className="About-official-card">
                <div className="About-official-image">
                  <img src="https://picsum.photos/seed/Sushma Kharkwal/200" alt="Shrmati Sushma Kharkwal" />
                </div>
                <div className="About-official-info">
                  <h3>Shrmati Sushma Kharkwal</h3>
                  <p>Mayor GKP</p>
                </div>
              </div>
          </div>

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
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;