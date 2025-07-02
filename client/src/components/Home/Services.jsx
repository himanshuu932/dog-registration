import React, { useState, useEffect } from 'react';
import './styles/Services.css';
import { useNavigate } from 'react-router-dom';

// Define the exact backend URL provided
const API_URL = 'https://dog-registration-yl8x.onrender.com/fees';

const Services = ({ languageType = 'en' }) => {
  const navigate = useNavigate();

  // State for services data, and errors. Initialize services with static content.
  // We remove the 'loading' state that controlled the initial loading overlay.
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null); // This error is for the overall component status

  // Static content (text, images, routes)
  const content = {
    en: {
      title: "Our Services",
      services: [
        {
          id: 'reg001',
          heading: 'New Application Submission',
          actionText: 'Start New Application',
          image: './image1.webp',
          route: '/pet-register',
          feeKey: 'newApplication',
          feeInfo: { fee: 'Loading...' } // Initial state for fee
        },
        {
          id: 'ren002',
          heading: 'Existing Application Renewal',
          actionText: 'Renew Application',
          image: './image2.webp',
          route: '/renew-register',
          feeKey: 'renewal',
          feeInfo: { fee: 'Loading...' } // Initial state for fee
        }
      ],
      feeHeaders: {
          type: 'Breed Type',
          fee: 'Processing Fee'
      },
      breedTypes: {
          foreign: 'Foreign / Indian Breed',
          indian: ''
      },
      errorText: 'Could not load services.', // General error message for the whole component
      fetchingText: 'Fetching...' // Specific text for fee display when fetch fails
    },
    hi: {
      title: "हमारी सेवाएं",
      services: [
        {
          id: 'reg001',
          heading: 'नया आवेदन जमा करना',
          actionText: 'नया आवेदन शुरू करें',
          image: './image1.webp',
          route: '/pet-register',
          feeKey: 'newApplication',
          feeInfo: { fee: 'लोड हो रहा है...' }
        },
        {
          id: 'ren002',
          heading: 'मौजूदा आवेदन का नवीनीकरण',
          actionText: 'आवेदन नवीनीकृत करें',
          image: './image2.webp',
          route: '/renew-register',
          feeKey: 'renewal',
          feeInfo: { fee: 'लोड हो रहा है...' }
        }
      ],
       feeHeaders: {
          type: 'नस्ल का प्रकार',
          fee: 'लाइसेंस शुल्क'
      },
       breedTypes: {
          foreign: 'विदेशी / भारतीय नस्ल',
          indian: ''
      },
      errorText: 'सेवाएं लोड नहीं की जा सकीं।',
      fetchingText: 'Fetching...'
    }
  };

  const currentContent = content[languageType] || content.en;

  // Initialize services with the static content on component mount
  useEffect(() => {
    setServices(currentContent.services);
  }, [languageType]);


  // useEffect to fetch data when the component mounts or language changes
  useEffect(() => {
    const fetchFeesAndBuildServices = async () => {
      setError(null); // Clear overall component error on new fetch attempt

      try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const feesData = await response.json();
        // feesData format: { newRegistrationFee: 200, renewalFee: 100, ... }

        // Combine static content with dynamically fetched fees
        const updatedServices = currentContent.services.map(service => {
          const fee = service.feeKey === 'newApplication'
            ? feesData.newRegistrationFee
            : feesData.renewalFee;
          
          return {
            ...service,
            feeInfo: {
              fee: `₹ ${fee}`
            }
          };
        });
        
        setServices(updatedServices);

      } catch (e) {
        console.error("Failed to fetch service fees:", e);
        // Set feeInfo to 'Fetching...' for individual services on error
        setServices(prevServices => prevServices.map(service => ({
          ...service,
          feeInfo: { fee: currentContent.fetchingText }
        })));
        // You can still set a general error here if you want to display it at the top
        // setError(currentContent.errorText); // Uncomment if you want a top-level error message too
      }
      // No 'finally' block to set loading to false as it's not controlling an overlay now
    };

    fetchFeesAndBuildServices();
  }, [languageType, content]); // Add 'content' to dependency array to re-run if content changes

  const handleServiceClick = (route) => {
    navigate(route);
  };

  // The component always renders immediately
  return (
    <section className="gov-portal-services-module">
      <div className="gov-portal-services-container">
        <h2 className="gov-portal-services-title">{currentContent.title}</h2>
        <div className="gov-portal-services-grid-layout">
          {services.map(service => (
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
                <div className="gov-portal-service-fee-grid gov-portal-service-fee-grid-single">
                  <div className="gov-portal-service-fee-header">{currentContent.feeHeaders.type}</div>
                  <div className="gov-portal-service-fee-header">{currentContent.feeHeaders.fee}</div>
                  <div className="gov-portal-service-fee-row">{currentContent.breedTypes.foreign}</div>
                  <div className="gov-portal-service-fee-row">{service.feeInfo.fee}</div>
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