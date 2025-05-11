import React, { useEffect, useState } from 'react';
import './styles/Download.css';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const DogLicenseDownload = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/api/license/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setLicenses(data || []);
        setLoading(false);
      })
      .catch(() => {
        setLicenses([]);
        setLoading(false);
      });
  }, []);

  const toggleCard = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <main className="dl-container">
      <h1 className="dl-title">My Dog License Applications</h1>

      {loading ? (
        <p className="dl-status">Loading license data…</p>
      ) : licenses.length > 0 ? (
        licenses.map(license => {
          const expanded = expandedId === license._id;
          const d = license.dog || {};
          const a = license.address || {};
          return (
            <section
              className={`dl-card ${expanded ? 'expanded' : ''}`}
              key={license._id}
              onClick={() => toggleCard(license._id)}
            >
              <div className="dl-summary">
                {d.name || 'Unnamed Dog'} — {license.status}
              </div>

              <div className="dl-details">
                <dl>
                  <div className="dl-row"><dt>Owner Name</dt><dd>{license.fullName}</dd></div>
                  <div className="dl-row"><dt>Phone Number</dt><dd>{license.phoneNumber}</dd></div>
                  <div className="dl-row"><dt>Gender</dt><dd>{license.gender}</dd></div>
                  <div className="dl-row"><dt>Street</dt><dd>{a.streetName}</dd></div>
                  <div className="dl-row"><dt>Pin Code</dt><dd>{a.pinCode}</dd></div>
                  <div className="dl-row"><dt>City</dt><dd>{a.city}</dd></div>
                  <div className="dl-row"><dt>State</dt><dd>{a.state}</dd></div>
                  <div className="dl-row"><dt>House Area</dt><dd>{license.totalHouseArea}</dd></div>
                  <div className="dl-row"><dt>Number of Dogs</dt><dd>{license.numberOfDogs}</dd></div>

                  <div className="dl-row"><dt>Dog Name</dt><dd>{d.name}</dd></div>
                  <div className="dl-row"><dt>Breed</dt><dd>{d.breed}</dd></div>
                  <div className="dl-row"><dt>Category</dt><dd>{d.category}</dd></div>
                  <div className="dl-row"><dt>Color</dt><dd>{d.color}</dd></div>
                  <div className="dl-row"><dt>Age</dt><dd>{d.age}</dd></div>
                  <div className="dl-row"><dt>Dog's gender</dt><dd>{d.sex}</dd></div>
                 <div className="dl-row"><dt>Vaccinated</dt><dd>{d.vaccinationProofUrl ? 'Yes' : 'No'}</dd></div>

                  <div className="dl-row"><dt>Date of Vaccination</dt><dd>{formatDate(d.dateOfVaccination)}</dd></div>
                  <div className="dl-row"><dt>Due Vaccination</dt><dd>{formatDate(d.dueVaccination)}</dd></div>
                  <div className="dl-row"><dt>Vaccination Proof</dt><dd><a href={d.vaccinationProofUrl} target="_blank" rel="noreferrer">View PDF</a></dd></div>
                  <div className="dl-row"><dt>Microchipped</dt><dd>{d.microchipped ? 'Yes' : 'No'}</dd></div>
                  <div className="dl-row"><dt>Issued By</dt><dd>{license.issuedBy || 'N/A'}</dd></div>
                  <div className="dl-row"><dt>Status</dt><dd>{license.status}</dd></div>
                  <div className="dl-row"><dt>Submitted On</dt><dd>{formatDate(license.createdAt)}</dd></div>
                  {license.updatedAt && (
                    <div className="dl-row"><dt>Last Updated</dt><dd>{formatDate(license.updatedAt)}</dd></div>
                  )}
                  {license.expiryDate && (
                    <div className="dl-row"><dt>Expiry Date</dt><dd>{formatDate(license.expiryDate)}</dd></div>
                  )}
                </dl>

                {d.avatarUrl && (
                  <div className="dl-avatar">
                    <img
                      src={d.avatarUrl}
                      alt="Dog Avatar"
                      className="dl-avatar-img"
                    />
                  </div>
                )}

                {license.status === 'approved' && license.downloadLink && (
                  <a
                    href={license.downloadLink}
                    download
                    className="dl-button"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Download PDF
                  </a>
                )}
              </div>
            </section>
          );
        })
      ) : (
        <p className="dl-no-data">You have not applied for any licenses yet.</p>
      )}
    </main>
  );
};

export default DogLicenseDownload;
