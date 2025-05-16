import React, { useState } from 'react';
import './styles/RenewRegistration.css';

const RenewRegistration = () => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [error, setError] = useState('');
  const backend = "https://dog-registration.onrender.com";

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setRequestSubmitted(false);
    setLicense(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${backend}/api/license/renew-registration?licenseNumber=${encodeURIComponent(licenseNumber)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch license');
      }

 if (data.license) {
  if (data.license.status === 'renewal_pending') {
    setError('A renewal request has already been submitted for this license.');
    setLicense(null);
  } else {
    setLicense(data.license);
  }
} else {
  setError('License not found');
}

    } catch (err) {
      setError(err.message || 'Error fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewRequest = async () => {
    setError('');
    setRenewalLoading(true);

    try {
      const response = await fetch(`${backend}/api/license/renew-registration/request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ licenseNumber })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Renewal request failed');
      }

      setRequestSubmitted(true);
      setLicense(null);
      setLicenseNumber('');
    } catch (err) {
      setError(err.message || 'Renewal request failed. Please try again.');
    } finally {
      setRenewalLoading(false);
    }
  };

  return (
    <main className="rr-container">
      <h1 className="rr-title">Renew Registration</h1>

      {requestSubmitted ? (
        <div className="rr-success-container">
          <p className="rr-success">
            Your renewal request has been submitted for admin approval.
          </p>
          <p>You will be notified once it's processed.</p>
          <button 
            className="rr-button"
            onClick={() => {
              setRequestSubmitted(false);
              setLicenseNumber('');
            }}
          >
            Request Another Renewal
          </button>
        </div>
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
            <button 
              type="submit" 
              className="rr-button"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {loading && <p className="rr-status">Loading…</p>}
          {error && <p className="rr-error">{error}</p>}

          {license && (
            <section className="rr-card">
              <h2 className="rr-subtitle">Current Details</h2>
              <dl>
                <div className="rr-row">
                  <dt>Dog Name</dt>
                  <dd>{license.dog.name}</dd>
                </div>
                <div className="rr-row">
                  <dt>License No.</dt>
                  <dd>{license.license_Id}</dd>
                </div>
                <div className="rr-row">
                  <dt>Current Expiry Date</dt>
                  <dd>{new Date(license.expiryDate).toLocaleDateString()}</dd>
                </div>
                <div className="rr-row">
                  <dt>New Expiry Date</dt>
                  <dd>
                    {new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1)
                    ).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
              <button
                onClick={handleRenewRequest}
                className="rr-button rr-button--renew"
                disabled={renewalLoading}
              >
                {renewalLoading ? 'Submitting...' : 'Request Renewal'}
              </button>
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default RenewRegistration;