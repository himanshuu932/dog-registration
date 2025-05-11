import React, { useState } from 'react';
import './PetRegistration.css';

// Import SVG icons as React components
const PawIcon = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" className="paw-icon">
    <path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5.3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3-14.3-70.1 10.2-84.1 59.6.9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2-25.8 0-46.7-20.9-46.7-46.7v-1.6c0-10.4 1.6-20.8 5.2-30.5zm354.7-75.1c-24.5-14-29.1-51.7-10.2-84.1s54-47.3 78.5-33.3 29.1 51.7 10.2 84.1-54 47.3-78.5 33.3zm-341.6-84.1c18.9-32.4 54-47.3 78.5-33.3s29.1 51.7 10.2 84.1-54 47.3-78.5 33.3-29.1-51.7-10.2-84.1z"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" className="step-icon">
    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
  </svg>
);

const FormIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="step-icon">
    <path d="M320 464c8.8 0 16-7.2 16-16V160H256c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320zM0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z"/>
    <path d="M145 289.3L118.7 316.9c-2.9 3.1-7.1 4.9-11.5 4.9-8.8 0-16-7.2-16-16s7.2-16 16-16c4.1 0 8.1 1.6 11.1 4.4l17 16c2.1 2 5.5 2 7.6 0l49.3-46.6c3-2.8 7-4.4 11.1-4.4 8.8 0 16 7.2 16 16s-7.2 16-16 16c-4.4 0-8.6-1.8-11.5-4.9L145 289.3z"/>
  </svg>
);

const OtpIcon = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" className="step-icon">
    <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
  </svg>
);

const MobileIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="step-icon">
    <path d="M80 48c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16h224c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H80zM16 64C16 28.7 44.7 0 80 0h224c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H80c-35.3 0-64-28.7-64-64V64zM160 400h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H160c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>
  </svg>
);

const CertificateIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="step-icon">
    <path d="M173.8 5.5c11-7.3 25.4-7.3 36.4 0L228 17.2c6 3.9 13 5.8 20.1 5.4l21.3-1.3c13.2-.8 25.6 6.4 31.5 18.2l9.6 19.1c3.2 6.4 8.4 11.5 14.7 14.7L344.5 83c11.8 5.9 19 18.3 18.2 31.5l-1.3 21.3c-.4 7.1 1.5 14.2 5.4 20.1l11.8 17.8c7.3 11 7.3 25.4 0 36.4L366.8 228c-3.9 6-5.8 13-5.4 20.1l1.3 21.3c.8 13.2-6.4 25.6-18.2 31.5l-19.1 9.6c-6.4 3.2-11.5 8.4-14.7 14.7L301 344.5c-5.9 11.8-18.3 19-31.5 18.2l-21.3-1.3c-7.1-.4-14.2 1.5-20.1 5.4l-17.8 11.8c-11 7.3-25.4 7.3-36.4 0L156 366.8c-6-3.9-13-5.8-20.1-5.4l-21.3 1.3c-13.2 .8-25.6-6.4-31.5-18.2l-9.6-19.1c-3.2-6.4-8.4-11.5-14.7-14.7L39.5 301c-11.8-5.9-19-18.3-18.2-31.5l1.3-21.3c.4-7.1-1.5-14.2-5.4-20.1L5.5 210.2c-7.3-11-7.3-25.4 0-36.4L17.2 156c3.9-6 5.8-13 5.4-20.1l-1.3-21.3c-.8-13.2 6.4-25.6 18.2-31.5l19.1-9.6C65 70.2 70.2 65 73.4 58.6L83 39.5c5.9-11.8 18.3-19 31.5-18.2l21.3 1.3c7.1 .4 14.2-1.5 20.1-5.4L173.8 5.5zM272 192a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM112 384a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144 96a96 96 0 1 0 0-192 96 96 0 1 0 0 192z"/>
  </svg>
);

const Pethome = ({user}) => {
  // State for active service
  const [activeService, setActiveService] = useState(null);

  // Mock data
  const services = [
    {
      id: 'new',
      title: 'New Registration',
      background: '#f6d365',
      fees: {
        foreign: '₹ 1000',
        indian: '₹ 200'
      },
      buttonText: 'Register Now'
    },
    {
      id: 'renewal',
      title: 'Registration Renewal',
      background: '#4ad2a9',
      fees: {
        foreign: '₹ 1000',
        indian: '₹ 200'
      },
      buttonText: 'Renew Now'
    },
    {
      id: 'update',
      title: 'Update Rabies Certifications',
      background: '#b7e49d',
      fees: {
        foreign: '₹ 1000',
        indian: '₹ 200'
      },
      buttonText: 'Update Now'
    }
  ];

  const steps = [
    {
      id: 'login',
      title: 'Login',
      description: 'Login With your Phone number And OTP',
      icon: <MobileIcon />
    },
    {
      id: 'otp',
      title: 'OTP Confirmation',
      description: 'Verify OTP and Verification Details',
      icon: <OtpIcon />
    },
    {
      id: 'details',
      title: 'Enter Details',
      description: 'Select Breed and enter Required Pet Details',
      icon: <FormIcon />
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'After Verification certificate will be Issued',
      icon: <CertificateIcon />
    }
  ];

  return (
    <div className="pet-app">
      {/* Hero Section */}
     {/* Hero Section */}
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
  {/* About Us Section */}
     {/* About Us Section */}
<div className="about-section">
  <div className="container">
    <div className="about-grid">
      <div className="about-text">
        <h2>About Us</h2>
        <p>
          Nagar Nigam Lucknow, also known as Lucknow Municipal Corporation, is
          the governing body responsible for the administration and
          development of Lucknow city. Established with the aim of enhancing the
          quality of life for citizens, we strive to deliver essential services in areas
          such as sanitation, water supply, urban planning, and community
          development.
        </p>
        <button className="btn btn-outline">More About Us</button>
      </div>
      <div className="officials-gallery">
        <div className="official-card main-official">
          <div className="official-image-container">
            <img
              src="./yogi.png"
              alt="Chief Minister"
              className="responsive-cover circle-frame"
            />
          </div>
          <div className="official-info">
            <h3>Shri Yogi Adityanath</h3>
            <p>Chief Minister</p>
          </div>
        </div>
        <div className="officials-row">
          {['Inderajeet Singh', 'Sushma Kharkwal'].map((name, idx) => (
            <div className="official-card" key={idx}>
              <div className="official-image-container">
                <img
                  src="https://picsum.photos/200"
                  alt={name}
                  className="responsive-cover circle-frame"
                />
              </div>
              <div className="official-info">
                <h3>{`Shr${name.includes('Sushma') ? 'mati' : 'i'} ${name}`}</h3>
                <p>
                  {name.includes('Inderajeet')
                    ? 'Nagar Ayukt Lucknow'
                    : 'Mayor Lucknow'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Services Section */}
    {/* Services Section */}
<div className="services-section">
  <div className="container">
    <h2>Services We Offer</h2>
    <div className="services-grid">
      {services.map(service => (
        <div className="service-card" key={service.id}>
          <div
            className="service-image"
            style={{ backgroundColor: service.background }}
          >
            <img
              src={`https://picsum.photos/seed/service${service.id}/300/200`}
              alt={service.title}
              className="responsive-cover"
            />
            <div className="service-title">
              <h3>{service.title}</h3>
            </div>
          </div>
          <div className="service-details">
            <div className="fee-grid">
              <div className="fee-header">New Registration</div>
              <div className="fee-header">Certificate Processing Fee</div>
              <div className="fee-row">Foreign Breed</div>
              <div className="fee-row">{service.fees.foreign}</div>
              <div className="fee-row">Indian Breed</div>
              <div className="fee-row">{service.fees.indian}</div>
            </div>
            <button className="btn btn-secondary">{service.buttonText}</button>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

      {/* How to Register Section */}
      <div className="register-steps-section">
        <div className="container">
          <h2>How to Register</h2>
          <div className="steps-container">
            {steps.map((step, index) => (
              <div className="step-card" key={step.id}>
                <div className="step-icon-container">
                  {step.icon}
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
          <div className="register-button-container">
            <button className="btn btn-primary">Register Now</button>
          </div>
        </div>
      </div>

    

      {/* Information Section */}
      <div className="info-section">
        <div className="container">
          <div className="info-grid">
            <div className="pet-image-container">
              {/* Will be provided by background in CSS */}
              <div className="municipality-info">
                <h3>Nagar Nigam</h3>
                <p>2025-5-10</p>
                <p>
                  Nagar Nigam Lucknow, your gateway to the vibrant capital city of Uttar Pradesh. We are committed to
                  providing efficient and transparent municipal services to the residents and visitors of Lucknow, ensuring
                  a clean, green, and sustainable environment for all.
                </p>
              </div>
            </div>
            <div className="general-info">
              <h2>General Information</h2>
              <p>
                application gets completed. After 1 month the
                application gets cancelled and the user will
                be required to register themselves.
              </p>
              <h3>Penalty:</h3>
              <ul>
                <li>
                  The user will be eligible for the penalty if any
                  complaint has been registered against them
                  by any manual mode.
                </li>
                <li>
                  Once the financial year ends, the user will be
                </li>
                <li>
                  After the expiration of the certificate, if the
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="copyright">
              2020 © PCS Management Consultancy Pvt. Ltd. - All rights reserved.
            </div>
            <div className="support">
              Please feel free to contact our dedicated support team at 9918000241. Our support hours are Mo
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pethome;