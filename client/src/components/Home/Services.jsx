import React from 'react';
import './styles/Services.css';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate();

  // Data for services
  const portalServices = [
    {
      id: 'reg001',
      heading: 'New Application Submission',
      feeInfo: {
        foreign: '₹ 1000',
        indian: '₹ 200'
      },
      actionText: 'Start New Application',
      image: './image1.webp',
      route: '/pet-register'
    },
    {
      id: 'ren002',
      heading: 'Existing Application Renewal',
      feeInfo: {
        foreign: '₹ 1000',
        indian: '₹ 200'
      },
      actionText: 'Renew Application',
      image: './image2.webp',
      route: '/renew-register'
    },
    {
      id: 'upd003',
      heading: 'Update Documentation',
      feeInfo: {
        foreign: '₹ 1000',
        indian: '₹ 200'
      },
      actionText: 'Submit Updates',
      image: './image.webp',
      route: '/pet-register'
    }
  ];

  const handleServiceClick = (route) => { // Corrected to JavaScript syntax
    navigate(route);
  };

  return (
    <section className="gov-portal-services-module">
      <div className="gov-portal-services-container">
        <h2 className="gov-portal-services-title">Our Services</h2>
        <div className="gov-portal-services-grid-layout">
          {portalServices.map(service => (
            <div className="gov-portal-service-item" key={service.id}>
              <div className="gov-portal-service-visual">
                <img
                  src={service.image}
                  alt={`Image related to ${service.heading}`}
                  className="gov-portal-service-image-cover"
                />
                <div className="gov-portal-service-heading">
                  <h3>{service.heading}</h3>
                </div>
              </div>
              <div className="gov-portal-service-details-block">
                <div className="gov-portal-service-fee-grid">
                  <div className="gov-portal-service-fee-header">Applicant Type</div>
                  <div className="gov-portal-service-fee-header">Processing Fee</div>
                  <div className="gov-portal-service-fee-row">Foreign Breed</div>
                  <div className="gov-portal-service-fee-row">{service.feeInfo.foreign}</div>
                  <div className="gov-portal-service-fee-row">Indian Breed</div>
                  <div className="gov-portal-service-fee-row">{service.feeInfo.indian}</div>
                </div>
                <button
                  className="gov-portal-action-button"
                  onClick={() => handleServiceClick(service.route)}
                >
                  {service.actionText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
