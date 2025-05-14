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
  ChevronLeft, // Added for back button
  Award, // For certificate icon
  Syringe, // For vaccination icon
  Stamp, // For stamp icon - Still needed for the icon outside the PDF in renderCertificateView wrapper
  Globe, // For website icon - Still needed for the icon outside the PDF in renderCertificateView wrapper
  Phone, // For phone icon - Still needed for the icon outside the PDF in renderCertificateView wrapper
  MapPin, // For location icon - Still needed for the icon outside the PDF in renderCertificateView wrapper
  Image // Import Image icon - still needed for standard view in AdminPanel example, but not used in this file anymore
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
      {!isMobile && <span>{status}</span>} {/* Hide text on mobile */}
    </span>
  );
};

const DogLicenseDownload = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLicenseId, setExpandedLicenseId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [filterStatus, setFilterStatus] = useState('All'); // State for filter

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

    const opt = {
      margin: 0.5,
      filename: `Dog_License_${dogName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const selectedLicense = licenses.find(lic => lic._id === expandedLicenseId);

  // Filter licenses based on the selected filterStatus
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

      // Reverted to original class names for PDF layout and removed Lucide icons from PDF content
      return (
           <div className="user-dl-certificate-view"> {/* Keep this wrapper for download button and notices */}
              <div id={`pdf-${lic._id}`} className="pdf-layout"> {/* Original PDF Layout Class */}
                <div className="pdf-border"> {/* Original PDF Border Class */}
                  <div className="pdf-header"> {/* Original PDF Header Class */}
                    <div className="pdf-header-left"> {/* Original PDF Header Left Class */}
                      <div className="pdf-logo-icon"> {/* Original PDF Logo Icon Class */}
                         <img src="./logo.png"></img>
                      </div>
                      <div className="pdf-org-name">
                        <h3>Nagar Nigam Gorakhpur</h3>
                        <h4>नगर निगम गोरखपुर</h4>
                      </div>
                    </div>
                    <div className="pdf-header-right"> {/* Original PDF Header Right Class */}
                      <div className="pdf-date"> {/* Original PDF Date Class */}
                        <span> Date: {currentDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pdf-certificate-title"> {/* Original PDF Certificate Title Class */}
                    <h2>OFFICIAL DOG LICENSE CERTIFICATE</h2> {/* Changed to h2 to match provided CSS block order */}
                    <h3>कुत्तों के पंजीकरण के लिए अधिकृत पत्र</h3> {/* Changed to h3 to match provided CSS block order */}
                  </div>

                  <div className="pdf-body"> {/* Original PDF Body Class - added for structure */}
                    <div className="pdf-photo-section"> {/* Original PDF Photo Section Class */}
                      <div className="pdf-info-block"> {/* Original PDF Info Block Class */}
                        <div className="pdf-info-row"> {/* Original PDF Info Row Class */}
                          <div className="pdf-info-label">नाम / Name</div> {/* Original PDF Info Label Class */}
                          <div className="pdf-info-value">: {lic.fullName || "N/A"}</div> {/* Original PDF Info Value Class */}
                        </div>
                        <div className="pdf-info-row"> {/* Original PDF Info Row Class */}
                          <div className="pdf-info-label">पंजीकरण संख्या / Registration No.</div> {/* Original PDF Info Label Class */}
                          <div className="pdf-info-value">: {lic._id?.substring(0, 20) || "N/A"}</div> {/* Original PDF Info Value Class - Use substring */}
                        </div>
                        <div className="pdf-info-row"> {/* Original PDF Info Row Class */}
                          <div className="pdf-info-label">जारी दिनांक / Issue Date</div> {/* Original PDF Info Label Class */}
                          <div className="pdf-info-value">: {formatDate(lic.createdAt)}</div> {/* Original PDF Info Value Class */}
                        </div>
                        <div className="pdf-info-row"> {/* Original PDF Info Row Class */}
                          <div className="pdf-info-label">समाप्ति तिथि / Expiry Date</div> {/* Original PDF Info Label Class */}
                           {/* Assuming expiry is 1 year from vaccination or creation if no vaccination date */}
                          <div className="pdf-info-value">: {expiryDate}</div> {/* Original PDF Info Value Class */}
                        </div>
                      </div>
                      <div className="pdf-photo-box"> {/* Original PDF Photo Box Class */}
                        {lic.dog?.avatarUrl ? (
                          <img src={lic.dog.avatarUrl} alt="Dog" className="pdf-photo" />
                        ) : (
                          <div className="pdf-photo-placeholder">प पशु की तस्वीर / Dog's Photo</div>
                        )}
                      </div>
                    </div>

                    <div className="pdf-details-section"> {/* Original PDF Details Section Class */}
                      <div className="pdf-section-title">पशु का विवरण / Animal Details</div> {/* Original PDF Section Title Class */}
                      <div className="pdf-details-columns"> {/* Original PDF Details Columns Class */}
                        <div className="pdf-details-column-left"> {/* Original PDF Details Column Left Class */}
                          <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                            <div className="pdf-details-label">पशु का नाम / Dog Name</div> {/* Original PDF Details Label Class */}
                            <div className="pdf-details-value">: {lic.dog?.name || "N/A"}</div> {/* Original PDF Details Value Class */}
                          </div>
                          <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                            <div className="pdf-details-label">नस्ल / Breed</div> {/* Original PDF Details Label Class */}
                            <div className="pdf-details-value">: {lic.dog?.breed || "N/A"}</div> {/* Original PDF Details Value Class */}
                          </div>
                          <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                            <div className="pdf-details-label">वर्ग / Category</div> {/* Original PDF Details Label Class */}
                            <div className="pdf-details-value">: {lic.dog?.category || "N/A"}</div> {/* Original PDF Details Value Class */}
                          </div>
                          <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                            <div className="pdf-details-label">रंग / Color</div> {/* Original PDF Details Label Class */}
                            <div className="pdf-details-value">: {lic.dog?.color || "N/A"}</div> {/* Original PDF Details Value Class */}
                          </div>
                          <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                            <div className="pdf-details-label">आयु / Age</div> {/* Original PDF Details Label Class */}
                            <div className="pdf-details-value">: {lic.dog?.age || "N/A"}</div> {/* Original PDF Details Value Class */}
                          </div>
                          <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                            <div className="pdf-details-label">टीकाकरण की तारीख / Vaccination Date</div> {/* Original PDF Details Label Class */}
                            <div className="pdf-details-value">: {formatDate(lic.dog?.dateOfVaccination)}</div> {/* Original PDF Details Value Class */}
                          </div>
                        </div>
                        <div className="pdf-details-column-right"> {/* Original PDF Details Column Right Class */}
                          <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                            <div className="pdf-details-label">लिंग / Gender</div> {/* Original PDF Details Label Class */}
                            <div className="pdf-details-value">: {lic.dog?.sex || "N/A"}</div> {/* Original PDF Details Value Class */}
                          </div>
                          <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                            <div className="pdf-details-label">टीकाकरण / Vaccinated</div> {/* Original PDF Details Label Class */}
                            <div className="pdf-details-value">
                              : {lic.dog?.dateOfVaccination ? ' हां / Yes' : ' नहीं / No'}
                            </div> {/* Original PDF Details Value Class */}
                          </div>
                          {lic.dog?.vaccinationProofUrl && (
                            <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                              <div className="pdf-details-label">टीकाकरण प्रमाणपत्र / Vaccination Certificate</div> {/* Original PDF Details Label Class */}
                              <div className="pdf-details-value">
                                <a
                                  href={lic.dog.vaccinationProofUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="pdf-vaccine-img" // Using original class name, might need review
                                >View </a> {/* Use href for link */}
                              </div> {/* Original PDF Details Value Class */}
                            </div>
                          )}
                          <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                            <div className="pdf-details-label">माइक्रोचिप / Microchipped</div> {/* Original PDF Details Label Class */}
                            <div className="pdf-details-value">
                              : No {/* Assuming static */}
                            </div> {/* Original PDF Details Value Class */}
                          </div>
                          <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                            <div className="pdf-details-label">अगला टीकाकरण / Next Vaccination</div> {/* Original PDF Details Label Class */}
                            <div className="pdf-details-value">: {formatDate(lic.dog?.dueVaccination)}</div> {/* Original PDF Details Value Class */}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pdf-details-section"> {/* Original PDF Details Section Class */}
                      <div className="pdf-section-title">मालिक का विवरण / Owner Details</div> {/* Original PDF Section Title Class */}
                      <div className="pdf-details-table"> {/* Original PDF Details Table Class */}
                        <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                          <div className="pdf-details-label">पता / Address</div> {/* Original PDF Details Label Class */}
                          <div className="pdf-details-value">: {`${lic.address?.streetName || ""}, ${lic.address?.city || ""}, ${lic.address?.state || ""} - ${lic.address?.pinCode || "N/A"}`}</div> {/* Original PDF Details Value Class */}
                        </div>
                        <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                          <div className="pdf-details-label">फोन नंबर / Phone Number</div> {/* Original PDF Details Label Class */}
                          <div className="pdf-details-value">: {lic.phoneNumber || "N/A"}</div> {/* Original PDF Details Value Class */}
                        </div>
                        <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                          <div className="pdf-details-label">कुत्तों की संख्या / No. of Dogs</div> {/* Original PDF Details Label Class */}
                          <div className="pdf-details-value">: {lic.numberOfDogs || "N/A"}</div> {/* Original PDF Details Value Class */}
                        </div>
                        <div className="pdf-details-row"> {/* Original PDF Details Row Class */}
                          <div className="pdf-details-label">घर का क्षेत्रफल / House Area</div> {/* Original PDF Details Label Class */}
                          <div className="pdf-details-value">: {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}</div> {/* Original PDF Details Value Class */}
                        </div>
                      </div>
                    </div>

                    <div className="pdf-declaration"> {/* Original PDF Declaration Class */}
                      <p>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।  <b>/</b> I declare that the information provided above is true to the best of my knowledge.</p>
                    </div>

                    <div className="pdf-signatures"> {/* Original PDF Signatures Class */}
                      <div className="pdf-signature-block"> {/* Original PDF Signature Block Class */}
                        <div className="pdf-signature-line"></div> {/* Original PDF Signature Line Class */}
                        <p>आवेदक के हस्ताक्षर / Applicant's Signature</p>
                      </div>
                      <div className="pdf-signature-block"> {/* Original PDF Signature Block Class */}
                        <div className="pdf-signature-line"></div> {/* Original PDF Signature Line Class */}
                        <p>जारीकर्ता अधिकारी / Issuing Authority</p>
                      </div>
                    </div>

                    <div className="pdf-footer"> {/* Original PDF Footer Class */}
                          <div className="pdf-qr-code"> {/* Original PDF QR Code Class */}
                             <div className="pdf-qr-placeholder"></div> {/* Original PDF QR Placeholder Class */}
                            <p>QR Code</p>
                          </div>
                           <div className="pdf-stamp"> {/* Original PDF Stamp Class */}
                                <div className="pdf-stamp-placeholder"> {/* Original PDF Stamp Placeholder Class */}
                                    <p>OFFICIAL STAMP</p>
                                </div>
                           </div>
                    </div>
                    <div className="pdf-contact-footer"> {/* Original PDF Contact Footer Class */}
                       {lic.phoneNumber || "N/A"} &nbsp;|&nbsp;
                       info@awbi.org &nbsp;|&nbsp; {/* Updated dummy email */}
                       www.awbi.org {/* Updated dummy website */}
                    </div>
                  </div> {/* End of pdf-body */}
                </div> {/* End of pdf-border */}
              </div> {/* End of pdf-layout */}
               {/* Keep these outside the pdf-layout div so they don't affect the PDF content */}
               {lic.status === 'approved' && (
                    <button
                      className="user-dl-button user-dl-certificate-download-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click from closing details
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
           <> {/* Use Fragment to group multiple elements */}
             <h1 className="user-dl-title">My Dog License Applications</h1>
              {/* Conditionally render filters when certificate is NOT open */}
             <div className="user-dl-filters">
               <span className="user-dl-filter-label">Filter by:</span>
               {/* Added onClick handlers and conditional class for active filter */}
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
                {/* Added Rejected filter button */}
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
                 {/* Optional title for details view */}
            </div>
        )}
      </header>

      {loading ? (
        <div className="user-dl-loading">
          <div className="user-dl-spinner"></div>
          <p className="user-dl-status">Loading license data…</p>
        </div>
      ) : filteredLicenses.length > 0 ? ( // Use filteredLicenses here
         expandedLicenseId === null ? (
            <div className="user-dl-table-container">
               <table className="user-dl-license-table">
                  <thead>
                     <tr>
                        <th>Owner</th>
                        <th>Dog Name</th>
                        <th>Status</th>
                        {!isMobile && <th>Applied Date</th>}
                        <th>View</th> {/* Keep View header for consistency across views */}
                     </tr>
                  </thead>
                  <tbody>
                     {filteredLicenses.map(license => ( // Use filteredLicenses here
                        <tr key={license._id} onClick={() => toggleExpanded(license._id)}>
                           <td><div className="user-dl-cell user-dl-owner-cell">{!isMobile && <User size={16} className="user-dl-cell-icon" />} {license.fullName}</div></td>
                           <td><div className="user-dl-cell user-dl-dog-cell">{!isMobile && <Dog size={16} className="user-dl-cell-icon" />} {license.dog?.name || "N/A"}</div></td>
                           <td><div className="user-dl-cell user-dl-status-cell"><UserStatusBadge status={license.status} isMobile={isMobile} /></div></td>
                           {!isMobile && <td><div className="user-dl-cell user-dl-date-cell"><Calendar size={16} className="user-dl-cell-icon" /> {formatDate(license.createdAt)}</div></td>}
                           <td>
                                <button
                                   className="user-dl-view-btn"
                                   onClick={(e) => {
                                        e.stopPropagation(); // Prevent row click
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
                 {renderCertificateView(selectedLicense)} {/* Directly render certificate view */}
             </div>
         )
      ) : (
        <div className="user-dl-empty-state">
          <div className="user-dl-empty-icon">
            <FileText size={48} />
          </div>
          {/* Updated empty state message based on filter */}
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