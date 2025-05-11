import React, { useState } from 'react';
import './styles/RenewRegistration.css';

const RenewRegistration = () => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [renewed, setRenewed] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = e => {
    e.preventDefault();
    setError('');
    setRenewed(false);
    setLicense(null);
    setLoading(true);

    fetch(`/api/renew-registration?licenseNumber=${encodeURIComponent(licenseNumber)}`)
      .then(res => res.json())
      .then(data => {
        if (data.license) {
          setLicense(data.license);
        } else {
          setError('License not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error fetching data. Please try again.');
        setLoading(false);
      });
  };

  const handleRenew = () => {
    setError('');
    fetch('/api/renew-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseNumber })
    })
      .then(res => {
        if (res.ok) setRenewed(true);
        else throw new Error();
      })
      .catch(() => {
        setError('Renewal failed. Please try again.');
      });
  };

  return (
    <main className="rr-container">
      <h1 className="rr-title">Renew Registration</h1>

      {renewed ? (
        <p className="rr-success">
          Your registration has been successfully renewed.
        </p>
      ) : (
        <>
          <form onSubmit={handleSearch} className="rr-search-form" noValidate>
            <label htmlFor="licenseNumber" className="rr-label">
              License Number
            </label>
            <input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              className="rr-input"
              value={licenseNumber}
              onChange={e => setLicenseNumber(e.target.value)}
              required
            />
            <button type="submit" className="rr-button">
              Search
            </button>
          </form>

          {loading && <p className="rr-status">Loading…</p>}
          {error && <p className="rr-error">{error}</p>}

          {license && (
            <section className="rr-card">
              <h2 className="rr-subtitle">Current Details</h2>
              <dl>
                <div className="rr-row">
                  <dt>Owner</dt>
                  <dd>{license.owner}</dd>
                </div>
                <div className="rr-row">
                  <dt>Dog Name</dt>
                  <dd>{license.dogName}</dd>
                </div>
                <div className="rr-row">
                  <dt>License No.</dt>
                  <dd>{license.licenseNumber}</dd>
                </div>
                <div className="rr-row">
                  <dt>Expiry Date</dt>
                  <dd>{license.expiryDate}</dd>
                </div>
              </dl>
              <button
                onClick={handleRenew}
                className="rr-button rr-button--renew"
              >
                Renew Now
              </button>
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default RenewRegistration;
