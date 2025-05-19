import React, { useEffect, useState } from "react";
import html2pdf from 'html2pdf.js';
import './styles/Download.css'; // Ensure this CSS file exists and is styled
import {
  Download as DownloadIcon,
  CheckCircle,
  XCircle,
  ChevronLeft,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  User,
  Dog, // Maintained for getPetIcon, can be removed if PawPrint is always used for 'dog'
  Eye,
  Award, // Used in certificate text but not directly imported in original. Added for completeness.
  Stamp, // Used in certificate text
  Globe, // Used in certificate text
  Phone, // Used in certificate text
  MapPin, // Used in certificate text
  PawPrint // Generic Pet Icon
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-GB");
  } catch(e) {
    return "Invalid Date";
  }
};

const UserStatusBadge = ({ status, isMobile, languageType = 'en' }) => {
  const statusText = {
    en: {
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected',
      renewal_pending: 'Renewal Pending'
    },
    hi: {
      approved: 'स्वीकृत',
      pending: 'लंबित',
      rejected: 'अस्वीकृत',
      renewal_pending: 'नवीनीकरण लंबित है'
    }
  };

  const currentStatusText = statusText[languageType] || statusText.en;
  const lowerStatus = status?.toLowerCase();

  let badgeClass = "user-dl-status-badge";
  let IconToRender = AlertCircle; // Renamed to avoid conflict with 'Icon' variable name
  let iconColor = 'var(--user-dl-warning)';

  switch(lowerStatus) {
    case 'approved':
      badgeClass += " user-dl-status-approved";
      IconToRender = CheckCircle;
      iconColor = 'var(--user-dl-success)';
      break;
    case 'pending':
    case 'renewal_pending':
      badgeClass += " user-dl-status-pending"; // renewal_pending can share pending style
      IconToRender = Clock;
      iconColor = 'var(--user-dl-warning)';
      break;
    case 'rejected':
      badgeClass += " user-dl-status-rejected";
      IconToRender = XCircle;
      iconColor = 'var(--user-dl-danger)';
      break;
    default:
      badgeClass += " user-dl-status-default";
      IconToRender = AlertCircle;
      iconColor = 'var(--user-dl-dark)';
  }

  const displayStatusText = currentStatusText[lowerStatus] || status || "Unknown";

  return (
    <span className={badgeClass}>
      <IconToRender size={16} style={{ color: iconColor }} />
      {!isMobile && <span>{displayStatusText}</span>}
    </span>
  );
};

const getAnimalLabel = (animalType = 'Pet', plural = false) => {
  const lower = animalType?.toLowerCase();
  let label;
  switch (lower) {
    case 'dog': label = 'Dog'; break;
    case 'cat': label = 'Cat'; break;
    case 'rabbit': label = 'Rabbit'; break;
    default: label = 'Pet';
  }
  return plural ? `${label}s` : label;
};

const getPetIcon = (animalType) => {
  const lower = animalType?.toLowerCase();
  switch (lower) {
    case 'dog': return Dog;
    case 'cat': return PawPrint; // Replace with Cat specific icon if available
    case 'rabbit': return PawPrint; // Replace with Rabbit specific icon if available
    default: return PawPrint;
  }
};

const renderCertificateView = (lic, isMobile, downloadPDFCallback, languageType = 'en') => {
    if (!lic || !lic.pet) { // Added check for lic.pet
        console.warn("License data or pet data is missing for certificate rendering.");
        return <div className="user-dl-error-notice">Could not load certificate data. Pet details are missing.</div>;
    }

    const currentDate = new Date().toLocaleDateString('en-GB');
    const PetSpecificIcon = getPetIcon(lic.animalType);

    const expiryDate = lic.expiryDate ? formatDate(lic.expiryDate) : // Prefer lic.expiryDate
                       lic.pet?.dateOfVaccination ?
                       new Date(new Date(lic.pet.dateOfVaccination).setFullYear(
                         new Date(lic.pet.dateOfVaccination).getFullYear() + 1
                       )).toLocaleDateString('en-GB') : "N/A";

    const certificateText = {
        en: {
            orgNameEn: 'Nagar Nigam Gorakhpur', // Replace with actual or make dynamic via props
            orgNameHi: 'नगर निगम गोरखपुर',
            certificateTitleEn: 'PET LICENSE CERTIFICATE', // Changed
            certificateTitleHi: 'पालतू पशु पंजीकरण प्रमाण पत्र', // Changed
            dateLabel: 'Date:',
            photoPlaceholder: `${getAnimalLabel(lic.animalType)}'s Photo`,
            declaration: <>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है। <b>/</b> I declare that the information provided above is true to the best of my knowledge.</>,
            applicantSignature: 'आवेदक के हस्ताक्षर / Applicant\'s Signature',
            issuingAuthority: 'जारीकर्ता अधिकारी / Issuing Authority',
            qrCodeLabel: 'QR Code',
            officialStamp: 'OFFICIAL STAMP',
            downloadPdfButton: 'Download PDF',
            pendingNotice: <>Your application is under review. You will be able to download the license once approved.</>,
            rejectedNotice: (rejectionDate) => <>Your application has been rejected on {formatDate(rejectionDate)}.</>,
            reasonLabel: 'Reason:',
            contactSupport: <>Please contact support for more information.</>,
            animalDetailsTitle: `पशु का विवरण / ${getAnimalLabel(lic.animalType)} Details`,
            animalNameLabel: `पशु का नाम / ${getAnimalLabel(lic.animalType)} Name`,
            animalTypeLabel: 'पशु का प्रकार / Animal Type',
            numberOfAnimalsLabel: `जानवरों की संख्या / No. of ${getAnimalLabel(lic.animalType, true)}`,
            contactPhone: lic.owner?.phoneNumber || 'N/A', // Example, if owner details are nested
            contactEmail: 'info@example.com', // Replace
            contactWebsite: 'www.example.com' // Replace
        },
        hi: {
            orgNameEn: 'Nagar Nigam Gorakhpur',
            orgNameHi: 'नगर निगम गोरखपुर',
            certificateTitleEn: 'PET LICENSE CERTIFICATE',
            certificateTitleHi: 'पालतू पशु पंजीकरण प्रमाण पत्र',
            dateLabel: 'दिनांक:',
            photoPlaceholder: `${getAnimalLabel(lic.animalType)} की तस्वीर`,
            declaration: <>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है। <b>/</b> I declare that the information provided above is true to the best of my knowledge.</>,
            applicantSignature: 'आवेदक के हस्ताक्षर / Applicant\'s Signature',
            issuingAuthority: 'जारीकर्ता अधिकारी / Issuing Authority',
            qrCodeLabel: 'क्यूआर कोड',
            officialStamp: 'आधिकारिक मुहर',
            downloadPdfButton: 'पीडीएफ डाउनलोड करें',
            pendingNotice: <>आपका आवेदन समीक्षाधीन है। अनुमोदन के बाद ही आप लाइसेंस डाउनलोड कर पाएंगे।</>,
            rejectedNotice: (rejectionDate) => <>आपका आवेदन {formatDate(rejectionDate)} को अस्वीकृत कर दिया गया है।</>,
            reasonLabel: 'कारण:',
            contactSupport: <>अधिक जानकारी के लिए कृपया सहायता से संपर्क करें।</>,
            animalDetailsTitle: `पशु का विवरण / ${getAnimalLabel(lic.animalType)} Details`,
            animalNameLabel: `पशु का नाम / ${getAnimalLabel(lic.animalType)} Name`,
            animalTypeLabel: 'पशु का प्रकार / Animal Type',
            numberOfAnimalsLabel: `जानवरों की संख्या / No. of ${getAnimalLabel(lic.animalType, true)}`,
            contactPhone: lic.owner?.phoneNumber || 'उपलब्ध नहीं है',
            contactEmail: 'info@example.com', // Replace
            contactWebsite: 'www.example.com' // Replace
        }
    };
    const currentCertText = certificateText[languageType] || certificateText.en;

    return (
       <div className="user-dl-certificate-view">
         <div id={`pdf-${lic._id}`} className="pdf-layout">
           <div className="pdf-border">
             <div className="pdf-header">
               <div className="pdf-header-left">
                 <div className="pdf-logo-icon"> {/* Replace with actual logo image */}
                    <img src="/logo.webp" alt="Organization Logo" style={{height: '50px'}}/> {/* Ensure logo.webp is in public folder or use correct path */}
                 </div>
                 <div className="pdf-org-name">
                   <h3>{currentCertText.orgNameEn}</h3>
                   <h4>{currentCertText.orgNameHi}</h4>
                 </div>
               </div>
               <div className="pdf-header-right">
                 <div className="pdf-date">
                   <span> {currentCertText.dateLabel} {currentDate}</span>
                 </div>
               </div>
             </div>

             <div className="pdf-certificate-title">
               <h2>{currentCertText.certificateTitleEn}</h2>
               <h3>{currentCertText.certificateTitleHi}</h3>
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
                   {lic.pet?.avatarUrl ? (
                     <img src={lic.pet.avatarUrl} alt={`${lic.pet?.name || 'Pet'} Avatar`} className="pdf-photo" />
                   ) : (
                     <div className="pdf-photo-placeholder">{currentCertText.photoPlaceholder}</div>
                   )}
                 </div>
               </div>

               <div className="pdf-details-section">
                 <div className="pdf-section-title"> <PetSpecificIcon size={16} style={{marginRight: '8px'}}/>{currentCertText.animalDetailsTitle}</div>
                 <div className="pdf-details-columns">
                   <div className="pdf-details-column-left">
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.animalNameLabel}</div>
                       <div className="pdf-details-value">: {lic.pet?.name || "N/A"}</div>
                     </div>
                      <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.animalTypeLabel}</div>
                       <div className="pdf-details-value">: {lic.animalType || "N/A"}</div>
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">नस्ल / Breed</div>
                       <div className="pdf-details-value">: {lic.pet?.breed || "N/A"}</div>
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">वर्ग / Category</div>
                       <div className="pdf-details-value">: {lic.pet?.category || "N/A"}</div>
                     </div>
                      <div className="pdf-details-row">
                       <div className="pdf-details-label">आयु / Age</div>
                       <div className="pdf-details-value">: {lic.pet?.age || "N/A"}</div>
                     </div>
                   </div>
                   <div className="pdf-details-column-right">
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">लिंग / Gender</div>
                       <div className="pdf-details-value">: {lic.pet?.sex || "N/A"}</div>
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">रंग / Color</div>
                       <div className="pdf-details-value">: {lic.pet?.color || "N/A"}</div>
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">टीकाकरण / Vaccinated</div>
                       <div className="pdf-details-value">
                         : {lic.pet?.dateOfVaccination ? (languageType === 'hi' ? 'हां' : 'Yes') : (languageType === 'hi' ? 'नहीं' : 'No')}
                       </div>
                     </div>
                     {lic.pet?.vaccinationProofUrl && (
                       <div className="pdf-details-row">
                         <div className="pdf-details-label">टीकाकरण प्रमाणपत्र / Vaccination Certificate</div>
                         <div className="pdf-details-value">
                           <a
                             href={lic.pet.vaccinationProofUrl}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="pdf-vaccine-link"
                           > {languageType === 'hi' ? 'देखें' : 'View'} </a>
                         </div>
                       </div>
                     )}
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">माइक्रोचिप / Microchipped</div>
                       <div className="pdf-details-value">
                         : {languageType === 'hi' ? 'नहीं' : 'No'} {/* Assuming static */}
                       </div>
                     </div>
                   </div>
                 </div>
                  <div className="pdf-details-row pdf-full-width-row">
                       <div className="pdf-details-label">टीकाकरण की तारीख / Vaccination Date</div>
                       <div className="pdf-details-value">: {formatDate(lic.pet?.dateOfVaccination)}</div>
                  </div>
                  <div className="pdf-details-row pdf-full-width-row">
                       <div className="pdf-details-label">अगला टीकाकरण / Next Vaccination</div>
                       <div className="pdf-details-value">: {formatDate(lic.pet?.dueVaccination)}</div>
                  </div>
               </div>

               <div className="pdf-details-section">
                 <div className="pdf-section-title"><User size={16} style={{marginRight: '8px'}}/>मालिक का विवरण / Owner Details</div>
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
                    <div className="pdf-details-label">{currentCertText.numberOfAnimalsLabel}</div>
                     <div className="pdf-details-value">: {lic.numberOfAnimals || "N/A"}</div>
                   </div>
                   <div className="pdf-details-row">
                     <div className="pdf-details-label">घर का क्षेत्रफल / House Area</div>
                     <div className="pdf-details-value">: {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}</div>
                   </div>
                 </div>
               </div>

               <div className="pdf-declaration">
                 <p>{currentCertText.declaration}</p>
               </div>

               <div className="pdf-signatures">
                 <div className="pdf-signature-block">
                   <div className="pdf-signature-line"></div>
                   <p>{currentCertText.applicantSignature}</p>
                 </div>
                 <div className="pdf-signature-block">
                   <div className="pdf-signature-line"></div>
                   <p>{currentCertText.issuingAuthority}</p>
                 </div>
               </div>

               <div className="pdf-footer">
                   <div className="pdf-qr-code">
                       <div className="pdf-qr-placeholder">[QR Code Here]</div> {/* Replace with actual QR image or component */}
                     <p>{currentCertText.qrCodeLabel}</p>
                   </div>
                    <div className="pdf-stamp">
                        <div className="pdf-stamp-placeholder">
                            <Stamp size={50} style={{opacity: 0.7}}/>
                        </div>
                       <p>{currentCertText.officialStamp}</p>
                   </div>
               </div>
                <div className="pdf-contact-footer">
                    <Phone size={12} /> {currentCertText.contactPhone} &nbsp;|&nbsp;
                    <Globe size={12} /> {currentCertText.contactEmail} &nbsp;|&nbsp;
                    <MapPin size={12} /> {currentCertText.contactWebsite}
                </div>
             </div>
           </div>
         </div>
          {lic.status === 'approved' && (
              <button
                className="user-dl-button user-dl-certificate-download-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadPDFCallback(lic._id, lic.pet?.name, lic.animalType);
                }}
              >
                <DownloadIcon size={18} />
                <span>{currentCertText.downloadPdfButton}</span>
              </button>
            )}

            {lic.status === 'pending' && (
              <div className="user-dl-pending-notice">
                <AlertCircle size={18} />
                <p>{currentCertText.pendingNotice}</p>
              </div>
            )}
             {lic.status === 'renewal_pending' && ( // Notice for renewal pending
              <div className="user-dl-pending-notice">
                <Clock size={18} />
                <p>{languageType === 'hi' ? 'आपके लाइसेंस के नवीनीकरण का आवेदन समीक्षाधीन है। स्वीकृत होने पर आप नया लाइसेंस डाउनलोड कर पाएंगे।' : 'Your license renewal application is under review. You will be able to download the new license once approved.'}</p>
              </div>
            )}

            {lic.status === 'rejected' && (
            <div className="user-dl-rejected-notice">
              <XCircle size={18} />
              <div>
                <p>{currentCertText.rejectedNotice(lic.rejectionDate || lic.updatedAt)}</p> {/* Use rejectionDate or fallback */}
                {lic.rejectionReason && (
                  <div className="user-dl-rejection-reason">
                    <strong>{currentCertText.reasonLabel}</strong> {lic.rejectionReason}
                  </div>
                )}
                <p>{currentCertText.contactSupport}</p>
              </div>
            </div>
          )}
       </div>
    );
   };


const PetLicenseDownload = ({ languageType = 'en' }) => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLicenseId, setExpandedLicenseId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [filterStatus, setFilterStatus] = useState('All');

  const backend = "https://dog-registration.onrender.com"; // Replace with your backend URL
  const token = localStorage.getItem('token');

    const textContent = {
        en: {
            pageTitle: 'My Pet License Applications',
            filterLabel: 'Filter by:',
            filterButtons: {
                all: 'All',
                approved: 'Approved',
                pending: 'Pending',
                rejected: 'Rejected',
                renewal_pending: 'Renewal Pending'
            },
            backToList: 'Back to List',
            loadingData: 'Loading license data…',
            tableHeaders: {
                regNo: 'Reg. No',
                owner: 'Owner',
                animalType: 'Animal Type',
                petName: 'Pet Name',
                status: 'Status',
                appliedDate: 'Applied Date',
                view: 'View / Download'
            },
            tableCellView: 'View',
            emptyState: {
                noApplications: 'You have not applied for any pet licenses yet.',
                noFiltered: (status) => `No "${status}" pet licenses found.`,
                applyButton: 'Apply for a Pet License'
            },
            detailsTitle: (animalType) => `${getAnimalLabel(animalType)} License Details`
        },
        hi: {
            pageTitle: 'मेरे पालतू पशु लाइसेंस आवेदन',
            filterLabel: 'फ़िल्टर करें:',
            filterButtons: {
                all: 'सभी',
                approved: 'स्वीकृत',
                pending: 'लंबित',
                rejected: 'अस्वीकृत',
                renewal_pending: 'नवीनीकरण लंबित'
            },
            backToList: 'सूची पर वापस जाएं',
            loadingData: 'लाइसेंस डेटा लोड हो रहा है…',
            tableHeaders: {
                regNo: 'पंजीकरण संख्या',
                owner: 'मालिक',
                animalType: 'पशु का प्रकार',
                petName: 'पालतू जानवर का नाम',
                status: 'स्थिति',
                appliedDate: 'आवेदन की तिथि',
                view: 'देखें / डाउनलोड करें'
            },
            tableCellView: 'देखें',
            emptyState: {
                noApplications: 'आपने अभी तक किसी भी पालतू पशु लाइसेंस के लिए आवेदन नहीं किया है।',
                noFiltered: (status) => `कोई भी "${status}" पालतू पशु लाइसेंस नहीं मिला।`,
                applyButton: 'पालतू पशु लाइसेंस के लिए आवेदन करें'
            },
            detailsTitle: (animalType) => `${getAnimalLabel(animalType)} लाइसेंस विवरण`
        }
    };

    const currentText = textContent[languageType] || textContent.en;

    const getFilterButtonText = (statusKey) => {
        return currentText.filterButtons[statusKey] || statusKey;
    };

     const getTranslatedFilterStatus = (statusKeyForEmptyState) => { // statusKeyForEmptyState is like 'approved', 'pending'
         return currentText.filterButtons[statusKeyForEmptyState.toLowerCase()] || statusKeyForEmptyState;
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
    setLoading(true);
    fetch(`${backend}/api/license/user`, { // Ensure this endpoint provides animalType
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
          if (!res.ok) {
               return res.json().then(err => { throw new Error(err.message || 'Failed to fetch licenses'); });
          }
          return res.json();
      })
      .then(data => {
         const processedData = (Array.isArray(data) ? data : []).map(lic => ({ // Ensure data is an array
           ...lic,
           animalType: lic.animalType || 'Pet' // Default animalType
         }));
         const sortedLicenses = processedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
         setLicenses(sortedLicenses);
      })
      .catch(error => {
        console.error("Error fetching licenses:", error);
         setLicenses([]); // Set to empty array on error
      })
      .finally(() => {
        setLoading(false);
      });
  }, [backend, token]);

  const toggleExpanded = (id) => {
    setExpandedLicenseId(expandedLicenseId === id ? null : id);
  };

  const downloadPDF = (id, petName = 'pet', animalType = 'Pet') => {
    const element = document.getElementById(`pdf-${id}`);
      if (!element) {
         console.error("PDF element not found for ID:", id);
         alert("Could not find certificate content to download.");
         return;
     }

    element.classList.add('force-desktop-pdf-layout');

    const opt = {
      margin: [0.2, 0.1, 0.2, 0.1], // top, left, bottom, right in inches
      filename: `${getAnimalLabel(animalType)}_License_${(petName || 'Unnamed').replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

     setTimeout(() => {
         html2pdf().from(element).set(opt).save().then(() => {
           element.classList.remove('force-desktop-pdf-layout');
         }).catch(error => {
            console.error("PDF generation failed:", error);
            alert("PDF generation failed. Please try again.");
             element.classList.remove('force-desktop-pdf-layout');
         });
     }, 100);
  };

  const selectedLicense = licenses.find(lic => lic._id === expandedLicenseId);

  const filteredLicenses = licenses.filter(license => {
    if (filterStatus === 'All') return true;
    // Ensure filterStatus and license.status are consistently cased for comparison
    return license.status?.toLowerCase() === filterStatus.toLowerCase();
  });


  return (
    <main className="user-dl-container">
      <header className="user-dl-header">
        {expandedLicenseId === null ? (
            <>
             <h1 className="user-dl-title">{currentText.pageTitle}</h1>
             <div className="user-dl-filters">
               <span className="user-dl-filter-label">{currentText.filterLabel}</span>
               {Object.keys(currentText.filterButtons).map(key => (
                   <button
                        key={key}
                        className={`user-dl-filter-btn user-dl-filter-${key.toLowerCase()} ${filterStatus.toLowerCase() === key.toLowerCase() ? 'user-dl-filter-active' : ''}`}
                        onClick={() => setFilterStatus(textContent.en.filterButtons[key])} // Store English status key
                    >
                        {getFilterButtonText(key)}
                    </button>
               ))}
             </div>
            </>
        ) : (
            <div className="user-dl-back-to-list-header">
                 <button
                       className="user-dl-back-to-list-btn"
                       onClick={() => toggleExpanded(expandedLicenseId)} // expandedLicenseId will be valid here
                   >
                     <ChevronLeft size={24} />
                     {currentText.backToList}
                   </button>
                  
            </div>
        )}
      </header>

      {loading ? (
        <div className="user-dl-loading">
          <div className="user-dl-spinner"></div>
          <p className="user-dl-status">{currentText.loadingData}</p>
        </div>
      ) : filteredLicenses.length > 0 ? (
          expandedLicenseId === null ? (
            <div className="user-dl-table-container">
               <table className="user-dl-license-table">
                 <thead>
                    <tr>
                      <th>{currentText.tableHeaders.regNo}</th>
                      <th>{currentText.tableHeaders.owner}</th>
                      {!isMobile && <th>{currentText.tableHeaders.animalType}</th>}
                      {!isMobile && <th>{currentText.tableHeaders.petName}</th>}
                      <th>{currentText.tableHeaders.status}</th>
                      {!isMobile && <th>{currentText.tableHeaders.appliedDate}</th>}
                      <th>{currentText.tableHeaders.view}</th>
                    </tr>
                 </thead>
                 <tbody>
                    {filteredLicenses.map(license => {
                      const PetListIcon = getPetIcon(license.animalType);
                      return (
                       <tr key={license._id} onClick={() => toggleExpanded(license._id)} className="user-dl-table-row">
                         <td><div className="user-dl-cell user-dl-reg-no-cell">{!isMobile && <FileText size={16} className="user-dl-cell-icon" />} {license.license_Id || "N/A"}</div></td>
                         <td><div className="user-dl-cell user-dl-owner-cell">{!isMobile && <User size={16} className="user-dl-cell-icon" />} {license.fullName}</div></td>
                         {!isMobile && <td><div className="user-dl-cell user-dl-animal-type-cell"><PetListIcon size={16} className="user-dl-cell-icon" /> {license.animalType || "N/A"}</div></td>}
                         {!isMobile && <td><div className="user-dl-cell user-dl-pet-cell"><PetListIcon size={16} className="user-dl-cell-icon" /> {license.pet?.name || "N/A"}</div></td>}
                         <td><div className="user-dl-cell user-dl-status-cell"><UserStatusBadge status={license.status} isMobile={isMobile} languageType={languageType} /></div></td>
                         {!isMobile && <td><div className="user-dl-cell user-dl-date-cell"><Calendar size={16} className="user-dl-cell-icon" /> {formatDate(license.createdAt)}</div></td>}
                         <td>
                              <button
                                 className="user-dl-view-btn"
                                 title={license.status === 'approved' ? 'View & Download Certificate' : 'View Details'}
                                 onClick={(e) => { // Keep button distinct if row is also clickable
                                      e.stopPropagation();
                                     toggleExpanded(license._id);
                                }}
                             >
                                  <Eye size={16} className="user-dl-btn-icon" /> {!isMobile && currentText.tableCellView}
                                  {license.status === 'approved' && !isMobile && <DownloadIcon size={16} style={{marginLeft: '4px'}}/>}
                             </button>
                         </td>
                     </tr>
                    )})}
                 </tbody>
               </table>
            </div>
          ) : ( // This is the expanded view
               <div className="user-dl-details-view">
                   {selectedLicense ? renderCertificateView(selectedLicense, isMobile, downloadPDF, languageType) : <p>Loading details...</p>}
               </div>
           )
      ) : (
        <div className="user-dl-empty-state">
          <div className="user-dl-empty-icon">
             <FileText size={48} />
          </div>
          <p className="user-dl-no-data">
               {filterStatus === 'All'
                   ? currentText.emptyState.noApplications
                   : currentText.emptyState.noFiltered(getTranslatedFilterStatus(filterStatus.toLowerCase())) // Ensure status key matches
               }
          </p>
            {filterStatus === 'All' && (
                <button className="user-dl-new-application-btn" onClick={() => { /* Implement navigation to application form */ alert('Redirecting to application form...'); }}>
                  {currentText.emptyState.applyButton}
                </button>
            )}
        </div>
      )}
    </main>
  );
};

export default PetLicenseDownload;