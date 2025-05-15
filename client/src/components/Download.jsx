import React, { useEffect, useState } from "react";
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
  User,
  Dog,
  Eye,
  ChevronLeft,
  Award,
  Syringe,
  Stamp,
  Globe,
  Phone,
  MapPin,
  Image
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
};

const getCurrentDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-GB');
};

const UserStatusBadge = ({ status, isMobile }) => {
  let badgeClass = "user-dl-status-badge";
  let Icon = AlertCircle;
  let iconColor = 'var(--user-dl-warning)';

  switch(status.toLowerCase()) {
    case 'approved':
      badgeClass += " user-dl-status-approved";
      Icon = CheckCircle;
      iconColor = 'var(--user-dl-success)';
      break;
    case 'pending':
      badgeClass += " user-dl-status-pending";
      Icon = Clock;
      iconColor = 'var(--user-dl-warning)';
      break;
    case 'rejected':
      badgeClass += " user-dl-status-rejected";
      Icon = XCircle;
      iconColor = 'var(--user-dl-danger)';
      break;
    default:
      badgeClass += " user-dl-status-default";
      iconColor = 'var(--user-dl-dark)';
  }

  return (
    <span className={badgeClass}>
      <Icon size={16} style={{ color: iconColor }} />
      {!isMobile && <span>{status}</span>}
    </span>
  );
};

const DogLicenseDownload = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLicenseId, setExpandedLicenseId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [filterStatus, setFilterStatus] = useState('All');

  const backend = "https://dog-registration.onrender.com";
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  const toggleExpanded = (id) => {
    if (expandedLicenseId === id) {
      setExpandedLicenseId(null);
    } else {
      setExpandedLicenseId(id);
    }
  };

  const downloadPDF = (id, dogName = 'dog') => {
    const element = document.getElementById(`pdf-${id}`);
     if (!element) {
        console.error("PDF element not found for ID:", id);
        return;
    }

    element.classList.add('force-desktop-pdf-layout');

    const opt = {
      margin: 0.5,
      filename: `Dog_License_${dogName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      element.classList.remove('force-desktop-pdf-layout');
    });
  };

  const selectedLicense = licenses.find(lic => lic._id === expandedLicenseId);

  const filteredLicenses = licenses.filter(license => {
    if (filterStatus === 'All') {
      return true;
    }
    return license.status.toLowerCase() === filterStatus.toLowerCase();
  });


   const renderCertificateView = (lic) => {
      const currentDate = new Date().toLocaleDateString('en-GB');

    const expiryDate = lic.dog?.dateOfVaccination ?
      new Date(new Date(lic.dog.dateOfVaccination).setFullYear(
        new Date(lic.dog.dateOfVaccination).getFullYear() + 1
      )).toLocaleDateString('en-GB') : "N/A";

      return (
           <div className="user-dl-certificate-view">
              <div id={`pdf-${lic._id}`} className="pdf-layout">
                <div className="pdf-border">
                  <div className="pdf-header">
                    <div className="pdf-header-left">
                      <div className="pdf-logo-icon">
                         <img src="./logo.webp"></img>
                      </div>
                      <div className="pdf-org-name">
                        <h3>Nagar Nigam Gorakhpur</h3>
                        <h4>नगर निगम गोरखपुर</h4>
                      </div>
                    </div>
                    <div className="pdf-header-right">
                      <div className="pdf-date">
                        <span> Date: {currentDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pdf-certificate-title">
                    <h2>OFFICIAL DOG LICENSE CERTIFICATE</h2>
                    <h3>कुत्तों के पंजीकरण के लिए अधिकृत पत्र</h3>
                  </div>

                  <div className="pdf-body">
                    <div className="pdf-photo-section">
                      <div className="pdf-info-block">
                        <div className="pdf-info-row">
                          <div className="pdf-info-label">नाम / Name</div>
                          <div className="pdf-info-value">: {lic.fullName || "N/A"}</div>
                        </div>
                        <div className="pdf-info-row">
                          <div className="pdf-info-label">पंजीकरण संख्या / Registration No.</div>
                          <div className="pdf-info-value">: {lic._id?.substring(0, 20) || "N/A"}</div>
                        </div>
                        <div className="pdf-info-row">
                          <div className="pdf-info-label">जारी दिनांक / Issue Date</div>
                          <div className="pdf-info-value">: {formatDate(lic.createdAt)}</div>
                        </div>
                        <div className="pdf-info-row">
                          <div className="pdf-info-label">समाप्ति तिथि / Expiry Date</div>
                          <div className="pdf-info-value">: {expiryDate}</div>
                        </div>
                      </div>
                      <div className="pdf-photo-box">
                        {lic.dog?.avatarUrl ? (
                          <img src={lic.dog.avatarUrl} alt="Dog" className="pdf-photo" />
                        ) : (
                          <div className="pdf-photo-placeholder">प पशु की तस्वीर / Dog's Photo</div>
                        )}
                      </div>
                    </div>

                    <div className="pdf-details-section">
                      <div className="pdf-section-title">पशु का विवरण / Animal Details</div>
                      <div className="pdf-details-columns">
                        <div className="pdf-details-column-left">
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">पशु का नाम / Dog Name</div>
                            <div className="pdf-details-value">: {lic.dog?.name || "N/A"}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">नस्ल / Breed</div>
                            <div className="pdf-details-value">: {lic.dog?.breed || "N/A"}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">वर्ग / Category</div>
                            <div className="pdf-details-value">: {lic.dog?.category || "N/A"}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">रंग / Color</div>
                            <div className="pdf-details-value">: {lic.dog?.color || "N/A"}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">आयु / Age</div>
                            <div className="pdf-details-value">: {lic.dog?.age || "N/A"}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">टीकाकरण की तारीख / Vaccination Date</div>
                            <div className="pdf-details-value">: {formatDate(lic.dog?.dateOfVaccination)}</div>
                          </div>
                        </div>
                        <div className="pdf-details-column-right">
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">लिंग / Gender</div>
                            <div className="pdf-details-value">: {lic.dog?.sex || "N/A"}</div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">टीकाकरण / Vaccinated</div>
                            <div className="pdf-details-value">
                              : {lic.dog?.dateOfVaccination ? ' हां / Yes' : ' नहीं / No'}
                            </div>
                          </div>
                          {lic.dog?.vaccinationProofUrl && (
                            <div className="pdf-details-row">
                              <div className="pdf-details-label">टीकाकरण प्रमाणपत्र / Vaccination Certificate</div>
                              <div className="pdf-details-value">
                                <a
                                  href={lic.dog.vaccinationProofUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="pdf-vaccine-img"
                                >View </a>
                              </div>
                            </div>
                          )}
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">माइक्रोचip / Microchipped</div>
                            <div className="pdf-details-value">
                              : No
                            </div>
                          </div>
                          <div className="pdf-details-row">
                            <div className="pdf-details-label">अगला टीकाकरण / Next Vaccination</div>
                            <div className="pdf-details-value">: {formatDate(lic.dog?.dueVaccination)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pdf-details-section">
                      <div className="pdf-section-title">मालिक का विवरण / Owner Details</div>
                      <div className="pdf-details-table">
                        <div className="pdf-details-row">
                          <div className="pdf-details-label">पता / Address</div>
                          <div className="pdf-details-value">: {`${lic.address?.streetName || ""}, ${lic.address?.city || ""}, ${lic.address?.state || ""} - ${lic.address?.pinCode || "N/A"}`}</div>
                        </div>
                        <div className="pdf-details-row">
                          <div className="pdf-details-label">फोन नंबर / Phone Number</div>
                          <div className="pdf-details-value">: {lic.phoneNumber || "N/A"}</div>
                        </div>
                        <div className="pdf-details-row">
                          <div className="pdf-details-label">कुत्तों की संख्या / No. of Dogs</div>
                          <div className="pdf-details-value">: {lic.numberOfDogs || "N/A"}</div>
                        </div>
                        <div className="pdf-details-row">
                          <div className="pdf-details-label">घर का क्षेत्रफल / House Area</div>
                          <div className="pdf-details-value">: {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}</div>
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
                       {lic.phoneNumber || "N/A"} &nbsp;|&nbsp;
                       info@awbi.org &nbsp;|&nbsp;
                       www.awbi.org
                    </div>
                  </div>
                </div>
              </div>
               {lic.status === 'approved' && (
                    <button
                      className="user-dl-button user-dl-certificate-download-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPDF(lic._id, lic.dog?.name);
                      }}
                    >
                      <Download size={18} />
                      <span>Download PDF</span>
                    </button>
                  )}

                  {lic.status === 'pending' && (
                    <div className="user-dl-pending-notice">
                      <AlertCircle size={18} />
                      <p>Your application is under review. You will be able to download the license once approved.</p>
                    </div>
                  )}

                  {lic.status === 'rejected' && (
                    <div className="user-dl-rejected-notice">
                      <XCircle size={18} />
                      <p>Your application has been rejected. Please contact support for more information.</p>
                    </div>
                  )}
           </div>
      );
   };


  return (
    <main className="user-dl-container">
      <header className="user-dl-header">
        {expandedLicenseId === null ? (
           <>
             <h1 className="user-dl-title">My Dog License Applications</h1>
             <div className="user-dl-filters">
               <span className="user-dl-filter-label">Filter by:</span>
               <button
                 className={`user-dl-filter-btn user-dl-filter-all ${filterStatus === 'All' ? 'user-dl-filter-active' : ''}`}
                 onClick={() => setFilterStatus('All')}
               >
                 All
               </button>
               <button
                 className={`user-dl-filter-btn user-dl-filter-approved ${filterStatus === 'Approved' ? 'user-dl-filter-active' : ''}`}
                 onClick={() => setFilterStatus('Approved')}
               >
                 Approved
               </button>
               <button
                 className={`user-dl-filter-btn user-dl-filter-pending ${filterStatus === 'Pending' ? 'user-dl-filter-active' : ''}`}
                 onClick={() => setFilterStatus('Pending')}
               >
                 Pending
               </button>
                <button
                 className={`user-dl-filter-btn user-dl-filter-rejected ${filterStatus === 'Rejected' ? 'user-dl-filter-active' : ''}`}
                 onClick={() => setFilterStatus('Rejected')}
               >
                 Rejected
               </button>
             </div>
           </>
        ) : (
            <div className="user-dl-back-to-list-header">
                 <button
                     className="user-dl-back-to-list-btn"
                     onClick={() => toggleExpanded(expandedLicenseId)}
                 >
                    <ChevronLeft size={24} />
                    Back to List
                 </button>
            </div>
        )}
      </header>

      {loading ? (
        <div className="user-dl-loading">
          <div className="user-dl-spinner"></div>
          <p className="user-dl-status">Loading license data…</p>
        </div>
      ) : filteredLicenses.length > 0 ? (
         expandedLicenseId === null ? (
            <div className="user-dl-table-container">
               <table className="user-dl-license-table">
                  <thead>
                     <tr>
                        <th>Owner</th>
                        <th>Dog Name</th>
                        <th>Status</th>
                        {!isMobile && <th>Applied Date</th>}
                        <th>View</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredLicenses.map(license => (
                        <tr key={license._id} onClick={() => toggleExpanded(license._id)}>
                           <td><div className="user-dl-cell user-dl-owner-cell">{!isMobile && <User size={16} className="user-dl-cell-icon" />} {license.fullName}</div></td>
                           <td><div className="user-dl-cell user-dl-dog-cell">{!isMobile && <Dog size={16} className="user-dl-cell-icon" />} {license.dog?.name || "N/A"}</div></td>
                           <td><div className="user-dl-cell user-dl-status-cell"><UserStatusBadge status={license.status} isMobile={isMobile} /></div></td>
                           {!isMobile && <td><div className="user-dl-cell user-dl-date-cell"><Calendar size={16} className="user-dl-cell-icon" /> {formatDate(license.createdAt)}</div></td>}
                           <td>
                                <button
                                   className="user-dl-view-btn"
                                   onClick={(e) => {
                                        e.stopPropagation();
                                       toggleExpanded(license._id);
                                   }}
                                 >
                                     <Eye size={16} className="user-dl-btn-icon" /> {!isMobile && 'View'}
                                </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         ) : (
             <div className="user-dl-details-view">
                 {renderCertificateView(selectedLicense)}
             </div>
         )
      ) : (
        <div className="user-dl-empty-state">
          <div className="user-dl-empty-icon">
            <FileText size={48} />
          </div>
          <p className="user-dl-no-data">
             {filterStatus === 'All'
                ? "You have not applied for any licenses yet."
                : `No "${filterStatus}" licenses found.`
             }
          </p>
           {filterStatus === 'All' && (
              <button className="user-dl-new-application-btn" onClick={() => alert('Navigate to application form')}>Apply for a License</button>
           )}
        </div>
      )}
    </main>
  );
};

export default DogLicenseDownload;