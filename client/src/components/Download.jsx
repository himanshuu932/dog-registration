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

const UserStatusBadge = ({ status, isMobile, languageType = 'en' }) => { // Added languageType prop
  const statusText = {
    en: {
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected'
    },
    hi: {
      approved: 'स्वीकृत',
      pending: 'लंबित',
      rejected: 'अस्वीकृत'
    }
  };

  const currentStatusText = statusText[languageType] || statusText.en;

  let badgeClass = "user-dl-status-badge";
  let Icon = AlertCircle; // Default icon
  let iconColor = 'var(--user-dl-warning)'; // Default color

  switch(status.toLowerCase()) {
    case 'approved':
      badgeClass += " user-dl-status-approved";
      Icon = CheckCircle;
      iconColor = 'var(--user-dl-success)';
      break;
    case 'pending':
      badgeClass += " user-dl-status-pending";
      Icon = Clock; // Use Clock icon for pending
      iconColor = 'var(--user-dl-warning)';
      break;
    case 'rejected':
      badgeClass += " user-dl-status-rejected";
      Icon = XCircle;
      iconColor = 'var(--user-dl-danger)';
      break;
    default: // Fallback for any other unknown status
      badgeClass += " user-dl-status-default";
      Icon = AlertCircle;
      iconColor = 'var(--user-dl-dark)';
  }

  const displayStatusText = currentStatusText[status.toLowerCase()] || status; // Fallback to original status string

  return (
    <span className={badgeClass}>
      <Icon size={16} style={{ color: iconColor }} />
      {!isMobile && <span>{displayStatusText}</span>}
    </span>
  );
};

// Helper function to render the certificate view
const renderCertificateView = (lic, isMobile, downloadPDF, languageType = 'en') => { // Added languageType prop
    const currentDate = new Date().toLocaleDateString('en-GB');

    const expiryDate = lic.dog?.dateOfVaccination ?
      new Date(new Date(lic.dog.dateOfVaccination).setFullYear(
        new Date(lic.dog.dateOfVaccination).getFullYear() + 1
      )).toLocaleDateString('en-GB') : "N/A";

    const certificateText = {
        en: {
            orgNameEn: 'Nagar Nigam Gorakhpur',
            orgNameHi: 'नगर निगम गोरखपुर', // Keep Hindi name as it's bilingual on certificate
            certificateTitleEn: 'OFFICIAL DOG LICENSE CERTIFICATE',
            certificateTitleHi: 'कुत्तों के पंजीकरण के लिए अधिकृत पत्र', // Keep Hindi title as it's bilingual
            dateLabel: 'Date:',
            photoPlaceholder: 'Dog\'s Photo', // This text is inside the placeholder div
             // Keep combined labels as they are already in the original certificate layout
             // e.g., 'नाम / Name', 'पंजीकरण संख्या / Registration No.', etc.
            declaration: <>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।  <b>/</b> I declare that the information provided above is true to the best of my knowledge.</>,
            applicantSignature: 'आवेदक के हस्ताक्षर / Applicant\'s Signature',
            issuingAuthority: 'जारीकर्ता अधिकारी / Issuing Authority',
            qrCodeLabel: 'QR Code',
            officialStamp: 'OFFICIAL STAMP',
            downloadPdfButton: 'Download PDF',
            pendingNotice: <>Your application is under review. You will be able to download the license once approved.</>,
            rejectedNotice: (rejectionDate) => <>Your application has been rejected on {formatDate(rejectionDate)}.</>,
            reasonLabel: 'Reason:',
            contactSupport: <>Please contact support for more information.</>,
        },
        hi: {
             orgNameEn: 'Nagar Nigam Gorakhpur',
            orgNameHi: 'नगर निगम गोरखपुर',
            certificateTitleEn: 'OFFICIAL DOG LICENSE CERTIFICATE',
            certificateTitleHi: 'कुत्तों के पंजीकरण के लिए अधिकृत पत्र',
            dateLabel: 'दिनांक:',
            photoPlaceholder: 'प पशु की तस्वीर',
             // Keep combined labels as they are already in the original certificate layout
            declaration: <>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।  <b>/</b> I declare that the information provided above is true to the best of my knowledge.</>,
            applicantSignature: 'आवेदक के हस्ताक्षर / Applicant\'s Signature',
            issuingAuthority: 'जारीकर्ता अधिकारी / Issuing Authority',
            qrCodeLabel: 'क्यूआर कोड',
            officialStamp: 'आधिकारिक मुहर',
            downloadPdfButton: 'पीडीएफ डाउनलोड करें',
             pendingNotice: <>आपका आवेदन समीक्षाधीन है। अनुमोदन के बाद ही आप लाइसेंस डाउनलोड कर पाएंगे।</>,
            rejectedNotice: (rejectionDate) => <>आपका आवेदन {formatDate(rejectionDate)} को अस्वीकृत कर दिया गया है।</>,
            reasonLabel: 'कारण:',
            contactSupport: <>अधिक जानकारी के लिए कृपया सहायता से संपर्क करें।</>,
        }
    };

    const currentCertText = certificateText[languageType] || certificateText.en;

    return (
       <div className="user-dl-certificate-view">
         <div id={`pdf-${lic._id}`} className="pdf-layout">
           <div className="pdf-border">
             <div className="pdf-header">
               <div className="pdf-header-left">
                 <div className="pdf-logo-icon">
                    <img src="./logo.webp" alt="Organization Logo"></img>
                 </div>
                 <div className="pdf-org-name">
                   <h3>{currentCertText.orgNameEn}</h3> {/* Dynamic English Name */}
                   <h4>{currentCertText.orgNameHi}</h4> {/* Dynamic Hindi Name */}
                 </div>
               </div>
               <div className="pdf-header-right">
                 <div className="pdf-date">
                   <span> {currentCertText.dateLabel} {currentDate}</span> {/* Dynamic Date Label */}
                 </div>
               </div>
             </div>

             <div className="pdf-certificate-title">
               <h2>{currentCertText.certificateTitleEn}</h2> {/* Dynamic English Title */}
               <h3>{currentCertText.certificateTitleHi}</h3> {/* Dynamic Hindi Title */}
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
                     <div className="pdf-info-value">: {lic.license_Id || "N/A"}</div>
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
                     <div className="pdf-photo-placeholder">{currentCertText.photoPlaceholder}</div> 
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
                 <p>{currentCertText.declaration}</p> {/* Dynamic declaration */}
               </div>

               <div className="pdf-signatures">
                 <div className="pdf-signature-block">
                   <div className="pdf-signature-line"></div>
                   <p>{currentCertText.applicantSignature}</p> {/* Dynamic signature label */}
                 </div>
                 <div className="pdf-signature-block">
                   <div className="pdf-signature-line"></div>
                   <p>{currentCertText.issuingAuthority}</p> {/* Dynamic signature label */}
                 </div>
               </div>

               <div className="pdf-footer">
                   <div className="pdf-qr-code">
                       <div className="pdf-qr-placeholder"></div>
                     <p>{currentCertText.qrCodeLabel}</p> {/* Dynamic QR label */}
                   </div>
                    <div className="pdf-stamp">
                        <div className="pdf-stamp-placeholder">
                            <p>{currentCertText.officialStamp}</p> {/* Dynamic stamp label */}
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
          {/* Download button only for approved licenses in the view */}
          {lic.status === 'approved' && (
              <button
                className="user-dl-button user-dl-certificate-download-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadPDF(lic._id, lic.dog?.name);
                }}
              >
                <Download size={18} />
                <span>{currentCertText.downloadPdfButton}</span> {/* Dynamic button text */}
              </button>
            )}

            {/* Pending/Rejected notices */}
            {lic.status === 'pending' && (
              <div className="user-dl-pending-notice">
                <AlertCircle size={18} />
                <p>{currentCertText.pendingNotice}</p> {/* Dynamic pending text */}
              </div>
            )}

            {lic.status === 'rejected' && (
            <div className="user-dl-rejected-notice">
              <XCircle size={18} />
              <div>
                <p>{currentCertText.rejectedNotice(lic.rejectionDate)}</p> {/* Dynamic rejected text with date */}
                {lic.rejectionReason && (
                  <div className="user-dl-rejection-reason">
                    <strong>{currentCertText.reasonLabel}</strong> {lic.rejectionReason} {/* Dynamic reason label */}
                  </div>
                )}
                <p>{currentCertText.contactSupport}</p> {/* Dynamic contact support text */}
              </div>
            </div>
          )}
       </div>
    );
   };


const DogLicenseDownload = ({ languageType = 'en' }) => { // Added languageType prop
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLicenseId, setExpandedLicenseId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [filterStatus, setFilterStatus] = useState('All'); // State holds English status string

  const backend = "https://dog-registration.onrender.com";
  const token = localStorage.getItem('token');

    // Text content for the component
    const textContent = {
        en: {
            pageTitle: 'My Dog License Applications',
            filterLabel: 'Filter by:',
            filterButtons: {
                all: 'All',
                approved: 'Approved',
                pending: 'Pending',
                rejected: 'Rejected'
            },
            backToList: 'Back to List',
            loadingData: 'Loading license data…',
            tableHeaders: {
                regNo: 'Reg. No',
                owner: 'Owner',
                dogName: 'Dog Name',
                status: 'Status',
                appliedDate: 'Applied Date',
                view: 'View'
            },
            tableCellView: 'View', // Text for the View button in table cell
            emptyState: {
                noApplications: 'You have not applied for any licenses yet.',
                noFiltered: (status) => `No "${status}" licenses found.`, // Use English status directly here
                applyButton: 'Apply for a License'
            }
        },
        hi: {
             pageTitle: 'मेरे कुत्ते लाइसेंस आवेदन',
            filterLabel: 'फ़िल्टर करें:',
            filterButtons: {
                all: 'सभी',
                approved: 'स्वीकृत',
                pending: 'लंबित',
                rejected: 'अस्वीकृत'
            },
            backToList: 'सूची पर वापस जाएं',
            loadingData: 'लाइसेंस डेटा लोड हो रहा है…',
             tableHeaders: {
                regNo: 'पंजीकरण संख्या',
                owner: 'मालिक',
                dogName: 'कुत्ते का नाम',
                status: 'स्थिति',
                appliedDate: 'आवेदन की तिथि',
                view: 'देखें'
            },
            tableCellView: 'देखें', // Text for the View button in table cell
             emptyState: {
                 noApplications: 'आपने अभी तक किसी भी लाइसेंस के लिए आवेदन नहीं किया है।',
                noFiltered: (status) => `कोई भी "${status}" लाइसेंस नहीं मिला।`, // Use Hindi status translation here
                applyButton: 'लाइसेंस के लिए आवेदन करें'
             }
        }
    };

    const currentText = textContent[languageType] || textContent.en; // Default to English

    // Helper to get translated filter button text
    const getFilterButtonText = (statusKey) => {
        return currentText.filterButtons[statusKey] || statusKey;
    };

    // Helper to get translated filter status for empty state message
     const getTranslatedFilterStatus = (status) => {
         const statusKey = Object.keys(textContent.en.filterButtons).find(key => textContent.en.filterButtons[key].toLowerCase() === status.toLowerCase());
         return statusKey ? getFilterButtonText(statusKey) : status; // Translate the filter status name
     };


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
      .then(res => {
          if (!res.ok) {
              // Handle HTTP errors
               return res.json().then(err => { throw new Error(err.message || 'Failed to fetch licenses'); });
          }
          return res.json();
      })
      .then(data => {
        // Sort licenses by creation date (most recent first)
         const sortedLicenses = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
         setLicenses(sortedLicenses);
         setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching licenses:", error);
         // Use dynamic error message or a default
         setLicenses([]);
         setLoading(false);
      });
  }, [backend, token]); // Depend on backend and token

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

     // Use a slight delay to ensure styles are applied before rendering
     setTimeout(() => {
         html2pdf().from(element).set(opt).save().then(() => {
           // Remove the class after PDF generation
           element.classList.remove('force-desktop-pdf-layout');
         }).catch(error => {
            console.error("PDF generation failed:", error);
             // Ensure class is removed even on error
             element.classList.remove('force-desktop-pdf-layout');
         });
     }, 50); // Small delay
  };

  const selectedLicense = licenses.find(lic => lic._id === expandedLicenseId);

  const filteredLicenses = licenses.filter(license => {
    if (filterStatus === 'All') {
      return true;
    }
    // Filter based on the English status string stored in state
    return license.status.toLowerCase() === filterStatus.toLowerCase();
  });


  return (
    <main className="user-dl-container">
      <header className="user-dl-header">
        {expandedLicenseId === null ? (
            <>
             <h1 className="user-dl-title">{currentText.pageTitle}</h1> {/* Dynamic Page Title */}
             <div className="user-dl-filters">
               <span className="user-dl-filter-label">{currentText.filterLabel}</span> {/* Dynamic Filter Label */}
               {/* Filter Buttons */}
               {Object.keys(currentText.filterButtons).map(key => (
                   <button
                        key={key}
                        className={`user-dl-filter-btn user-dl-filter-${key.toLowerCase()} ${filterStatus.toLowerCase() === key.toLowerCase() ? 'user-dl-filter-active' : ''}`}
                        onClick={() => setFilterStatus(textContent.en.filterButtons[key])} // Set English status in state
                    >
                        {getFilterButtonText(key)} {/* Dynamic Button Text */}
                    </button>
               ))}
             </div>
            </>
        ) : (
            <div className="user-dl-back-to-list-header">
                 <button
                       className="user-dl-back-to-list-btn"
                       onClick={() => toggleExpanded(expandedLicenseId)}
                   >
                     <ChevronLeft size={24} />
                     {currentText.backToList} {/* Dynamic Back button text */}
                   </button>
            </div>
        )}
      </header>

      {loading ? (
        <div className="user-dl-loading">
          <div className="user-dl-spinner"></div>
          <p className="user-dl-status">{currentText.loadingData}</p> {/* Dynamic loading text */}
        </div>
      ) : filteredLicenses.length > 0 ? (
          expandedLicenseId === null ? (
            <div className="user-dl-table-container">
               <table className="user-dl-license-table">
                 <thead>
                    <tr>
                      <th>{currentText.tableHeaders.regNo}</th> {/* Dynamic header */}
                      <th>{currentText.tableHeaders.owner}</th> {/* Dynamic header */}
                      {!isMobile && <th>{currentText.tableHeaders.dogName}</th>} {/* Dynamic header & Hide on mobile */}
                      <th>{currentText.tableHeaders.status}</th> {/* Dynamic header */}
                      {!isMobile && <th>{currentText.tableHeaders.appliedDate}</th>} {/* Dynamic header & Hide on mobile */}
                      <th>{currentText.tableHeaders.view}</th> {/* Dynamic header */}
                    </tr>
                 </thead>
                 <tbody>
                    {filteredLicenses.map(license => (
                       <tr key={license._id} onClick={() => toggleExpanded(license._id)}>
                         <td><div className="user-dl-cell user-dl-reg-no-cell">{!isMobile && <User size={16} className="user-dl-cell-icon" />} {license.license_Id || "N/A"}</div></td>
                         <td><div className="user-dl-cell user-dl-owner-cell">{!isMobile && <User size={16} className="user-dl-cell-icon" />} {license.fullName}</div></td>
                         {!isMobile && <td><div className="user-dl-cell user-dl-dog-cell">{!isMobile && <Dog size={16} className="user-dl-cell-icon" />} {license.dog?.name || "N/A"}</div></td>}
                         <td><div className="user-dl-cell user-dl-status-cell"><UserStatusBadge status={license.status} isMobile={isMobile} languageType={languageType} /></div></td> {/* Pass languageType */}
                         {!isMobile && <td><div className="user-dl-cell user-dl-date-cell"><Calendar size={16} className="user-dl-cell-icon" /> {formatDate(license.createdAt)}</div></td>}
                         <td>
                              <button
                                 className="user-dl-view-btn"
                                 onClick={(e) => {
                                      e.stopPropagation();
                                     toggleExpanded(license._id);
                                }}
                             >
                                  <Eye size={16} className="user-dl-btn-icon" /> {!isMobile && currentText.tableCellView} {/* Dynamic button text */}
                             </button>
                         </td>
                     </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          ) : (
               <div className="user-dl-details-view">
                   {renderCertificateView(selectedLicense, isMobile, downloadPDF, languageType)} {/* Pass languageType */}
               </div>
           )
      ) : (
        <div className="user-dl-empty-state">
          <div className="user-dl-empty-icon">
             <FileText size={48} />
          </div>
          <p className="user-dl-no-data">
               {filterStatus === 'All'
                   ? currentText.emptyState.noApplications // Dynamic empty state text
                   : currentText.emptyState.noFiltered(getTranslatedFilterStatus(filterStatus)) // Dynamic filtered empty state text
               }
          </p>
            {filterStatus === 'All' && (
                <button className="user-dl-new-application-btn" onClick={() => alert('Navigate to application form')}>{currentText.emptyState.applyButton}</button> 
            )}
        </div>
      )}
    </main>
  );
};

export default DogLicenseDownload;