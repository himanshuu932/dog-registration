import React, { useEffect, useState } from 'react';
import './styles/Download.css';

const DogLicenseDownload = () => {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dog-license')
      .then(res => res.json())
      .then(data => {
        setLicense(data.license || null);
        setLoading(false);
      })
      .catch(() => {
        setLicense(null);
        setLoading(false);
      });
  }, []);

  return (
    <main className="dl-container">
      <h1 className="dl-title">Dog License Download</h1>

      {loading ? (
        <p className="dl-status">Loading license data…</p>
      ) : license ? (
        <section className="dl-card">
          <dl>
            <div className="dl-row">
              <dt>Owner</dt><dd>{license.owner}</dd>
            </div>
            <div className="dl-row">
              <dt>Dog Name</dt><dd>{license.dogName}</dd>
            </div>
            <div className="dl-row">
              <dt>License No.</dt><dd>{license.licenseNumber}</dd>
            </div>
          </dl>
          <a
            href={license.downloadLink}
            download
            className="dl-button"
            aria-label="Download your dog license PDF"
          >
            Download PDF
          </a>
        </section>
      ) : (
        <p className="dl-no-data">No license issued</p>
      )}
    </main>
  );
};

export default DogLicenseDownload;
