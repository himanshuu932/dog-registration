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
    // case 'provisional':
    //   badgeClass += " user-dl-status-provisional";
    //   Icon = Clock;
    //   iconColor = 'var(--user-dl-dark)';
    //   break;
    default:
      badgeClass += " user-dl-status-default";
      Icon = AlertCircle;
      iconColor = 'var(--user-dl-dark)';
  }

  const displayStatusText = currentStatusText[status.toLowerCase()] || status;

  return (
    <span className={badgeClass}>
      <Icon size={16} style={{ color: iconColor }} />
      {!isMobile && <span>{displayStatusText}</span>}
    </span>
  );
};

const getAnimalLabel = (animalType = 'Pet') => {
  const lower = animalType.toLowerCase();
  switch (lower) {
    case 'dog': return 'Dog';
    case 'cat': return 'Cat';
    case 'rabbit': return 'Rabbit';
    default: return 'Pet';
  }
};

// Hardcoded vet details
const VET_DETAILS = {
  name: "Dr. John Smith",
  clinic: "City Veterinary Hospital",
  phone: "+1 (555) 123-4567",
  address: "123 Main Street, Gorakhpur, UP 273001"
};

const renderCertificateView = (lic, isMobile, downloadPDF, languageType = 'en') => {
  const currentDate = new Date().toLocaleDateString('en-GB');
  
  // Calculate expiry date based on license type
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
      certificateTitleEn: 'OFFICIAL PET LICENSE CERTIFICATE',
      certificateTitleHi: 'कुत्तों के पंजीकरण के लिए अधिकृत पत्र',
      dateLabel: 'Date:',
      photoPlaceholder: 'Pet\'s Photo',
      declaration: <>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।  <b>/</b> I declare that the information provided above is true to the best of my knowledge.</>,
      applicantSignature: 'आवेदक के हस्ताक्षर / Applicant\'s Signature',
      issuingAuthority: 'जारीकर्ता अधिकारी / Issuing Authority',
      qrCodeLabel: 'QR Code',
      officialStamp: 'OFFICIAL STAMP',
      downloadPdfButton: 'Download PDF',
      provisionalNotice: 'PROVISIONAL LICENSE - Valid for 30 days',
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
    },
    hi: {
      orgNameEn: 'Nagar Nigam Gorakhpur',
      orgNameHi: 'नगर निगम गोरखपुर',
      certificateTitleEn: 'OFFICIAL PET LICENSE CERTIFICATE',
      certificateTitleHi: 'कुत्तों के पंजीकरण के लिए अधिकृत पत्र',
      dateLabel: 'दिनांक:',
      photoPlaceholder: ' पशु की तस्वीर',
      declaration: <>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।  <b>/</b> I declare that the information provided above is true to the best of my knowledge.</>,
      applicantSignature: 'आवेदक के हस्ताक्षर / Applicant\'s Signature',
      issuingAuthority: 'जारीकर्ता अधिकारी / Issuing Authority',
      qrCodeLabel: 'क्यूआर कोड',
      officialStamp: 'आधिकारिक मुहर',
      downloadPdfButton: 'पीडीएफ डाउनलोड करें',
      provisionalNotice: 'अस्थायी लाइसेंस - 30 दिनों के लिए वैध',
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
    }
  };

  const currentCertText = certificateText[languageType] || certificateText.en;

  return (
    <div className="user-dl-certificate-view">
      <div id={`pdf-${lic._id}`} className="pdf-layout">
        <div className="pdf-border">
          {/* Provisional notice */}
          {lic.isProvisional && (
            <div className="pdf-provisional-notice">
              <AlertCircle size={20} />
              <span>{currentCertText.provisionalNotice}</span>
            </div>
          )}

          <div className="pdf-header">
            <div className="pdf-header-left">
              <div className="pdf-logo-icon">
                <img src="./logo.webp" alt="Organization Logo"></img>
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
                  <img src={lic.pet.avatarUrl} alt="Dog" className="pdf-photo" />
                ) : (
                  <div className="pdf-photo-placeholder">{currentCertText.photoPlaceholder}</div> 
                )}
              </div>
            </div>

            {/* Vet details section for provisional licenses */}
            {lic.isProvisional && (
              <div className="pdf-details-section">
                <div className="pdf-section-title">{currentCertText.vetDetailsTitle}</div>
                <div className="pdf-details-table">
                  <div className="pdf-details-row">
                    <div className="pdf-details-label">{currentCertText.vetNameLabel}</div>
                    <div className="pdf-details-value">{VET_DETAILS.name}</div>
                  </div>
                  <div className="pdf-details-row">
                    <div className="pdf-details-label">{currentCertText.vetClinicLabel}</div>
                    <div className="pdf-details-value">{VET_DETAILS.clinic}</div>
                  </div>
                  <div className="pdf-details-row">
                    <div className="pdf-details-label">{currentCertText.vetPhoneLabel}</div>
                    <div className="pdf-details-value">{VET_DETAILS.phone}</div>
                  </div>
                  <div className="pdf-details-row">
                    <div className="pdf-details-label">{currentCertText.vetAddressLabel}</div>
                    <div className="pdf-details-value">{VET_DETAILS.address}</div>
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
                  <div className="pdf-details-row">
                    <div className="pdf-details-label">पशु का नाम / Pet Name</div>
                    <div className="pdf-details-value">: {lic.pet?.name || "N/A"}</div>
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
                    <div className="pdf-details-label">रंग / Color</div>
                    <div className="pdf-details-value">: {lic.pet?.color || "N/A"}</div>
                  </div>
                  <div className="pdf-details-row">
                    <div className="pdf-details-label">आयु / Age</div>
                    <div className="pdf-details-value">: {lic.pet?.age || "N/A"}</div>
                  </div>
                  <div className="pdf-details-row">
                    <div className="pdf-details-label">टीकाकरण की तारीख / Vaccination Date</div>
                    <div className="pdf-details-value">: {formatDate(lic.pet?.dateOfVaccination)}</div>
                  </div>
                </div>
                <div className="pdf-details-column-right">
                  <div className="pdf-details-row">
                    <div className="pdf-details-label">लिंग / Gender</div>
                    <div className="pdf-details-value">: {lic.pet?.sex || "N/A"}</div>
                  </div>
                  <div className="pdf-details-row">
                    <div className="pdf-details-label">टीकाकरण / Vaccinated</div>
                    <div className="pdf-details-value">
                      : {lic.pet?.dateOfVaccination ? ' हां / Yes' : ' नहीं / No'}
                    </div>
                  </div>
                  {lic.pet?.vaccinationProofUrl && (
                    <div className="pdf-details-row">
                      <div className="pdf-details-label">टीकाकरण प्रमाणपत्र / Vaccination Certificate</div>
                      <div className="pdf-details-value">
                        <a
                          href={lic.pet.vaccinationProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="pdf-vaccine-img"
                        >View </a>
                      </div>
                    </div>
                  )}
                  <div className="pdf-details-row">
                    <div className="pdf-details-label">माइक्रोचिप / Microchipped</div>
                    <div className="pdf-details-value">
                      : No
                    </div>
                  </div>
                  <div className="pdf-details-row">
                    <div className="pdf-details-label">अगला टीकाकरण / Next Vaccination</div>
                    <div className="pdf-details-value">: {formatDate(lic.pet?.dueVaccination)}</div>
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
                  <div className="pdf-details-label">
                    {`जानवरों की संख्या / No. of ${getAnimalLabel(lic.animalType)}s`}
                  </div>
                  <div className="pdf-details-value">:{lic.numberOfAnimals || "N/A"}</div>
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
                <div className="pdf-qr-placeholder"></div>
                <p>{currentCertText.qrCodeLabel}</p>
              </div>
              <div className="pdf-stamp">
                <div className="pdf-stamp-placeholder">
                  <p>{currentCertText.officialStamp}</p>
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

      {/* Download button for approved and provisional licenses */}
      {(lic.status === 'approved' || lic.isProvisional) && (
        <button
          className="user-dl-button user-dl-certificate-download-btn"
          onClick={(e) => {
            e.stopPropagation();
            downloadPDF(lic._id, lic.pet?.name);
          }}
        >
          <Download size={18} />
          <span>{currentCertText.downloadPdfButton}</span>
        </button>
      )}

      {/* Status notices */}
      {lic.status === 'pending' && (
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

  const backend = "https://dog-registration.onrender.com";
  const token = localStorage.getItem('token');

  const textContent = {
    en: {
      pageTitle: 'My Dog License Applications',
      filterLabel: 'Filter by:',
      filterButtons: {
        all: 'All',
        approved: 'Approved',
        pending: 'Pending',
        rejected: 'Rejected',
        provisional: 'Provisional'
      },
      backToList: 'Back to List',
      loadingData: 'Loading license data…',
      tableHeaders: {
        regNo: 'Reg. No',
        owner: 'Owner',
        dogName: 'Pet Name',
        status: 'Status',
        appliedDate: 'Applied Date',
        view: 'View'
      },
      tableCellView: 'View',
      emptyState: {
        noApplications: 'You have not applied for any licenses yet.',
        noFiltered: (status) => `No "${status}" licenses found.`,
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
        rejected: 'अस्वीकृत',
        provisional: 'अस्थायी'
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
      tableCellView: 'देखें',
      emptyState: {
        noApplications: 'आपने अभी तक किसी भी लाइसेंस के लिए आवेदन नहीं किया है।',
        noFiltered: (status) => `कोई भी "${status}" लाइसेंस नहीं मिला।`,
        applyButton: 'लाइसेंस के लिए आवेदन करें'
      }
    }
  };

  const currentText = textContent[languageType] || textContent.en;

  const getFilterButtonText = (statusKey) => {
    return currentText.filterButtons[statusKey] || statusKey;
  };

  const getTranslatedFilterStatus = (status) => {
    const statusKey = Object.keys(textContent.en.filterButtons).find(key => 
      textContent.en.filterButtons[key].toLowerCase() === status.toLowerCase()
    );
    return statusKey ? getFilterButtonText(statusKey) : status;
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
          return res.json().then(err => { 
            throw new Error(err.message || 'Failed to fetch licenses'); 
          });
        }
        return res.json();
      })
      .then(data => {
        const sortedLicenses = (data || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLicenses(sortedLicenses);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching licenses:", error);
        setLicenses([]);
        setLoading(false);
      });
  }, [backend, token]);

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

    setTimeout(() => {
      html2pdf().from(element).set(opt).save().then(() => {
        element.classList.remove('force-desktop-pdf-layout');
      }).catch(error => {
        console.error("PDF generation failed:", error);
        element.classList.remove('force-desktop-pdf-layout');
      });
    }, 50);
  };

  const selectedLicense = licenses.find(lic => lic._id === expandedLicenseId);

const filteredLicenses = licenses.filter(license => {
  if (filterStatus === 'All') return true;
  
  // For provisional filter, still check the isProvisional flag
  if (filterStatus.toLowerCase() === 'provisional') {
    return license.isProvisional;
  }
  
  // For all other filters, check the main status
  return license.status.toLowerCase() === filterStatus.toLowerCase();
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
                  className={`user-dl-filter-btn user-dl-filter-${key.toLowerCase()} ${
                    filterStatus.toLowerCase() === key.toLowerCase() ? 'user-dl-filter-active' : ''
                  }`}
                  onClick={() => setFilterStatus(textContent.en.filterButtons[key])}
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
              onClick={() => toggleExpanded(expandedLicenseId)}
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
                  {!isMobile && <th>{currentText.tableHeaders.dogName}</th>}
                  <th>{currentText.tableHeaders.status}</th>
                  {!isMobile && <th>{currentText.tableHeaders.appliedDate}</th>}
                  <th>{currentText.tableHeaders.view}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.map(license => (
                  <tr key={license._id} onClick={() => toggleExpanded(license._id)}>
                    <td>
                      <div className="user-dl-cell user-dl-reg-no-cell">
                        {!isMobile && <User size={16} className="user-dl-cell-icon" />} 
                        {license.license_Id || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="user-dl-cell user-dl-owner-cell">
                        {!isMobile && <User size={16} className="user-dl-cell-icon" />} 
                        {license.fullName}
                      </div>
                    </td>
                    {!isMobile && (
                      <td>
                        <div className="user-dl-cell user-dl-dog-cell">
                          {!isMobile && <Dog size={16} className="user-dl-cell-icon" />} 
                          {license.pet?.name || "N/A"}
                        </div>
                      </td>
                    )}
                <td>
  <div className="user-dl-cell user-dl-status-cell">
    <UserStatusBadge 
      status={license.status} 
      isMobile={isMobile} 
      languageType={languageType} 
    />
    {/* {license.isProvisional && (
      <span className="user-dl-provisional-tag">
        <Clock size={12} /> Provisional
      </span>
    )} */}
  </div>
</td>
                    {!isMobile && (
                      <td>
                        <div className="user-dl-cell user-dl-date-cell">
                          <Calendar size={16} className="user-dl-cell-icon" /> 
                          {formatDate(license.createdAt)}
                        </div>
                      </td>
                    )}
                    <td>
                      <button
                        className="user-dl-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(license._id);
                        }}
                      >
                        <Eye size={16} className="user-dl-btn-icon" /> 
                        {!isMobile && currentText.tableCellView}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="user-dl-details-view">
            {renderCertificateView(selectedLicense, isMobile, downloadPDF, languageType)}
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
              : currentText.emptyState.noFiltered(getTranslatedFilterStatus(filterStatus))
            }
          </p>
          {filterStatus === 'All' && (
            <button 
              className="user-dl-new-application-btn" 
              onClick={() => alert('Navigate to application form')}
            >
              {currentText.emptyState.applyButton}
            </button>
          )}
        </div>
      )}
    </main>
  );
};

export default DogLicenseDownload;