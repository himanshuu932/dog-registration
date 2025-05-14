import React, { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import './styles/Download.css';
import { 
  Download, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Image 
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

// Function to get current formatted date
const getCurrentDate = () => {
  const now = new Date();
  return now.toLocaleDateString();
};

const StatusBadge = ({ status }) => {
  let badgeClass = "dl-status-badge";
  let Icon = AlertCircle;
  
  switch(status.toLowerCase()) {
    case 'approved':
      badgeClass += " dl-status-approved";
      Icon = CheckCircle;
      break;
    case 'pending':
      badgeClass += " dl-status-pending";
      Icon = Clock;
      break;
    case 'rejected':
      badgeClass += " dl-status-rejected";
      Icon = XCircle;
      break;
    default:
      badgeClass += " dl-status-default";
  }
  
  return (
    <span className={badgeClass}>
      <Icon size={16} />
      <span>{status}</span>
    </span>
  );
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
      <header className="dl-header">
        <h1 className="dl-title">My Dog License Applications</h1>
        <div className="dl-filters">
          <span className="dl-filter-label">Filter by:</span>
          <button className="dl-filter-btn dl-filter-all dl-filter-active">All</button>
          <button className="dl-filter-btn dl-filter-approved">Approved</button>
          <button className="dl-filter-btn dl-filter-pending">Pending</button>
        </div>
      </header>

      {loading ? (
        <div className="dl-loading">
          <div className="dl-spinner"></div>
          <p className="dl-status">Loading license data…</p>
        </div>
      ) : licenses.length > 0 ? (
        <div className="dl-cards-container">
          {licenses.map(license => {
            const expanded = expandedId === license._id;
            const d = license.dog || {};
            const a = license.address || {};
            return (
              <section
                className={`dl-card ${expanded ? 'expanded' : ''}`}
                key={license._id}
                onClick={() => toggleCard(license._id)}
              >
                <div className="dl-card-header">
                  <div className="dl-card-icon">
                    <FileText size={24} />
                  </div>
                  <div className="dl-summary">
                    <h2>{d.name || 'Unnamed Dog'}</h2>
                    <div className="dl-license-meta">
                      <StatusBadge status={license.status} />
                      <span className="dl-date">
                        <Calendar size={14} />
                        Applied: {formatDate(license.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="dl-expand-icon">
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                <div className="dl-details">
                  <div className="dl-quick-info">
                    <div className="dl-quick-info-item">
                      <span className="dl-quick-label">Breed:</span>
                      <span className="dl-quick-value">{d.breed || 'Not specified'}</span>
                    </div>
                    <div className="dl-quick-info-item">
                      <span className="dl-quick-label">Gender:</span>
                      <span className="dl-quick-value">{d.sex || 'Not specified'}</span>
                    </div>
                    <div className="dl-quick-info-item">
                      <span className="dl-quick-label">Vaccinated:</span>
                      <span className="dl-quick-value dl-quick-icon">
                        {d.vaccinationProofUrl ? 
                          <><CheckCircle size={16} className="dl-icon-check" /> Yes</> : 
                          <><XCircle size={16} className="dl-icon-cross" /> No</>
                        }
                      </span>
                    </div>
                    <div className="dl-quick-info-item">
                      <span className="dl-quick-label">Microchipped:</span>
                      <span className="dl-quick-value dl-quick-icon">
                        {d.microchipped ? 
                          <><CheckCircle size={16} className="dl-icon-check" /> Yes</> : 
                          <><XCircle size={16} className="dl-icon-cross" /> No</>
                        }
                      </span>
                    </div>
                  </div>

                  {/* PDF Layout for Download - Kept untouched as requested */}
                  <div id={`pdf-${license._id}`} className="pdf-layout">
                    <div className="pdf-border">
                      <div className="pdf-header">
                        <div className="pdf-header-left">
                          <div className="pdf-logo-icon">
                            <img src="./logo.png" alt="logo" />
                          </div>
                          <div className="pdf-org-name">
                            <h3>Nagar Nigam Gorakhpur</h3>
                            <h4>नगर निगम गोरखपुर</h4>
                          </div>
                        </div>
                        <div className="pdf-header-right">
                          <div className="pdf-date">
                            <span> Date: {getCurrentDate()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pdf-certificate-title">
                        <h3>OFFICIAL DOG LICENSE CERTIFICATE</h3>
                        <h2>कुत्तों के पंजीकरण के लिए अधिकृत पत्र</h2>
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
                          <div className="pdf-details-columns">
                            <div className="pdf-details-column-left">
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
                                <div className="pdf-details-label">टीकाकरण की तारीख / Vaccination Date</div>
                                <div className="pdf-details-value">: {formatDate(d.dateOfVaccination)}</div>
                              </div>
                            </div>
                            <div className="pdf-details-column-right">
                              <div className="pdf-details-row">
                                <div className="pdf-details-label">लिंग / Gender</div>
                                <div className="pdf-details-value">: {d.sex}</div>
                              </div>
                              <div className="pdf-details-row">
                                <div className="pdf-details-label">टीकाकरण / Vaccinated</div>
                                <div className="pdf-details-value">
                                  : <span className={d.vaccinationProofUrl ? "status-icon check" : "status-icon cross"}></span>
                                  {d.vaccinationProofUrl ? ' हां / Yes' : ' नहीं / No'}
                                </div>
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
                                <div className="pdf-details-label">माइक्रोचिप / Microchipped</div>
                                <div className="pdf-details-value">
                                  : <span className={d.microchipped ? "status-icon check" : "status-icon cross"}></span>
                                  {d.microchipped ? ' हां / Yes' : ' नहीं / No'}
                                </div>
                              </div>
                              <div className="pdf-details-row">
                                <div className="pdf-details-label">अगला टीकाकरण / Next Vaccination</div>
                                <div className="pdf-details-value">: {formatDate(d.dueVaccination)}</div>
                              </div>
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
                          <p>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।  <b>/</b> I declare that the information provided above is true to the best of my knowledge.</p>
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
                        <div className="pdf-contact-footer">
                          <span>Phone: {license.phoneNumber}</span> |
                          <span>Email: {license.email || 'info@awbi.org'}</span> |
                          <span>Website: www.awbi.org</span>
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
                      <Download size={18} />
                      <span>Download PDF</span>
                    </button>
                  )}
                  
                  {license.status === 'pending' && (
                    <div className="dl-pending-notice">
                      <AlertCircle size={18} />
                      <p>Your application is under review. You will be able to download the license once approved.</p>
                    </div>
                  )}
                  
                  {license.status === 'rejected' && (
                    <div className="dl-rejected-notice">
                      <XCircle size={18} />
                      <p>Your application has been rejected. Please contact support for more information.</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="dl-empty-state">
          <div className="dl-empty-icon">
            <FileText size={48} />
          </div>
          <p className="dl-no-data">You have not applied for any licenses yet.</p>
          <button className="dl-new-application-btn">Apply for a License</button>
        </div>
      )}
    </main>
  );
};

export default DogLicenseDownload;