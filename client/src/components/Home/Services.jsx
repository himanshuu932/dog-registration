import React from 'react';
import './styles/Services.css';
import { useNavigate } from 'react-router-dom';

const Services = ({ languageType = 'en' }) => {
  const navigate = useNavigate();

  // Language content
  const content = {
    en: {
      title: "Our Services",
      services: [
        {
          id: 'reg001',
          heading: 'New Application Submission',
          feeInfo: { // Corrected fees based on PDF (₹200 annual)
            foreign: '₹ 200', // Assuming single fee applies to all as per PDF
            indian: '₹ 200'
          },
          actionText: 'Start New Application',
          image: './image1.webp',
          route: '/pet-register'
        },
        {
          id: 'ren002',
          heading: 'Existing Application Renewal',
          feeInfo: { // Corrected fees based on PDF (₹100 renewal)
            foreign: '₹ 100', // Assuming single fee applies to all as per PDF
            indian: '₹ 100'
          },
          actionText: 'Renew Application',
          image: './image2.webp',
          route: '/renew-register'
        }
        // Removed Update Documentation service
      ],
      feeHeaders: {
          type: 'Applicant Type',
          fee: 'Processing Fee' // Or 'License Fee'
      },
      breedTypes: {
          foreign: 'Foreign Breed',
          indian: 'Indian Breed'
      }
    },
    hi: {
      title: "हमारी सेवाएं",
      services: [
        {
          id: 'reg001',
          heading: 'नया आवेदन जमा करना',
          feeInfo: { // Corrected fees based on PDF (₹200 annual)
            foreign: '₹ 200', // Assuming single fee applies to all as per PDF
            indian: '₹ 200'
          },
          actionText: 'नया आवेदन शुरू करें',
          image: './image1.webp',
          route: '/pet-register'
        },
        {
          id: 'ren002',
          heading: 'मौजूदा आवेदन का नवीनीकरण',
          feeInfo: { // Corrected fees based on PDF (₹100 renewal)
            foreign: '₹ 100', // Assuming single fee applies to all as per PDF
            indian: '₹ 100'
          },
          actionText: 'आवेदन नवीनीकृत करें',
          image: './image2.webp',
          route: '/renew-register'
        }
        // Removed Update Documentation service
      ],
       feeHeaders: {
          type: 'आवेदक का प्रकार',
          fee: 'लाइसेंस शुल्क' // Using 'लाइसेंस शुल्क' based on PDF context
      },
       breedTypes: {
          foreign: 'विदेशी नस्ल',
          indian: 'भारतीय नस्ल'
      }
    }
  };

  const currentContent = content[languageType] || content.en; // Default to English

  const handleServiceClick = (route) => {
    navigate(route);
  };

  return (
    <section className="gov-portal-services-module">
      <div className="gov-portal-services-container">
        <h2 className="gov-portal-services-title">{currentContent.title}</h2>
        <div className="gov-portal-services-grid-layout">
          {currentContent.services.map(service => (
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
                  <div className="gov-portal-service-fee-header">{currentContent.feeHeaders.type}</div>
                  <div className="gov-portal-service-fee-header">{currentContent.feeHeaders.fee}</div>
                  <div className="gov-portal-service-fee-row">{currentContent.breedTypes.foreign}</div>
                  <div className="gov-portal-service-fee-row">{service.feeInfo.foreign}</div>
                  <div className="gov-portal-service-fee-row">{currentContent.breedTypes.indian}</div>
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