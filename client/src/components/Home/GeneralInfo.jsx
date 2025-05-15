import React from 'react';
import './styles/GeneralInfo.css';

const GeneralInformation = () => {
  return (
    <section className="gov-portal-info-module">
      <div className="gov-portal-info-container">
        <h1 className="gov-portal-info-title">General Information</h1>

        <div className="info-card-wrapper">
          <div className="gov-portal-info-card">
            <h2 className="gov-portal-info-card-title">General Information</h2>
            <p className="moving-warning" aria-live="polite">
              The application gets completed after verification. After 1 month the
              application gets cancelled and the user will
              be required to register themselves again.
            </p>
            <h3 className="penalty-heading">Penalty:</h3>
            <ul className="penalty-list">
              <li className="penalty-list-item">
                The user will be eligible for the penalty if any
                complaint has been registered against them
                by any manual mode.
              </li>
              <li className="penalty-list-item">
                Once the financial year ends, the user will be
                required to renew their pet registration.
              </li>
              <li className="penalty-list-item">
                After the expiration of the certificate, if the
                pet is found without valid registration, additional penalties may apply.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GeneralInformation;