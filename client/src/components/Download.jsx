import React, { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import './styles/Download.css';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const DogLicenseDownload = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

   const backend = "https://dog-registration.onrender.com";

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${backend}/api/license/user`, {
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

  const downloadPDF = (id, dogName = 'dog') => {
    const element = document.getElementById(`pdf-${id}`);
    const opt = {
      margin: 0.5,
      filename: `Dog_License_${dogName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
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
                <div id={`pdf-${license._id}`} className="pdf-layout">
                  <div className="pdf-border">
                    <div className="pdf-header">
                      <div className="pdf-emblem">
                        <img 
                          src="/api/placeholder/80/80" 
                          alt="Government Emblem" 
                          className="pdf-emblem-img" 
                        />
                      </div>
                      
                      <div className="pdf-contact">
                        <p>Phone: {license.phoneNumber}</p>
                        <p>Email: {license.email || 'info@awbi.org'}</p>
                        <p>Website: www.awbi.org</p>
                      </div>
                    </div>

                    <div className="pdf-certificate-title">
                      <h2>कुत्तों के पंजीकरण के लिए अधिकृत पत्र</h2>
                      <h3>OFFICIAL DOG LICENSE CERTIFICATE</h3>
                    </div>

                    <div className="pdf-body">
                      <div className="pdf-photo-section">
                        <div className="pdf-info-block">
                          <div className="pdf-info-row">
                            <div className="pdf-info-label">नाम / Name</div>
                            <div className="pdf-info-value">: {license.fullName}</div>
                          </div>
                          <div className="pdf-info-row">
                            <div className="pdf-info-label">पंजीकरण संख्या / Registration No.</div>
                            <div className="pdf-info-value">: {license._id}</div>
                          </div>
                          <div className="pdf-info-row">
                            <div className="pdf-info-label">जारी दिनांक / Issue Date</div>
                            <div className="pdf-info-value">: {formatDate(license.createdAt)}</div>
                          </div>
                          <div className="pdf-info-row">
                            <div className="pdf-info-label">समाप्ति तिथि / Expiry Date</div>
                            <div className="pdf-info-value">: {formatDate(license.expiryDate)}</div>
                          </div>
                        </div>
                        <div className="pdf-photo-box">
                          {d.avatarUrl ? (
                            <img src={d.avatarUrl} alt="Dog" className="pdf-photo" />
                          ) : (
                            <div className="pdf-photo-placeholder">पशु की तस्वीर / Dog's Photo</div>
                          )}
                        </div>
                      </div>

                      <div className="pdf-details-section">
                        <div className="pdf-section-title">पशु का विवरण / Animal Details</div>
                        <div className="pdf-details-table">
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">पशु का नाम / Dog Name</div>
                            <div className="pdf-details-value">: {d.name}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">नस्ल / Breed</div>
                            <div className="pdf-details-value">: {d.breed}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">वर्ग / Category</div>
                            <div className="pdf-details-value">: {d.category}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">रंग / Color</div>
                            <div className="pdf-details-value">: {d.color}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">आयु / Age</div>
                            <div className="pdf-details-value">: {d.age}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">लिंग / Gender</div>
                            <div className="pdf-details-value">: {d.sex}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">टीकाकरण / Vaccinated</div>
                            <div className="pdf-details-value">: {d.vaccinationProofUrl ? 'हां / Yes' : 'नहीं / No'}</div>
                          </div>
                          {d.vaccinationProofUrl && (
  <div className="pdf-details-row">
    <div className="pdf-details-label">टीकाकरण प्रमाणपत्र / Vaccination Certificate</div>
    <div className="pdf-details-value">
      <a 
        src={d.vaccinationProofUrl} 
        alt="Vaccination Certificate" 
        className="pdf-vaccine-img" >View </a>
     
    </div>
  </div>
)}

                          <div className="pdf-details-row">
                            <div className="pdf-details-label">टीकाकरण की तारीख / Vaccination Date</div>
                            <div className="pdf-details-value">: {formatDate(d.dateOfVaccination)}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">अगला टीकाकरण / Next Vaccination</div>
                            <div className="pdf-details-value">: {formatDate(d.dueVaccination)}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">माइक्रोचिप / Microchipped</div>
                            <div className="pdf-details-value">: {d.microchipped ? 'हां / Yes' : 'नहीं / No'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="pdf-details-section">
                        <div className="pdf-section-title">मालिक का विवरण / Owner Details</div>
                        <div className="pdf-details-table">
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">पता / Address</div>
                            <div className="pdf-details-value">: {`${a.streetName}, ${a.city}, ${a.state} - ${a.pinCode}`}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">फोन नंबर / Phone Number</div>
                            <div className="pdf-details-value">: {license.phoneNumber}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">कुत्तों की संख्या / No. of Dogs</div>
                            <div className="pdf-details-value">: {license.numberOfDogs}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">घर का क्षेत्रफल / House Area</div>
                            <div className="pdf-details-value">: {license.totalHouseArea}</div>
                          </div>
                        </div>
                      </div>

                      <div className="pdf-declaration">
                        <p>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।</p>
                        <p>I declare that the information provided above is true to the best of my knowledge.</p>
                      </div>

                      <div className="pdf-signatures">
                        <div className="pdf-signature-block">
                          <div className="pdf-signature-line"></div>
                          <p>आवेदक के हस्ताक्षर / Applicant's Signature</p>
                        </div>
                        <div className="pdf-signature-block">
                          <div className="pdf-signature-line"></div>
                          <p>जारीकर्ता अधिकारी / Issuing Authority</p>
                        </div>
                      </div>

                      <div className="pdf-footer">
                        <div className="pdf-qr-code">
                          <div className="pdf-qr-placeholder"></div>
                          <p>QR Code</p>
                        </div>
                        <div className="pdf-stamp">
                          <div className="pdf-stamp-placeholder">
                            <p>OFFICIAL STAMP</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {license.status === 'approved' && (
                  <button
                    className="dl-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPDF(license._id, d.name);
                    }}
                  >
                    Download PDF
                  </button>
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