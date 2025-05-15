import React from 'react';
import './styles/Services.css'; // Link to the CSS file

const Services = () => {
  // Data for services with government-appropriate muted colors for visuals
  const portalServices = [
    {
      id: 'reg001', // Unique ID
      heading: 'New Application Submission', // More formal title
      // visualColor: '#e9eff3', // Muted background color (not strictly needed with image cover)
      feeInfo: {
        foreign: '₹ 1000',
        indian: '₹ 200'
      },
      actionText: 'Start New Application' // Clear action text
    },
    {
      id: 'ren002', // Unique ID
      heading: 'Existing Application Renewal', // More formal title
      // visualColor: '#dce4e9', // Muted background color
      feeInfo: {
        foreign: '₹ 1000',
        indian: '₹ 200'
      },
      actionText: 'Renew Application' // Clear action text
    },
    {
      id: 'upd003', // Unique ID
      heading: 'Update Documentation', // More formal title
      // visualColor: '#d0dae0', // Muted background color
      feeInfo: {
        foreign: '₹ 1000',
        indian: '₹ 200'
      },
      actionText: 'Submit Updates' // Clear action text
    }
  ];

  return (
    <section className="gov-portal-services-module">
      <div className="gov-portal-services-container">
        <h2 className="gov-portal-services-title">Our Services</h2>
        <div className="gov-portal-services-grid-layout">
          {portalServices.map(service => (
            <div className="gov-portal-service-item" key={service.id}>
              {/* Removed background color style as image will cover */}
              <div className="gov-portal-service-visual">
                 {/* Using Picsum with the 'dogs' category for random dog images */}
                <img
                  // Use a consistent seed for potentially different dogs on each card,
                  // or remove seed for completely random on each load.
                  // Using a fixed seed 'dogs' might give the same image,
                  // using service.id as seed gives different images per card,
                  // using a random number would give different images per page load.
                  // Let's use service.id as seed for variety per card.
                  src={`https://picsum.photos/seed/pet/400/400`}
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
                  <div className="gov-portal-service-fee-row">Foreign National</div>
                  <div className="gov-portal-service-fee-row">{service.feeInfo.foreign}</div>
                  <div className="gov-portal-service-fee-row">Indian Citizen</div>
                  <div className="gov-portal-service-fee-row">{service.feeInfo.indian}</div>
                </div>
                <button className="gov-portal-action-button">{service.actionText}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;