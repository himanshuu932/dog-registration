import React from 'react';
import './styles/GeneralInformation.css';

const GeneralInformation = () => {
  return (
    <div className="info-section">
      <div className="container">
        <div className="info-grid">
          <div className="pet-image-container">
            {/* Background image will be loaded through CSS */}
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
            {/* Applied moving-warning class to the warning paragraph */}
            <p className="moving-warning">
              The application gets completed after verification. After 1 month the
              application gets cancelled and the user will
              be required to register themselves again.
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
                required to renew their pet registration.
              </li>
              <li>
                After the expiration of the certificate, if the
                pet is found without valid registration, additional penalties may apply.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInformation;