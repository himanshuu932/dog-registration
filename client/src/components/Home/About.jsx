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
                  <img src="./yogi.webp" alt="Chief Minister" />
                </div>
                <div className="About-official-info">
                  <h3>Shri Yogi Adityanath</h3>
                  <p>Chief Minister</p>
                </div>
              </div>
               <div className="About-official-card">
                <div className="About-official-image">
                  <img src="./Dr._Manglesh_Kumar_Srivastava.webp" alt="Manglesh_Kumar_Srivastava" />
                </div>
                <div className="About-official-info">
                  <h3>Manglesh Kumar Srivastava</h3>
                  <p>Mayor GKP</p>
                </div>
              </div>
              <div className="About-official-card">
                <div className="About-official-image">
                  <img src="./muncipal.webp" alt="Shri Inderajeet Singh" />
                </div>
                <div className="About-official-info">
                  <h3>Sri Gaurav Singh Sogarwal</h3>
                  <p>Municpal Commissioner</p>
                </div>
              </div>

             
          </div>

          <div className="About-content">

            <div className="About-section-description">
              <p>
               Nagar Nigam Gorakhpur is the governing body of the city of Gorakhpur in the Indian state of Uttar Pradesh. The municipal corporation consists of democratically elected members, is headed by a mayor and administers the city’s infrastructure and public services. Members from the state’s leading various political parties hold elected offices in the corporation. It is the richest Municipal corporation in terms of revenue generated in the state of Uttar Pradesh.
              </p>
             <button className="About-btn-primary" onClick={() => window.location.href = 'https://gorakhpurnagarnigam.up.gov.in/'}>
  More About Us
</button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;