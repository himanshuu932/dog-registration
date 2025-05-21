import React, { useEffect, useState } from "react";
import html2pdf from 'html2pdf.js';
import './styles/Download.css'; // Ensure this path is correct
import {
  Download,
  CheckCircle,
  XCircle,
  // ChevronDown, // Not used in this version for expanded view
  // ChevronUp, // Not used
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  User,
  Dog, // Consider a more generic icon or logic to switch icons based on animalType
  Eye,
  ChevronLeft,
  // Award, // Not used
  // Syringe, // Not used
  // Stamp, // Not used
  // Globe, // Not used
  // Phone, // Not used
  // MapPin, // Not used
  // Image // Not used
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
};

// const getCurrentDate = () => { // Not used directly in this simplified version's PDF, but available
//   const now = new Date();
//   return now.toLocaleDateString('en-GB');
// };

const UserStatusBadge = ({ status, isMobile, languageType = 'en' }) => {
  const statusText = {
    en: {
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected',
      provisional: 'Provisional'
    },
    hi: {
      approved: 'स्वीकृत',
      pending: 'लंबित',
      rejected: 'अस्वीकृत',
      provisional: 'अस्थायी'
    }
  };

  const currentStatusText = statusText[languageType] || statusText.en;
  const statusKey = status ? status.toLowerCase() : 'default';

  let badgeClass = "user-dl-status-badge";
  let Icon = AlertCircle;
  let iconColor = 'var(--user-dl-warning)';

  switch(statusKey) {
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
    case 'provisional': // Assuming provisional might have its own style or share with pending/approved
      badgeClass += " user-dl-status-pending"; // Example: treat like pending for badge color
      Icon = Clock; // Example
      iconColor = 'var(--user-dl-warning)';
      break;
    default:
      badgeClass += " user-dl-status-default";
      Icon = AlertCircle;
      iconColor = 'var(--user-dl-dark)';
  }

  const displayStatusText = currentStatusText[statusKey] || status;

  return (
    <span className={badgeClass}>
      <Icon size={16} style={{ color: iconColor }} />
      {!isMobile && <span>{displayStatusText}</span>}
    </span>
  );
};

const getAnimalLabel = (animalType = 'Pet') => {
  if (!animalType) return 'Pet';
  const lower = animalType.toLowerCase();
  switch (lower) {
    case 'dog': return 'Dog';
    case 'cat': return 'Cat';
    case 'rabbit': return 'Rabbit';
    default: return animalType.charAt(0).toUpperCase() + animalType.slice(1);
  }
};

const VET_DETAILS = {
  name: "Dr. John Smith",
  clinic: "City Veterinary Hospital",
  phone: "+1 (555) 123-4567",
  address: "123 Main Street, Gorakhpur, UP 273001"
};

// This function now returns the certificate's visual structure and associated UI (button, notices)
const renderCertificateView = (lic, downloadPDF, languageType = 'en') => {
  const currentDateOnCertificate = new Date().toLocaleDateString('en-GB'); // Date for the certificate header
  
  const expiryDate = lic.isProvisional ? 
    formatDate(lic.provisionalExpiryDate) : 
    lic.pet?.dateOfVaccination ?
      new Date(new Date(lic.pet.dateOfVaccination).setFullYear(
        new Date(lic.pet.dateOfVaccination).getFullYear() + 1
      )).toLocaleDateString('en-GB') : "N/A";

  const certificateText = {
    en: {
      orgNameEn: 'Nagar Nigam Gorakhpur',
      orgNameHi: 'नगर निगम गोरखपुर',
      certificateTitleEn: 'PET LICENSE CERTIFICATE',
      certificateTitleHi: 'पशु लाइसेंस प्रमाणपत्र',
      provisionalCertificateTitleEn: 'PROVISIONAL PET LICENSE CERTIFICATE',
      provisionalCertificateTitleHi: 'अस्थायी पशु लाइसेंस प्रमाणपत्र',
      dateLabel: 'Date:',
      photoPlaceholder: 'Pet\'s Photo',
      declaration: <>I declare that the information provided above is true to the best of my knowledge. <b>/</b> मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।</>,
      applicantSignature: 'Applicant\'s Signature / आवेदक के हस्ताक्षर',
      issuingAuthority: 'Issuing Authority / जारीकर्ता अधिकारी',
      qrCodeLabel: 'QR Code',
      officialStamp: 'OFFICIAL STAMP',
      downloadPdfButton: 'Download PDF',
      provisionalNoticeBanner: 'PROVISIONAL LICENSE: Valid for 30 days. Rabies certification required for full license.',
      vetDetailsTitle: 'Approved Veterinary Clinic',
      vetNameLabel: 'Veterinarian:',
      vetClinicLabel: 'Clinic:',
      vetPhoneLabel: 'Contact:',
      vetAddressLabel: 'Address:',
      provisionalInstructions: 'You must visit the approved veterinary clinic within 30 days to vaccinate your pet and convert this to a full license.',
      pendingNotice: <>Your application is under review. You will be able to download the license once approved.</>,
      rejectedNotice: (rejectionDate) => <>Your application has been rejected on {formatDate(rejectionDate)}.</>,
      reasonLabel: 'Reason:',
      contactSupport: <>Please contact support for more information.</>,
      animalTypeLabelBilingual: 'Animal Type / पशु का प्रकार',
    },
    hi: {
      orgNameEn: 'Nagar Nigam Gorakhpur',
      orgNameHi: 'नगर निगम गोरखपुर',
      certificateTitleEn: 'PET LICENSE CERTIFICATE',
      certificateTitleHi: 'पशु लाइसेंस प्रमाणपत्र',
      provisionalCertificateTitleEn: 'PROVISIONAL PET LICENSE CERTIFICATE',
      provisionalCertificateTitleHi: 'अस्थायी पशु लाइसेंस प्रमाणपत्र',
      dateLabel: 'दिनांक:',
      photoPlaceholder: 'पशु की तस्वीर',
      declaration: <>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है। <b>/</b> I declare that the information provided above is true to the best of my knowledge.</>,
      applicantSignature: 'आवेदक के हस्ताक्षर / Applicant\'s Signature',
      issuingAuthority: 'जारीकर्ता अधिकारी / Issuing Authority',
      qrCodeLabel: 'क्यूआर कोड',
      officialStamp: 'आधिकारिक मुहर',
      downloadPdfButton: 'पीडीएफ डाउनलोड करें',
      provisionalNoticeBanner: 'अस्थायी लाइसेंस: 30 दिनों के लिए वैध। पूर्ण लाइसेंस के लिए रेबीज प्रमाणीकरण आवश्यक है।',
      vetDetailsTitle: 'अनुमोदित पशु चिकित्सा क्लिनिक',
      vetNameLabel: 'पशु चिकित्सक:',
      vetClinicLabel: 'क्लिनिक:',
      vetPhoneLabel: 'संपर्क:',
      vetAddressLabel: 'पता:',
      provisionalInstructions: 'आपको अपने पालतू जानवर का टीकाकरण कराने और इसे पूर्ण लाइसेंस में बदलने के लिए 30 दिनों के भीतर अनुमोदित पशु चिकित्सा क्लिनिक पर जाना होगा।',
      pendingNotice: <>आपका आवेदन समीक्षाधीन है। अनुमोदन के बाद ही आप लाइसेंस डाउनलोड कर पाएंगे।</>,
      rejectedNotice: (rejectionDate) => <>आपका आवेदन {formatDate(rejectionDate)} को अस्वीकृत कर दिया गया है।</>,
      reasonLabel: 'कारण:',
      contactSupport: <>अधिक जानकारी के लिए कृपया सहायता से संपर्क करें।</>,
      animalTypeLabelBilingual: 'पशु का प्रकार / Animal Type',
    }
  };

  const currentCertText = certificateText[languageType] || certificateText.en;

  const certTitleEn = lic.isProvisional ? currentCertText.provisionalCertificateTitleEn : currentCertText.certificateTitleEn;
  const certTitleHi = lic.isProvisional ? currentCertText.provisionalCertificateTitleHi : currentCertText.certificateTitleHi;

  return (
    // This is the container for the certificate preview and its actions
    <div className="certificate-display-area"> 
      <div id={`pdf-${lic._id}`} className="pdf-layout"> {/* This is the A4 element */}
        {/* Outer border */}
        <div className="outer-pdf-border">
          <div className="pdf-border">
            {/* PDF Header */}
            <div className="pdf-header">
              <div className="pdf-header-left">
                <div className="pdf-logo-icon">
                  <img src="/logo.webp" alt="Organization Logo" />
                </div>
                <div className="pdf-org-name">
                  <h3>{currentCertText.orgNameEn}</h3>
                  <h4>{currentCertText.orgNameHi}</h4>
                </div>
              </div>
              <div className="pdf-header-right">
                 <div className="pdf-logo-icon">
                  <img src="/up.webp" alt="Organization Logo" />
                </div>
              
              </div>
            </div>

            {/* Certificate Title */}
            <div className="pdf-certificate-title">
              <h2>{certTitleEn}</h2>
              <h3>{certTitleHi}</h3>
            </div>
            
            {/* Provisional Notice - BANNER inside the certificate, if applicable */}
           

            {/* PDF Body */}
            <div className="pdf-body">
              <div className="pdf-photo-section">
                <div className="pdf-info-block">
                  <div className="pdf-info-row"><div className="pdf-info-label">नाम / Name</div><div className="pdf-info-value">: {lic.fullName || "N/A"}</div></div>
                  <div className="pdf-info-row"><div className="pdf-info-label">पंजीकरण संख्या / Registration No.</div><div className="pdf-info-value">: {lic.license_Id || "N/A"}</div></div>
                  <div className="pdf-info-row"><div className="pdf-info-label">जारी दिनांक / Issue Date</div><div className="pdf-info-value">: {formatDate(lic.createdAt)}</div></div>
                  <div className="pdf-info-row"><div className="pdf-info-label">समाप्ति तिथि / Expiry Date</div><div className="pdf-info-value">: {expiryDate}</div></div>
                </div>
                <div className="pdf-photo-box">
                  {lic.pet?.avatarUrl ? (
                    <img src={lic.pet.avatarUrl} alt="Pet" className="pdf-photo" />
                  ) : (
                    <div className="pdf-photo-placeholder">{currentCertText.photoPlaceholder}</div>
                  )}
                </div>
              </div>

              {lic.isProvisional && (
                <div className="pdf-details-section">
                  <div className="pdf-section-title">{currentCertText.vetDetailsTitle}</div>
                  <div className="pdf-details-columns">
                    <div className="pdf-details-column-left">
                      <div className="pdf-details-row"><div className="pdf-details-label">{currentCertText.vetNameLabel}</div><div className="pdf-details-value">{VET_DETAILS.name}</div></div>
                      <div className="pdf-details-row"><div className="pdf-details-label">{currentCertText.vetPhoneLabel}</div><div className="pdf-details-value">{VET_DETAILS.phone}</div></div>
                    </div>
                    <div className="pdf-details-column-right">
                      <div className="pdf-details-row"><div className="pdf-details-label">{currentCertText.vetClinicLabel}</div><div className="pdf-details-value">{VET_DETAILS.clinic}</div></div>
                      <div className="pdf-details-row"><div className="pdf-details-label">{currentCertText.vetAddressLabel}</div><div className="pdf-details-value">{VET_DETAILS.address}</div></div>
                    </div>
                  </div>
                  <div className="pdf-provisional-instructions">
                    <p>{currentCertText.provisionalInstructions}</p>
                  </div>
                </div>
              )}

              <div className="pdf-details-section">
                <div className="pdf-section-title">पशु का विवरण / Pet Details</div>
                <div className="pdf-details-columns">
                  <div className="pdf-details-column-left">
                    <div className="pdf-details-row"><div className="pdf-details-label">{currentCertText.animalTypeLabelBilingual}</div><div className="pdf-details-value">: {getAnimalLabel(lic.animalType) || "N/A"}</div></div>
                    <div className="pdf-details-row"><div className="pdf-details-label">पशु का नाम / Pet Name</div><div className="pdf-details-value">: {lic.pet?.name || "N/A"}</div></div>
                    <div className="pdf-details-row"><div className="pdf-details-label">नस्ल / Breed</div><div className="pdf-details-value">: {lic.pet?.breed || "N/A"}</div></div>
                    <div className="pdf-details-row"><div className="pdf-details-label">वर्ग / Category</div><div className="pdf-details-value">: {lic.pet?.category || "N/A"}</div></div>
                    <div className="pdf-details-row"><div className="pdf-details-label">रंग / Color</div><div className="pdf-details-value">: {lic.pet?.color || "N/A"}</div></div>
                    <div className="pdf-details-row"><div className="pdf-details-label">आयु / Age</div><div className="pdf-details-value">: {lic.pet?.age || "N/A"}</div></div>
                  </div>
                  <div className="pdf-details-column-right">
                    <div className="pdf-details-row"><div className="pdf-details-label">लिंग / Gender</div><div className="pdf-details-value">: {lic.pet?.sex || "N/A"}</div></div>
                    <div className="pdf-details-row"><div className="pdf-details-label">टीकाकरण की तारीख / Vaccination Date</div><div className="pdf-details-value">: {formatDate(lic.pet?.dateOfVaccination)}</div></div>
                    <div className="pdf-details-row"><div className="pdf-details-label">टीकाकरण / Vaccinated</div><div className="pdf-details-value">: {lic.pet?.dateOfVaccination ? ' हां / Yes' : ' नहीं / No'}</div></div>
                    {lic.pet?.vaccinationProofUrl && (<div className="pdf-details-row"><div className="pdf-details-label">टीकाकरण प्रमाणपत्र / Vaccination Certificate</div><div className="pdf-details-value"><a href={lic.pet.vaccinationProofUrl} target="_blank" rel="noreferrer noopener" className="pdf-vaccine-img">View</a></div></div>)}
                    <div className="pdf-details-row"><div className="pdf-details-label">माइक्रोचिप / Microchipped</div><div className="pdf-details-value">: No</div></div>
                    <div className="pdf-details-row"><div className="pdf-details-label">अगला टीकाकरण / Next Vaccination</div><div className="pdf-details-value">: {formatDate(lic.pet?.dueVaccination)}</div></div>
                  </div>
                </div>
              </div>

              <div className="pdf-details-section">
                <div className="pdf-section-title">मालिक का विवरण / Owner Details</div>
                <div className="pdf-details-table">
                  <div className="pdf-details-row"><div className="pdf-details-label">पता / Address</div><div className="pdf-details-value">: {`${lic.address?.streetName || ""}, ${lic.address?.city || ""}, ${lic.address?.state || ""} - ${lic.address?.pinCode || "N/A"}`}</div></div>
                  <div className="pdf-details-row"><div className="pdf-details-label">फोन नंबर / Phone Number</div><div className="pdf-details-value">: {lic.phoneNumber || "N/A"}</div></div>
                  <div className="pdf-details-row"><div className="pdf-details-label">{`जानवरों की संख्या / No. of ${getAnimalLabel(lic.animalType)}s`}</div><div className="pdf-details-value">:{lic.numberOfAnimals || "N/A"}</div></div>
                  <div className="pdf-details-row"><div className="pdf-details-label">घर का क्षेत्रफल / House Area</div><div className="pdf-details-value">: {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}</div></div>
                </div>
              </div>

              <div className="pdf-declaration"><p>{currentCertText.declaration}</p></div>
            </div>
            {/* END PDF Body */}

            {/* PDF Signatures and Footer are outside pdf-body to be at the bottom of pdf-border */}
            <div className="pdf-signatures">
              <div className="pdf-signature-block"><div className="pdf-signature-line"></div><p>{currentCertText.applicantSignature}</p></div>
              <div className="pdf-signature-block"><div className="pdf-signature-line"></div><p>{currentCertText.issuingAuthority}</p></div>
            </div>

            <div className="pdf-footer-bottom">
              <div className="pdf-qr-code">
                <div className="pdf-qr-placeholder"></div>
                <p>{currentCertText.qrCodeLabel}</p>
              </div>
              {lic.isProvisional && (
              <div className="pdf-provisional-notice-banner">
                <AlertCircle size={14} /> 
                <span>{currentCertText.provisionalNoticeBanner}</span>
              </div>
            )}
              <div className="pdf-stamp">
                <div className="pdf-stamp-placeholder"><p>{currentCertText.officialStamp}</p></div>
              </div>
            </div>
            <div className="pdf-contact-footer">
              1234  |  info@awbi.org  |  www.awbi.org |
                
                  <span>{currentCertText.dateLabel} {currentDateOnCertificate}</span>
                
            </div>

          </div> {/* End pdf-border */}
        </div> {/* End outer-pdf-border */}
      </div> {/* End pdf-layout */}

      {/* Action buttons and notices - rendered outside the .pdf-layout element */}
      {(lic.status === 'approved' || lic.isProvisional) && (
        <button
          className="user-dl-button user-dl-certificate-download-btn"
          onClick={(e) => {
            e.stopPropagation();
            downloadPDF(lic._id, lic.pet?.name || getAnimalLabel(lic.animalType));
          }}
        >
          <Download size={18} />
          <span>{currentCertText.downloadPdfButton}</span>
        </button>
      )}

      {lic.status === 'pending' && !lic.isProvisional && ( // Show pending only if not also provisional
        <div className="user-dl-pending-notice">
          <AlertCircle size={18} />
          <p>{currentCertText.pendingNotice}</p>
        </div>
      )}

      {lic.status === 'rejected' && (
        <div className="user-dl-rejected-notice">
          <XCircle size={18} />
          <div>
            <p>{currentCertText.rejectedNotice(lic.rejectionDate)}</p>
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


const DogLicenseDownload = ({ languageType = 'en' }) => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLicenseId, setExpandedLicenseId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [filterStatus, setFilterStatus] = useState('All');

  const backend = "https://dog-registration.onrender.com"; // Replace with your actual backend URL
  const token = localStorage.getItem('token');

  const textContent = {
    en: {
      pageTitle: 'My Pet License Applications',
      filterLabel: 'Filter by:',
      filterButtons: { all: 'All', approved: 'Approved', pending: 'Pending', rejected: 'Rejected', provisional: 'Provisional' },
      backToList: 'Back to Applications List',
      loadingData: 'Loading license data…',
      tableHeaders: { regNo: 'Reg. No', owner: 'Owner', petName: 'Pet Name', animalType: 'Animal Type', status: 'Status', appliedDate: 'Applied Date', view: 'View/Download' },
      tableCellView: 'View',
      emptyState: { noApplications: 'You have not applied for any licenses yet.', noFiltered: (status) => `No "${status}" licenses found.`, applyButton: 'Apply for a New License' }
    },
    hi: {
      pageTitle: 'मेरे पालतू पशु लाइसेंस आवेदन',
      filterLabel: 'फ़िल्टर करें:',
      filterButtons: { all: 'सभी', approved: 'स्वीकृत', pending: 'लंबित', rejected: 'अस्वीकृत', provisional: 'अस्थायी' },
      backToList: 'आवेदन सूची पर वापस जाएं',
      loadingData: 'लाइसेंस डेटा लोड हो रहा है…',
      tableHeaders: { regNo: 'पंजीकरण संख्या', owner: 'मालिक', petName: 'पशु का नाम', animalType: 'पशु का प्रकार', status: 'स्थिति', appliedDate: 'आवेदन की तिथि', view: 'देखें/डाउनलोड करें' },
      tableCellView: 'देखें',
      emptyState: { noApplications: 'आपने अभी तक किसी भी लाइसेंस के लिए आवेदन नहीं किया है।', noFiltered: (status) => `कोई भी "${status}" लाइसेंस नहीं मिला।`, applyButton: 'नए लाइसेंस के लिए आवेदन करें' }
    }
  };
  const currentText = textContent[languageType] || textContent.en;

  const getFilterButtonText = (statusKey) => currentText.filterButtons[statusKey] || statusKey;
  const getTranslatedFilterStatus = (status) => {
    const statusKey = Object.keys(textContent.en.filterButtons).find(key => textContent.en.filterButtons[key].toLowerCase() === status.toLowerCase());
    return statusKey ? getFilterButtonText(statusKey) : status;
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${backend}/api/license/user`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.message || 'Failed to fetch licenses'); }))
      .then(data => {
        const sortedLicenses = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLicenses(sortedLicenses);
      })
      .catch(error => {
        console.error("Error fetching licenses:", error);
        setLicenses([]); // Set to empty array on error
      })
      .finally(() => setLoading(false));
  }, [backend, token]);

  const toggleExpanded = (id) => setExpandedLicenseId(prevId => (prevId === id ? null : id));

  const downloadPDF = (id, petName = 'Pet') => {
    const element = document.getElementById(`pdf-${id}`);
    if (!element) {
      console.error("PDF element not found for ID:", id);
      return;
    }

    const animalTypeForName = licenses.find(l => l._id === id)?.animalType || 'Pet';

    const opt = {
      margin: 0,
      filename: `${getAnimalLabel(animalTypeForName)}_License_${petName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.95 }, // Slightly adjusted quality
      html2canvas: { 
        scale: 1.5, // Adjust scale for balance of quality and performance/fit
        useCORS: true,
        // Ensure background of the element is captured if it's not white by default in html2canvas
        backgroundColor: '#ffffff', // Explicitly set background for capture if needed
        // You might need to adjust DPI if millimeter conversion is an issue for html2canvas
        // dpi: 144, // (72 * 2 for example if scale is 2, 72 * 1.5 = 108)
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Brief timeout to ensure styles are applied if any DOM changes were made right before
    setTimeout(() => {
      html2pdf().from(element).set(opt).save()
        .catch(error => console.error("PDF generation failed:", error));
    }, 100);
  };
  
  const selectedLicense = licenses.find(lic => lic._id === expandedLicenseId);

  const filteredLicenses = licenses.filter(license => {
    if (filterStatus === 'All') return true;
    // Handle 'provisional' status distinctly if it's a primary status, 
    // or if isProvisional is a boolean flag alongside another status.
    // Assuming isProvisional is a primary filter option:
    if (filterStatus.toLowerCase() === 'provisional') {
      return license.isProvisional; // Make sure your data model has 'isProvisional'
    }
    return license.status && license.status.toLowerCase() === filterStatus.toLowerCase();
  });


  if (loading) {
    return (
      <main className="user-dl-container">
        <div className="user-dl-loading">
          <div className="user-dl-spinner"></div>
          <p className="user-dl-status">{currentText.loadingData}</p>
        </div>
      </main>
    );
  }
  
  // If a license is expanded (selectedLicense is not null)
  if (selectedLicense) {
    return (
      <main className="user-dl-container user-dl-certificate-focused-container">
        <header className="user-dl-header user-dl-certificate-header">
          <div className="user-dl-back-to-list-header">
            <button
              className="user-dl-back-to-list-btn"
              onClick={() => toggleExpanded(selectedLicense._id)}
            >
              <ChevronLeft size={isMobile ? 20 : 24} />
              {currentText.backToList}
            </button>
          </div>
        </header>
        {/* Render the certificate view itself */}
        {renderCertificateView(selectedLicense, downloadPDF, languageType)}
      </main>
    );
  }

  // Main list view
  return (
    <main className="user-dl-container">
      <header className="user-dl-header">
        <h1 className="user-dl-title">{currentText.pageTitle}</h1>
        <div className="user-dl-filters">
          <span className="user-dl-filter-label">{currentText.filterLabel}</span>
          {Object.keys(currentText.filterButtons).map(key => (
            <button
              key={key}
              className={`user-dl-filter-btn user-dl-filter-${key.toLowerCase()} ${
                filterStatus.toLowerCase() === textContent.en.filterButtons[key].toLowerCase() ? 'user-dl-filter-active' : ''
              }`}
              onClick={() => setFilterStatus(textContent.en.filterButtons[key])}
            >
              {getFilterButtonText(key)}
            </button>
          ))}
        </div>
      </header>

      {filteredLicenses.length > 0 ? (
        <div className="user-dl-table-container">
          <table className="user-dl-license-table">
            <thead>
              <tr>
                <th>{currentText.tableHeaders.regNo}</th>
                <th>{currentText.tableHeaders.owner}</th>
                {!isMobile && <th>{currentText.tableHeaders.petName}</th>}
                {!isMobile && <th>{currentText.tableHeaders.animalType}</th>}
                <th>{currentText.tableHeaders.status}</th>
                {!isMobile && <th>{currentText.tableHeaders.appliedDate}</th>}
               {!isMobile && <th>{currentText.tableHeaders.view}</th>}
              </tr>
            </thead>
            <tbody>
              {filteredLicenses.map(license => (
                <tr key={license._id} onClick={() => toggleExpanded(license._id)}>
                  <td><div className="user-dl-cell">{!isMobile && <FileText size={16} className="user-dl-cell-icon" />} {license.license_Id || "N/A"}</div></td>
                  <td><div className="user-dl-cell">{!isMobile && <User size={16} className="user-dl-cell-icon" />} {license.fullName}</div></td>
                  {!isMobile && <td><div className="user-dl-cell"><Dog size={16} className="user-dl-cell-icon" /> {license.pet?.name || "N/A"}</div></td>}
                  {!isMobile && <td><div className="user-dl-cell">{getAnimalLabel(license.animalType) || "N/A"}</div></td>}
                  <td><div className="user-dl-cell"><UserStatusBadge status={license.isProvisional ? 'provisional' : license.status} isMobile={isMobile} languageType={languageType} /></div></td>
                  {!isMobile && <td><div className="user-dl-cell"><Calendar size={16} className="user-dl-cell-icon" /> {formatDate(license.createdAt)}</div></td>}
                  {!isMobile &&<td>
                    <button
                      className="user-dl-view-btn"
                      onClick={(e) => { e.stopPropagation(); toggleExpanded(license._id); }}
                    >
                      <Eye size={16} className="user-dl-btn-icon" /> 
                      {!isMobile && <span>{currentText.tableCellView}</span>}
                    </button>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="user-dl-empty-state">
          <div className="user-dl-empty-icon"><FileText size={48} /></div>
          <p className="user-dl-no-data">
            {filterStatus === 'All' ? currentText.emptyState.noApplications : currentText.emptyState.noFiltered(getTranslatedFilterStatus(filterStatus))}
          </p>
          {filterStatus === 'All' && ( // Show "Apply" button only if no filters are active and list is empty
             licenses.length === 0 && // Or more strictly, only if there are truly no licenses at all
            <button className="user-dl-new-application-btn" onClick={() => alert('Navigate to application form') /* Replace with actual navigation */}>
              {currentText.emptyState.applyButton}
            </button>
          )}
        </div>
      )}
    </main>
  );
};

export default DogLicenseDownload;