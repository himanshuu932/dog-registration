import React from 'react';
import './styles/Services.css';

const Services = () => {
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

  return (
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
  );
};

export default Services;