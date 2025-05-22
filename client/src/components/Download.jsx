import React, { useEffect, useState, useRef } from "react";
import html2pdf from 'html2pdf.js';
import './styles/Download.css';
import {
  Download,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  User,
  Dog,
  Eye,
  ChevronLeft,
  ChevronDown, // For dropdown indicator
  Filter // For mobile filter button
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
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
  const statusKey = status ? status.toLowerCase() : 'default';

  let badgeClass = "user-dl-status-badge";
  let Icon = AlertCircle;
  // let iconColor = 'var(--user-dl-warning)'; // Icon color will be inherited from badge text color for simplicity

  switch(statusKey) {
    case 'approved':
      badgeClass += " user-dl-status-approved";
      Icon = CheckCircle;
      // iconColor = 'var(--user-dl-success)';
      break;
    case 'pending':
      badgeClass += " user-dl-status-pending";
      Icon = Clock;
      // iconColor = 'var(--user-dl-warning)';
      break;
    case 'rejected':
      badgeClass += " user-dl-status-rejected";
      Icon = XCircle;
      // iconColor = 'var(--user-dl-danger)';
      break;
    case 'provisional':
      badgeClass += " user-dl-status-provisional";
      Icon = Clock;
      // iconColor = 'var(--user-dl-warning)';
      break;
    default:
      badgeClass += " user-dl-status-default";
      Icon = AlertCircle;
      // iconColor = 'var(--user-dl-dark)';
  }

  const displayStatusText = currentStatusText[statusKey] || status;

  return (
    <span className={badgeClass}>
      <Icon size={isMobile ? 14 : 16} /> {/* Removed inline style for color */}
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

const renderCertificateView = (lic, downloadPDF, languageType = 'en') => {
  const currentDateOnCertificate = new Date().toLocaleDateString('en-GB'); 
  
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
      rulesTitle: 'Rules and Regulations / नियम और कानून',
      rules: [
        'Pet owners must ensure their animals are vaccinated against rabies annually. / पालतू पशु मालिकों को यह सुनिश्चित करना होगा कि उनके जानवरों को सालाना रेबीज का टीका लगाया जाए।',
        'Pets must be kept on a leash in public areas. / सार्वजनिक स्थानों पर पालतू जानवरों को पट्टा (लीश) लगाकर रखना चाहिए।',
        'Owners are responsible for cleaning up after their pets. / मालिकों को अपने पालतू जानवरों के बाद गंदगी साफ करने की जिम्मेदारी है।',
        'No person shall abandon any pet animal in any public place. / कोई भी व्यक्ति किसी भी पालतू जानवर को किसी भी सार्वजनिक स्थान पर नहीं छोड़ेगा।',
        'All pets must be registered with the local municipal authority. / सभी पालतू जानवरों को स्थानीय नगर पालिका प्राधिकरण के साथ पंजीकृत होना चाहिए।',
        'The license must be renewed annually. / लाइसेंस का नवीनीकरण सालाना किया जाना चाहिए।',
        'Any change in ownership or address must be reported to the authority. / स्वामित्व या पते में कोई भी बदलाव प्राधिकरण को सूचित किया जाना चाहिए।',
        'Keeping exotic or wild animals without proper authorization is prohibited. / उचित प्राधिकरण के बिना विदेशी या जंगली जानवरों को रखना प्रतिबंधित है।',
        'Cruelty to animals is strictly prohibited and punishable by law. / जानवरों के प्रति क्रूरता सख्त वर्जित है और कानून द्वारा दंडनीय है।',
        'Noise pollution caused by pets, especially barking, must be controlled. / पालतू जानवरों द्वारा उत्पन्न ध्वनि प्रदूषण, विशेष रूप से भौंकना, नियंत्रित किया जाना चाहिए।',
      ]
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
      rulesTitle: 'नियम और कानून / Rules and Regulations',
      rules: [
        'पालतू पशु मालिकों को यह सुनिश्चित करना होगा कि उनके जानवरों को सालाना रेबीज का टीका लगाया जाए। / Pet owners must ensure their animals are vaccinated against rabies annually.',
        'सार्वजनिक स्थानों पर पालतू जानवरों को पट्टा (लीश) लगाकर रखना चाहिए। / Pets must be kept on a leash in public areas.',
        'मालिकों को अपने पालतू जानवरों के बाद गंदगी साफ करने की जिम्मेदारी है। / Owners are responsible for cleaning up after their pets.',
        'कोई भी व्यक्ति किसी भी पालतू जानवर को किसी भी सार्वजनिक स्थान पर नहीं छोड़ेगा। / No person shall abandon any pet animal in any public place.',
        'सभी पालतू जानवरों को स्थानीय नगर पालिका प्राधिकरण के साथ पंजीकृत होना चाहिए। / All pets must be registered with the local municipal authority.',
        'लाइसेंस का नवीनीकरण सालाना किया जाना चाहिए। / The license must be renewed annually.',
        'स्वामित्व या पते में कोई भी बदलाव प्राधिकरण को सूचित किया जाना चाहिए। / Any change in ownership or address must be reported to the authority.',
        'उचित प्राधिकरण के बिना विदेशी या जंगली जानवरों को रखना प्रतिबंधित है। / Keeping exotic or wild animals without proper authorization is prohibited.',
        'जानवरों के प्रति क्रूरता सख्त वर्जित है और कानून द्वारा दंडनीय है। / Cruelty to animals is strictly prohibited and punishable by law.',
        'पालतू जानवरों द्वारा उत्पन्न ध्वनि प्रदूषण, विशेष रूप से भौंकना, नियंत्रित किया जाना चाहिए। / Noise pollution caused by pets, especially barking, must be controlled.',
      ]
    }
  };

  const currentCertText = certificateText[languageType] || certificateText.en;

  const certTitleEn = lic.isProvisional ? currentCertText.provisionalCertificateTitleEn : currentCertText.certificateTitleEn;
  const certTitleHi = lic.isProvisional ? currentCertText.provisionalCertificateTitleHi : currentCertText.certificateTitleHi;

  return (
    <div className="user-dl-certificate-display-area"> 
      <div id={`pdf-${lic._id}`} className="user-dl-pdf-layout">
        <div className="user-dl-outer-pdf-border">
          <div className="user-dl-pdf-border">
            <div className="user-dl-pdf-header">
              <div className="user-dl-pdf-header-left">
                <div className="user-dl-pdf-logo-icon">
                  <img src="/logo.webp" alt="Organization Logo" onError={(e) => e.target.style.display='none'} />
                </div>
                <div className="user-dl-pdf-org-name">
                  <h3>{currentCertText.orgNameEn}</h3>
                  <h4>{currentCertText.orgNameHi}</h4>
                </div>
              </div>
              <div className="user-dl-pdf-header-right">
                 <div className="user-dl-pdf-logo-icon">
                  <img src="/up.webp" alt="State Logo" onError={(e) => e.target.style.display='none'} />
                </div>
              </div>
            </div>

            <div className="user-dl-pdf-certificate-title">
              <h2>{certTitleEn}</h2>
              <h3>{certTitleHi}</h3>
            </div>
            
            <div className="user-dl-pdf-body">
              <div className="user-dl-pdf-photo-section">
                <div className="user-dl-pdf-info-block">
                  <div className="user-dl-pdf-info-row"><div className="user-dl-pdf-info-label">नाम / Name</div><div className="user-dl-pdf-info-value">: {lic.fullName || "N/A"}</div></div>
                  <div className="user-dl-pdf-info-row"><div className="user-dl-pdf-info-label">पंजीकरण संख्या / Registration No.</div><div className="user-dl-pdf-info-value">: {lic.license_Id || "N/A"}</div></div>
                  <div className="user-dl-pdf-info-row"><div className="user-dl-pdf-info-label">जारी दिनांक / Issue Date</div><div className="user-dl-pdf-info-value">: {formatDate(lic.createdAt)}</div></div>
                  <div className="user-dl-pdf-info-row"><div className="user-dl-pdf-info-label">समाप्ति तिथि / Expiry Date</div><div className="user-dl-pdf-info-value">: {expiryDate}</div></div>
                </div>
                <div className="user-dl-pdf-photo-box">
                  {lic.pet?.avatarUrl ? (
                    <img src={lic.pet.avatarUrl} alt="Pet" className="user-dl-pdf-photo" onError={(e) => e.target.src='https://placehold.co/100x120/e0e0e0/757575?text=No+Image'} />
                  ) : (
                    <div className="user-dl-pdf-photo-placeholder">{currentCertText.photoPlaceholder}</div>
                  )}
                </div>
              </div>

              {lic.isProvisional && (
                <div className="user-dl-pdf-details-section user-dl-pdf-vet-details-section">
                  <div className="user-dl-pdf-section-title">{currentCertText.vetDetailsTitle}</div>
                  <div className="user-dl-pdf-details-columns">
                    <div className="user-dl-pdf-details-column-left">
                      <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">{currentCertText.vetNameLabel}</div><div className="user-dl-pdf-details-value">{VET_DETAILS.name}</div></div>
                      <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">{currentCertText.vetPhoneLabel}</div><div className="user-dl-pdf-details-value">{VET_DETAILS.phone}</div></div>
                    </div>
                    <div className="user-dl-pdf-details-column-right">
                      <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">{currentCertText.vetClinicLabel}</div><div className="user-dl-pdf-details-value">{VET_DETAILS.clinic}</div></div>
                      <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">{currentCertText.vetAddressLabel}</div><div className="user-dl-pdf-details-value">{VET_DETAILS.address}</div></div>
                    </div>
                  </div>
                  <div className="user-dl-pdf-provisional-instructions">
                    <p>{currentCertText.provisionalInstructions}</p>
                  </div>
                </div>
              )}

              <div className="user-dl-pdf-details-section user-dl-pdf-pet-details-section">
                <div className="user-dl-pdf-section-title">पशु का विवरण / Pet Details</div>
                <div className="user-dl-pdf-details-columns">
                  <div className="user-dl-pdf-details-column-left">
                    <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">{currentCertText.animalTypeLabelBilingual}</div><div className="user-dl-pdf-details-value">: {getAnimalLabel(lic.animalType) || "N/A"}</div></div>
                    <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">पशु का नाम / Pet Name</div><div className="user-dl-pdf-details-value">: {lic.pet?.name || "N/A"}</div></div>
                    <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">नस्ल / Breed</div><div className="user-dl-pdf-details-value">: {lic.pet?.breed || "N/A"}</div></div>
                    <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">वर्ग / Category</div><div className="user-dl-pdf-details-value">: {lic.pet?.category || "N/A"}</div></div>
                    <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">रंग / Color</div><div className="user-dl-pdf-details-value">: {lic.pet?.color || "N/A"}</div></div>
                    <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">आयु / Age</div><div className="user-dl-pdf-details-value">: {lic.pet?.age || "N/A"}</div></div>
                  </div>
                  <div className="user-dl-pdf-details-column-right">
                    <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">लिंग / Gender</div><div className="user-dl-pdf-details-value">: {lic.pet?.sex || "N/A"}</div></div>
                    <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">टीकाकरण की तारीख / Vaccination Date</div><div className="user-dl-pdf-details-value">: {formatDate(lic.pet?.dateOfVaccination)}</div></div>
                    <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">टीकाकरण / Vaccinated</div><div className="user-dl-pdf-details-value">: {lic.pet?.dateOfVaccination ? (languageType === 'hi' ? ' हां' : ' Yes') : (languageType === 'hi' ? ' नहीं' : ' No')}</div></div>
                    {lic.pet?.vaccinationProofUrl && (<div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">टीकाकरण प्रमाणपत्र / Vaccination Certificate</div><div className="user-dl-pdf-details-value"><a href={lic.pet.vaccinationProofUrl} target="_blank" rel="noreferrer noopener" className="user-dl-pdf-vaccine-link">View</a></div></div>)}
                    <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">माइक्रोचिप / Microchipped</div><div className="user-dl-pdf-details-value">: {languageType === 'hi' ? 'नहीं' : 'No'}</div></div>
                    <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">अगला टीकाकरण / Next Vaccination</div><div className="user-dl-pdf-details-value">: {formatDate(lic.pet?.dueVaccination)}</div></div>
                  </div>
                </div>
              </div>

              <div className="user-dl-pdf-details-section user-dl-pdf-owner-details-section">
                <div className="user-dl-pdf-section-title">मालिक का विवरण / Owner Details</div>
                <div className="user-dl-pdf-owner-details-table">
                  <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">पता / Address</div><div className="user-dl-pdf-details-value">: {`${lic.address?.streetName || ""}, ${lic.address?.city || ""}, ${lic.address?.state || ""} - ${lic.address?.pinCode || "N/A"}`}</div></div>
                  <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">फोन नंबर / Phone Number</div><div className="user-dl-pdf-details-value">: {lic.phoneNumber || "N/A"}</div></div>
                  <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">{`जानवरों की संख्या / No. of ${getAnimalLabel(lic.animalType)}s`}</div><div className="user-dl-pdf-details-value">:{lic.numberOfAnimals || "N/A"}</div></div>
                  <div className="user-dl-pdf-details-row"><div className="user-dl-pdf-details-label">घर का क्षेत्रफल / House Area</div><div className="user-dl-pdf-details-value">: {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}</div></div>
                </div>
              </div>

              <div className="user-dl-pdf-declaration"><p>{currentCertText.declaration}</p></div>
            </div>

            <div className="user-dl-pdf-signatures">
              <div className="user-dl-pdf-signature-block"><div className="user-dl-pdf-signature-line"></div><p>{currentCertText.applicantSignature}</p></div>
              <div className="user-dl-pdf-signature-block"><div className="user-dl-pdf-signature-line"></div><p>{currentCertText.issuingAuthority}</p></div>
            </div>

            <div className="user-dl-pdf-footer-bottom">
              <div className="user-dl-pdf-qr-code-area">
                <div className="user-dl-pdf-qr-placeholder"></div>
                <p>{currentCertText.qrCodeLabel}</p>
              </div>
              {lic.isProvisional && (
              <div className="user-dl-pdf-provisional-notice-banner">
                <AlertCircle size={14} /> 
                <span>{currentCertText.provisionalNoticeBanner}</span>
              </div>
            )}
              <div className="user-dl-pdf-stamp-area">
                <div className="user-dl-pdf-stamp-placeholder"><p>{currentCertText.officialStamp}</p></div>
              </div>
            </div>
            <div className="user-dl-pdf-contact-footer">
              1234  |  info@awbi.org  |  www.awbi.org | <span>{currentCertText.dateLabel} {currentDateOnCertificate}</span>
            </div>
          </div> 
        </div> 

        {/* New section for Rules and Regulations - Second Page */}
        <div className="user-dl-outer-pdf-border user-dl-pdf-rules-page">
          <div className="user-dl-pdf-border">
            <div className="user-dl-pdf-header">
              <div className="user-dl-pdf-header-left">
                <div className="user-dl-pdf-logo-icon">
                  <img src="/logo.webp" alt="Organization Logo" onError={(e) => e.target.style.display='none'} />
                </div>
                <div className="user-dl-pdf-org-name">
                  <h3>{currentCertText.orgNameEn}</h3>
                  <h4>{currentCertText.orgNameHi}</h4>
                </div>
              </div>
              <div className="user-dl-pdf-header-right">
                 <div className="user-dl-pdf-logo-icon">
                  <img src="/up.webp" alt="State Logo" onError={(e) => e.target.style.display='none'} />
                </div>
              </div>
            </div>
            <div className="user-dl-pdf-rules-box">
              <h2 className="user-dl-pdf-rules-title">{currentCertText.rulesTitle}</h2>
              <ul className="user-dl-pdf-rules-list">
                {currentCertText.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
            <div className="user-dl-pdf-contact-footer user-dl-pdf-rules-footer">
              1234  |  info@awbi.org  |  www.awbi.org | <span>{currentCertText.dateLabel} {currentDateOnCertificate}</span>
            </div>
          </div>
        </div>
      </div> 

      {(lic.status === 'approved' || lic.isProvisional) && (
        <button
          className="user-dl-action-button user-dl-certificate-download-btn"
          onClick={(e) => {
            e.stopPropagation();
            downloadPDF(lic._id, lic.pet?.name || getAnimalLabel(lic.animalType));
          }}
        >
          <Download size={18} />
          <span>{currentCertText.downloadPdfButton}</span>
        </button>
      )}

      {lic.status === 'pending' && !lic.isProvisional && (
        <div className="user-dl-notice user-dl-pending-notice">
          <AlertCircle size={18} />
          <p>{currentCertText.pendingNotice}</p>
        </div>
      )}

      {lic.status === 'rejected' && (
        <div className="user-dl-notice user-dl-rejected-notice">
          <XCircle size={18} />
          <div>
            <p>{currentCertText.rejectedNotice(lic.rejectionDate)}</p>
            {lic.rejectionReason && (
              <div className="user-dl-rejection-reason-box">
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
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);


  const backend = "https://dog-registration.onrender.com";
  const token = localStorage.getItem('token');

  const textContent = {
    en: {
      pageTitle: 'My Pet License Applications',
      filterLabel: 'Filter by:',
      filterDropdownLabel: 'Filter Status',
      filterButtons: { all: 'All', approved: 'Approved', pending: 'Pending', rejected: 'Rejected', provisional: 'Provisional' },
      backToList: 'Back to Applications List',
      loadingData: 'Loading license data…',
      tableHeaders: { regNo: 'Reg. No', owner: 'Owner', petName: 'Pet Name', animalType: 'Animal Type', status: 'Status', appliedDate: 'Applied Date', view: 'View/Download' },
      emptyState: { noApplications: 'You have not applied for any licenses yet.', noFiltered: (status) => `No "${status}" licenses found.`, applyButton: 'Apply for a New License' }
    },
    hi: {
      pageTitle: 'मेरे पालतू पशु लाइसेंस आवेदन',
      filterLabel: 'फ़िल्टर करें:',
      filterDropdownLabel: 'फ़िल्टर स्थिति',
      filterButtons: { all: 'सभी', approved: 'स्वीकृत', pending: 'लंबित', rejected: 'अस्वीकृत', provisional: 'अस्थायी' },
      backToList: 'आवेदन सूची पर वापस जाएं',
      loadingData: 'लाइसेंस डेटा लोड हो रहा है…',
      tableHeaders: { regNo: 'पंजीकरण संख्या', owner: 'मालिक', petName: 'पशु का नाम', animalType: 'पशु का प्रकार', status: 'स्थिति', appliedDate: 'आवेदन की तिथि', view: 'देखें/डाउनलोड करें' },
      emptyState: { noApplications: 'आपने अभी तक किसी भी लाइसेंस के लिए आवेदन नहीं किया है।', noFiltered: (status) => `कोई भी "${status}" लाइसेंस नहीं मिला।`, applyButton: 'नए लाइसेंस के लिए आवेदन करें' }
    }
  };
  const currentText = textContent[languageType] || textContent.en;

  const getFilterButtonText = (statusKey) => currentText.filterButtons[statusKey] || statusKey;
  
  const getTranslatedFilterStatus = (englishStatus) => {
    const statusKey = Object.keys(textContent.en.filterButtons).find(key => textContent.en.filterButtons[key] === englishStatus);
    if (statusKey) {
      return currentText.filterButtons[statusKey] || englishStatus;
    }
    return englishStatus;
  };


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterDropdownRef]);


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
        setLicenses([]);
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
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    setTimeout(() => {
      html2pdf().from(element).set(opt).save()
        .catch(error => console.error("PDF generation failed:", error));
    }, 100);
  };
  
  const selectedLicense = licenses.find(lic => lic._id === expandedLicenseId);

  const filteredLicenses = licenses.filter(license => {
    if (filterStatus === 'All') return true;
    if (filterStatus.toLowerCase() === 'provisional') {
      return license.isProvisional;
    }
    return license.status && license.status.toLowerCase() === filterStatus.toLowerCase();
  });


  if (loading) {
    return (
      <main className="user-dl-page-container">
        <div className="user-dl-loading-state">
          <div className="user-dl-spinner-animation"></div>
          <p className="user-dl-loading-text">{currentText.loadingData}</p>
        </div>
      </main>
    );
  }
  
  if (selectedLicense) {
    return (
      <main className="user-dl-page-container user-dl-certificate-focused-view">
        <header className="user-dl-page-header user-dl-certificate-view-header">
          <div className="user-dl-back-navigation">
            <button
              className="user-dl-back-button"
              onClick={() => toggleExpanded(selectedLicense._id)}
            >
              <ChevronLeft size={isMobile ? 20 : 24} />
              {currentText.backToList}
            </button>
          </div>
        </header>
        {renderCertificateView(selectedLicense, downloadPDF, languageType)}
      </main>
    );
  }

  return (
    <main className="user-dl-page-container">
      <header className="user-dl-page-header">
        <h1 className="user-dl-main-title">{currentText.pageTitle}</h1>
        
        {isMobile ? (
          <div className="user-dl-filter-dropdown-container" ref={filterDropdownRef}>
            <button 
              className="user-dl-filter-dropdown-button" 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter size={18} />
              <span>{currentText.filterDropdownLabel}: {getTranslatedFilterStatus(filterStatus)}</span>
              <ChevronDown size={16} className={`user-dl-dropdown-chevron ${showFilterDropdown ? 'user-dl-dropdown-chevron-open' : ''}`} />
            </button>
            {showFilterDropdown && (
              <ul className="user-dl-filter-dropdown-list">
                {Object.keys(currentText.filterButtons).map(key => (
                  <li 
                    key={key} 
                    onClick={() => {
                      setFilterStatus(textContent.en.filterButtons[key]);
                      setShowFilterDropdown(false);
                    }}
                    className={filterStatus.toLowerCase() === textContent.en.filterButtons[key].toLowerCase() ? 'user-dl-dropdown-item-active' : ''}
                  >
                    {getFilterButtonText(key)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="user-dl-filter-controls">
            <span className="user-dl-filter-label-text">{currentText.filterLabel}</span>
            {Object.keys(currentText.filterButtons).map(key => (
              <button
                key={key}
                className={`user-dl-filter-button user-dl-filter-style-${key.toLowerCase()} ${
                  filterStatus.toLowerCase() === textContent.en.filterButtons[key].toLowerCase() ? 'user-dl-filter-active' : ''
                }`}
                onClick={() => setFilterStatus(textContent.en.filterButtons[key])}
              >
                {getFilterButtonText(key)}
              </button>
            ))}
          </div>
        )}
      </header>

      {filteredLicenses.length > 0 ? (
        <div className="user-dl-table-container">
          <table className="user-dl-data-table">
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
                <tr key={license._id} onClick={() => toggleExpanded(license._id)} className="user-dl-table-row-clickable">
                  <td><div className="user-dl-table-cell-content">{!isMobile && <FileText size={16} className="user-dl-cell-icon-style" />} {license.license_Id || "N/A"}</div></td>
                  <td><div className="user-dl-table-cell-content">{!isMobile && <User size={16} className="user-dl-cell-icon-style" />} {license.fullName}</div></td>
                  {!isMobile && <td><div className="user-dl-table-cell-content"><Dog size={16} className="user-dl-cell-icon-style" /> {license.pet?.name || "N/A"}</div></td>}
                  {!isMobile && <td><div className="user-dl-table-cell-content">{getAnimalLabel(license.animalType) || "N/A"}</div></td>}
                  <td><div className="user-dl-table-cell-content"><UserStatusBadge status={license.isProvisional ? 'provisional' : license.status} isMobile={isMobile} languageType={languageType} /></div></td>
                  {!isMobile && <td><div className="user-dl-table-cell-content"><Calendar size={16} className="user-dl-cell-icon-style" /> {formatDate(license.createdAt)}</div></td>}
                  {!isMobile && (
                    <td>
                      <button
                        className="user-dl-table-view-button"
                        onClick={(e) => { e.stopPropagation(); toggleExpanded(license._id); }}
                      >
                        <Eye size={16} className="user-dl-button-icon-style" /> 
                         <span>{currentText.tableHeaders.view.split('/')[0]}</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="user-dl-empty-data-state">
          <div className="user-dl-empty-state-icon"><FileText size={48} /></div>
          <p className="user-dl-no-data-text">
            {filterStatus === 'All' ? currentText.emptyState.noApplications : currentText.emptyState.noFiltered(getTranslatedFilterStatus(filterStatus))}
          </p>
          {filterStatus === 'All' && licenses.length === 0 &&
            <button className="user-dl-apply-new-button" onClick={() => alert('Navigate to application form') /* Replace with actual navigation */}>
              {currentText.emptyState.applyButton}
            </button>
          }
        </div>
      )}
    </main>
  );
};

export default DogLicenseDownload;