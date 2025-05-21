import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import './styles/RenewRegistration.css';
import { CheckCircle, AlertCircle, Calendar, FileText, PawPrint, User, Eye, ChevronLeft, Download, XCircle } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
};

const StatusBadge = ({ status, isMobile, languageType = 'en' }) => {
  const statusText = {
    en: {
      approved: 'Approved',
      renewal_pending: 'Renewal Requested', 
      pending: 'Pending Review', 
      rejected: 'Rejected'
    },
    hi: {
      approved: 'स्वीकृत',
      renewal_pending: 'नवीनीकरण अनुरोधित', 
      pending: 'समीक्षाधीन', 
      rejected: 'अस्वीकृत'
    }
  };

  const currentStatusText = statusText[languageType] || statusText.en;
  const lowerStatus = status.toLowerCase();

  let badgeClass = "rr-status-badge";
  let Icon = AlertCircle;
  let iconColor = 'var(--rr-warning)';

  switch(lowerStatus) {
    case 'approved':
      badgeClass += " rr-status-approved";
      Icon = CheckCircle;
      iconColor = 'var(--rr-success)';
      break;
    case 'renewal_pending':
      badgeClass += " rr-status-pending"; 
      Icon = AlertCircle; 
      iconColor = 'var(--rr-warning)';
      break;
    case 'pending': 
      badgeClass += " rr-status-pending";
      Icon = AlertCircle;
      iconColor = 'var(--rr-warning)';
      break;
     case 'rejected':
      badgeClass += " rr-status-rejected";
      Icon = XCircle;
      iconColor = 'var(--rr-error)'; 
      break;
    default:
      badgeClass += " rr-status-default";
      Icon = AlertCircle;
      iconColor = 'var(--rr-dark)'; 
  }

  const displayStatusText = currentStatusText[lowerStatus] || status;

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
      default: return animalType;
    }
  };

// Pass currentText as an argument
const renderCertificateView = (lic, isMobile, downloadPDF, languageType = 'en', currentTextArg) => {
    const currentDate = new Date().toLocaleDateString('en-GB');

    const expiryDate = lic.expiryDate ? formatDate(lic.expiryDate) : 
                       lic.pet?.dateOfVaccination ? new Date(new Date(lic.pet.dateOfVaccination).setFullYear(new Date(lic.pet.dateOfVaccination).getFullYear() + 1)).toLocaleDateString('en-GB') 
                       : "N/A";

    // Use the passed currentTextArg
    const currentCertText = currentTextArg || { 
        // Default fallback if currentTextArg is not provided, though it should be
        orgNameEn: 'Nagar Nigam Gorakhpur',
        orgNameHi: 'नगर निगम गोरखपुर',
        certificateTitleEn: 'PET LICENSE CERTIFICATE',
        certificateTitleHi: 'पालतू पशु पंजीकरण प्रमाण पत्र',
        dateLabel: 'Date:',
        photoPlaceholder: 'Pet\'s Photo',
        declaration: <>I declare that the information provided above is true to the best of my knowledge. <b>/</b> मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।</>,
        applicantSignature: 'Applicant\'s Signature / आवेदक के हस्ताक्षर',
        issuingAuthority: 'Issuing Authority / जारीकर्ता अधिकारी',
        qrCodeLabel: 'QR Code',
        stampLabel: 'STAMP',
        downloadPdfButton: 'Download PDF',
        pendingNotice: <>Your application is under review. You will be able to download the license once approved.</>,
        rejectedNotice: (rejectionDate) => <>Your application has been rejected on {formatDate(rejectionDate)}.</>,
        reasonLabel: 'Reason:',
        contactSupport: <>Please contact support for more information.</>,
        animalTypeLabel: 'Animal Type / पशु का प्रकार',
        petNameLabel: 'Pet Name / पालतू जानवर का नाम',
        breedLabel: 'Breed / नस्ल',
        categoryLabel: 'Category / वर्ग',
        colorLabel: 'Color / रंग',
        ageLabel: 'Age / आयु',
        vaccinationDateLabel: 'Vaccination Date / टीकाकरण की तारीख',
        genderLabel: 'Gender / लिंग',
        vaccinatedLabel: 'Vaccinated / टीकाकरण',
        vaccinationCertificateLabel: 'Vaccination Certificate / टीकाकरण प्रमाणपत्र',
        microchippedLabel: 'Microchipped / माइक्रोचिप',
        nextVaccinationLabel: 'Next Vaccination / अगला टीकाकरण',
        ownerDetailsTitle: 'Owner Details / मालिक का विवरण',
        addressLabel: 'Address / पता',
        phoneNumberLabel: 'Phone Number / फोन नंबर',
        numberOfAnimalsLabel: `No. of ${getAnimalLabel(lic.animalType)}s / ${getAnimalLabel(lic.animalType)} की संख्या`,
        houseAreaLabel: 'House Area / घर का क्षेत्रफल',
        animalDetailsTitle: `${getAnimalLabel(lic.animalType)} Details / ${getAnimalLabel(lic.animalType)} का विवरण`,
    };


    return (
       <div className="rr-certificate-view">
         <div id={`pdf-${lic._id}`} className="pdf-layout">
           <div className="pdf-border">
             <div className="pdf-header">
               <div className="pdf-header-left">
                 <div className="pdf-logo-icon">
                    <img src="/logo.webp" alt="Organization Logo"/> 
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
                        <div className="pdf-info-label">{currentCertText.animalTypeLabel}</div>
                        <div className="pdf-info-value">: {getAnimalLabel(lic.animalType) || "N/A"}</div>
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
                     <img src={lic.pet.avatarUrl} alt="Pet" className="pdf-photo" />
                   ) : (
                     <div className="pdf-photo-placeholder">{currentCertText.photoPlaceholder}</div>
                   )}
                 </div>
               </div>

               <div className="pdf-details-section">
                 <div className="pdf-section-title">{currentCertText.animalDetailsTitle}</div>
                 <div className="pdf-details-columns">
                   <div className="pdf-details-column-left">
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.petNameLabel}</div>
                       <div className="pdf-details-value">: {lic.pet?.name || "N/A"}</div>
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.breedLabel}</div>
                       <div className="pdf-details-value">: {lic.pet?.breed || "N/A"}</div>
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.categoryLabel}</div>
                       <div className="pdf-details-value">: {lic.pet?.category || "N/A"}</div>
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.colorLabel}</div>
                       <div className="pdf-details-value">: {lic.pet?.color || "N/A"}</div>
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.ageLabel}</div>
                       <div className="pdf-details-value">: {lic.pet?.age || "N/A"}</div>
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.vaccinationDateLabel}</div>
                       <div className="pdf-details-value">: {formatDate(lic.pet?.dateOfVaccination)}</div>
                     </div>
                   </div>
                   <div className="pdf-details-column-right">
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.genderLabel}</div>
                       <div className="pdf-details-value">: {lic.pet?.sex || "N/A"}</div>
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.vaccinatedLabel}</div>
                       <div className="pdf-details-value">
                         : {lic.pet?.dateOfVaccination ? (languageType === 'hi' ? ' हाँ' : ' Yes') : (languageType === 'hi' ? ' नहीं' : ' No')}
                       </div>
                     </div>
                     {lic.pet?.vaccinationProofUrl && (
                       <div className="pdf-details-row">
                         <div className="pdf-details-label">{currentCertText.vaccinationCertificateLabel}</div>
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
                       <div className="pdf-details-label">{currentCertText.microchippedLabel}</div>
                       <div className="pdf-details-value">
                         : {languageType === 'hi' ? 'नहीं' : 'No'}
                       </div>
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.nextVaccinationLabel}</div>
                       <div className="pdf-details-value">: {formatDate(lic.pet?.dueVaccination)}</div>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="pdf-details-section">
                 <div className="pdf-section-title">{currentCertText.ownerDetailsTitle}</div>
                 <div className="pdf-details-table">
                   <div className="pdf-details-row">
                     <div className="pdf-details-label">{currentCertText.addressLabel}</div>
                     <div className="pdf-details-value">: {`${lic.address?.streetName || ""}, ${lic.address?.city || ""}, ${lic.address?.state || ""} - ${lic.address?.pinCode || "N/A"}`}</div>
                   </div>
                   <div className="pdf-details-row">
                     <div className="pdf-details-label">{currentCertText.phoneNumberLabel}</div>
                     <div className="pdf-details-value">: {lic.phoneNumber || "N/A"}</div>
                   </div>
                   <div className="pdf-details-row">
                     <div className="pdf-details-label">{currentCertText.numberOfAnimalsLabel}</div>
                     <div className="pdf-details-value">: {lic.numberOfAnimals || "N/A"}</div>
                   </div>
                   <div className="pdf-details-row">
                     <div className="pdf-details-label">{currentCertText.houseAreaLabel}</div>
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
                            <p>{currentCertText.stampLabel}</p>
                        </div>
                   </div>
               </div>
                <div className="pdf-contact-footer">
                    {lic.phoneNumber || "N/A"}  | 
                    info@example.org  |  
                    www.example.org 
                </div>
             </div>
           </div>
         </div>
          {lic.status === 'approved' && (
              <button
                className="rr-button rr-certificate-download-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadPDF(lic._id, lic.pet?.name || getAnimalLabel(lic.animalType));
                }}
              >
                <Download size={18} />
                <span>{currentCertText.downloadPdfButton}</span>
              </button>
            )}

            {lic.status === 'renewal_pending' && ( 
              <div className="rr-pending-notice">
                <AlertCircle size={18} />
                <p>{currentTextArg.successMessage1}</p> 
              </div>
            )}

            {lic.status === 'rejected' && (
            <div className="rr-rejected-notice">
              <XCircle size={18} />
              <div>
                <p>{currentCertText.rejectedNotice(lic.rejectionDate)}</p>
                {lic.rejectionReason && (
                  <div className="rr-rejection-reason">
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


const RenewRegistration = ({ languageType = 'en' }) => {
  const [successfulLicenses, setSuccessfulLicenses] = useState([]);
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [renewalStates, setRenewalStates] = useState({}); 
  const [listError, setListError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [viewingLicenseId, setViewingLicenseId] = useState(null);

  const backend = "https://dog-registration.onrender.com";
  const token = localStorage.getItem('token');

    const textContent = {
        en: {
            pageTitle: 'Renew Registration',
            backToList: 'Back to List',
            successMessage1: 'Your renewal request has been submitted for admin approval.',
            successMessage2: 'You will be notified once it\'s processed.',
            requestAnotherButton: 'Back to Licenses', 
            loadingLicenses: 'Loading your licenses…',
            listError: 'Error fetching your licenses. Please try again.',
            approvedLicensesTitle: 'Your Licenses',
            tableHeaders: {
                regNo: 'Reg. No',
                animalType: 'Animal Type',
                petName: 'Pet Name',
                appliedDate: 'Last Update', 
                status: 'Status',
                action: 'Action',
                view: 'View'
            },
            tableActions: {
                renew: 'Renew',
                submitting: 'Submitting...',
                view: 'View',
                renewalRequested: 'Renewal Requested'
            },
            emptyStateText: 'You have no licenses yet.',
            renewalConfirm: (licenseNumber) => `Are you sure you want to request renewal for license number ${licenseNumber}?`,
            // Certificate specific texts, ensure they match the structure used in renderCertificateView
            orgNameEn: 'Nagar Nigam Gorakhpur',
            orgNameHi: 'नगर निगम गोरखपुर',
            certificateTitleEn: 'PET LICENSE CERTIFICATE',
            certificateTitleHi: 'पालतू पशु पंजीकरण प्रमाण पत्र',
            dateLabel: 'Date:',
            photoPlaceholder: 'Pet\'s Photo',
            declaration: <>I declare that the information provided above is true to the best of my knowledge. <b>/</b> मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।</>,
            applicantSignature: 'Applicant\'s Signature / आवेदक के हस्ताक्षर',
            issuingAuthority: 'Issuing Authority / जारीकर्ता अधिकारी',
            qrCodeLabel: 'QR Code',
            stampLabel: 'STAMP',
            downloadPdfButton: 'Download PDF',
            pendingNotice: <>Your application is under review. You will be able to download the license once approved.</>, // This is a general pending, might need context
            rejectedNotice: (rejectionDate) => <>Your application has been rejected on {formatDate(rejectionDate)}.</>,
            reasonLabel: 'Reason:',
            contactSupport: <>Please contact support for more information.</>,
            animalTypeLabel: 'Animal Type / पशु का प्रकार',
            petNameLabel: 'Pet Name / पालतू जानवर का नाम',
            breedLabel: 'Breed / नस्ल',
            categoryLabel: 'Category / वर्ग',
            colorLabel: 'Color / रंग',
            ageLabel: 'Age / आयु',
            vaccinationDateLabel: 'Vaccination Date / टीकाकरण की तारीख',
            genderLabel: 'Gender / लिंग',
            vaccinatedLabel: 'Vaccinated / टीकाकरण',
            vaccinationCertificateLabel: 'Vaccination Certificate / टीकाकरण प्रमाणपत्र',
            microchippedLabel: 'Microchipped / माइक्रोचिप',
            nextVaccinationLabel: 'Next Vaccination / अगला टीकाकरण',
            ownerDetailsTitle: 'Owner Details / मालिक का विवरण',
            addressLabel: 'Address / पता',
            phoneNumberLabel: 'Phone Number / फोन नंबर',
            // numberOfAnimalsLabel will be dynamic based on lic.animalType in renderCertificateView
            houseAreaLabel: 'House Area / घर का क्षेत्रफल',
            // animalDetailsTitle will be dynamic in renderCertificateView
        },
        hi: {
            pageTitle: 'पंजीकरण नवीनीकृत करें',
            backToList: 'सूची पर वापस जाएं',
            successMessage1: 'आपका नवीनीकरण अनुरोध व्यवस्थापक की मंजूरी के लिए जमा कर दिया गया है।',
            successMessage2: 'प्रसंस्करण पूरा होने पर आपको सूचित किया जाएगा।',
            requestAnotherButton: 'लाइसेंस पर वापस जाएं', 
            loadingLicenses: 'आपके लाइसेंस लोड हो रहे हैं…',
            listError: 'आपके लाइसेंस प्राप्त करने में त्रुटि। कृपया पुनः प्रयास करें।',
            approvedLicensesTitle: 'आपके लाइसेंस',
            tableHeaders: {
                regNo: 'पंजीकरण संख्या',
                animalType: 'पशु का प्रकार',
                petName: 'पालतू जानवर का नाम',
                appliedDate: 'अंतिम अद्यतन', 
                status: 'स्थिति',
                action: 'कार्यवाही',
                view: 'देखें'
            },
            tableActions: {
                renew: 'नवीनीकृत करें',
                submitting: 'जमा हो रहा है...',
                view: 'देखें',
                renewalRequested: 'नवीनीकरण अनुरोधित'
            },
            emptyStateText: 'आपके पास अभी तक कोई लाइसेंस नहीं है।',
            renewalConfirm: (licenseNumber) => `क्या आप लाइसेंस संख्या ${licenseNumber} के लिए नवीनीकरण का अनुरोध करना चाहते हैं?`,
            // Certificate specific texts in Hindi
            orgNameEn: 'Nagar Nigam Gorakhpur',
            orgNameHi: 'नगर निगम गोरखपुर',
            certificateTitleEn: 'PET LICENSE CERTIFICATE',
            certificateTitleHi: 'पालतू पशु पंजीकरण प्रमाण पत्र',
            dateLabel: 'दिनांक:',
            photoPlaceholder: 'पालतू जानवर की तस्वीर',
            declaration: <>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है। <b>/</b> I declare that the information provided above is true to the best of my knowledge.</>,
            applicantSignature: 'आवेदक के हस्ताक्षर / Applicant\'s Signature',
            issuingAuthority: 'जारीकर्ता अधिकारी / Issuing Authority',
            qrCodeLabel: 'क्यूआर कोड',
            stampLabel: 'मुहर',
            downloadPdfButton: 'पीडीएफ डाउनलोड करें',
            pendingNotice: <>आपका आवेदन समीक्षाधीन है। अनुमोदन के बाद ही आप लाइसेंस डाउनलोड कर पाएंगे।</>,
            rejectedNotice: (rejectionDate) => <>आपका आवेदन {formatDate(rejectionDate)} को अस्वीकृत कर दिया गया है।</>,
            reasonLabel: 'कारण:',
            contactSupport: <>अधिक जानकारी के लिए कृपया सहायता से संपर्क करें।</>,
            animalTypeLabel: 'पशु का प्रकार / Animal Type',
            petNameLabel: 'पालतू जानवर का नाम / Pet Name',
            breedLabel: 'नस्ल / Breed',
            categoryLabel: 'वर्ग / Category',
            colorLabel: 'रंग / Color',
            ageLabel: 'आयु / Age',
            vaccinationDateLabel: 'टीकाकरण की तारीख / Vaccination Date',
            genderLabel: 'लिंग / Gender',
            vaccinatedLabel: 'टीकाकरण / Vaccinated',
            vaccinationCertificateLabel: 'टीकाकरण प्रमाणपत्र / Vaccination Certificate',
            microchippedLabel: 'माइक्रोचिप / Microchipped',
            nextVaccinationLabel: 'अगला टीकाकरण / Next Vaccination',
            ownerDetailsTitle: 'मालिक का विवरण / Owner Details',
            addressLabel: 'पता / Address',
            phoneNumberLabel: 'फोन नंबर / Phone Number',
            houseAreaLabel: 'घर का क्षेत्रफल / House Area',
        }
    };

    const currentText = textContent[languageType] || textContent.en;


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  const fetchUserLicenses = async () => {
    setLoadingLicenses(true);
    setListError('');
    try {
      const response = await fetch(`${backend}/api/license/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch licenses');
      }
      const sortedLicenses = (data || []).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      setSuccessfulLicenses(sortedLicenses);
    } catch (err) {
      setListError(err.message || currentText.listError);
      setSuccessfulLicenses([]);
    } finally {
      setLoadingLicenses(false);
    }
  };


  useEffect(() => {
    if (token) {
        fetchUserLicenses();
    } else {
        setListError("User not authenticated.");
        setLoadingLicenses(false);
    }
  }, [backend, token, languageType, currentText.listError]); 

  const handleRenewRequest = async (licenseIdToRenew, licenseNumber) => { 
      const isConfirmed = window.confirm(currentText.renewalConfirm(licenseNumber));
      if (!isConfirmed) {
          return;
      }

    setListError('');
    setRenewalStates(prev => ({ ...prev, [licenseIdToRenew]: 'loading' }));


    try {
      const response = await fetch(`${backend}/api/license/renew-registration/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ licenseId: licenseIdToRenew }) 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Renewal request failed');
      }
      
      setRenewalStates(prev => ({ ...prev, [licenseIdToRenew]: 'success' }));
      alert(currentText.successMessage1); 
      fetchUserLicenses(); 
    } catch (err) {
       setListError(err.message || 'Renewal request failed. Please try again.');
       setRenewalStates(prev => ({ ...prev, [licenseIdToRenew]: 'error' }));
    }
  };

  const downloadPDF = (id, petName = 'pet') => {
    const element = document.getElementById(`pdf-${id}`);
      if (!element) {
         console.error("PDF element not found for ID:", id);
         return;
     }
    element.classList.add('force-desktop-pdf-layout');

    const opt = {
      margin: 0.35, 
      filename: `${getAnimalLabel(successfulLicenses.find(l => l._id === id)?.animalType || 'Pet')}_License_${petName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

     setTimeout(() => {
         html2pdf().from(element).set(opt).save().then(() => {
           element.classList.remove('force-desktop-pdf-layout');
         }).catch(error => {
            console.error("PDF generation failed:", error);
             element.classList.remove('force-desktop-pdf-layout');
         });
     }, 100);
  };

  const licenseToView = successfulLicenses.find(lic => lic._id === viewingLicenseId);
  const isAnyRenewalSuccess = Object.values(renewalStates).includes('success');


  return (
    <main className="rr-container">
        <header className="rr-header">
             {viewingLicenseId === null ? (
                <h1 className="rr-title">{currentText.pageTitle}</h1>
             ) : (
                 <div className="rr-back-to-list-header">
                     <button
                           className="rr-back-to-list-btn"
                           onClick={() => setViewingLicenseId(null)}
                       >
                         <ChevronLeft size={24} />
                         {currentText.backToList}
                       </button>
                 </div>
             )}
        </header>

      {isAnyRenewalSuccess && viewingLicenseId === null ? ( 
        <div className="rr-success-container">
          <CheckCircle size={48} className="rr-success-icon" />
          <p className="rr-success">
            {currentText.successMessage1}
          </p>
          <p>{currentText.successMessage2}</p>
          <button
            className="rr-button"
            onClick={() => {
              setRenewalStates({}); 
              fetchUserLicenses(); 
            }}
          >
            {currentText.requestAnotherButton}
          </button>
        </div>
      ) : (
        <>
          {viewingLicenseId === null && (
              <section className="rr-section rr-successful-licenses-section">
                <h2 className="rr-subtitle">{currentText.approvedLicensesTitle}</h2>

                {loadingLicenses ? (
                  <div className="rr-loading">
                    <div className="rr-spinner"></div>
                    <p className="rr-status">{currentText.loadingLicenses}</p>
                  </div>
                ) : listError && !isAnyRenewalSuccess ? ( 
                  <p className="rr-error">{listError}</p>
                ) : successfulLicenses.length > 0 ? (
                  <div className="rr-table-container">
                   <table className="rr-license-table">
                      <thead>
                          <tr>
                            <th>{currentText.tableHeaders.regNo}</th>
                            {!isMobile && <th>{currentText.tableHeaders.animalType}</th>}
                            {!isMobile && <th>{currentText.tableHeaders.petName}</th>}
                            {!isMobile && <th>{currentText.tableHeaders.appliedDate}</th>}
                            <th>{currentText.tableHeaders.status}</th>
                            <th>{currentText.tableHeaders.action}</th>
                            <th>{currentText.tableHeaders.view}</th>
                          </tr>
                      </thead>
                      <tbody>
                          {successfulLicenses.map(license => (
                            <tr key={license._id}>
                                <td><div className="rr-cell rr-reg-no-cell">{license.license_Id || "N/A"}</div></td>
                                {!isMobile && <td><div className="rr-cell rr-animal-type-cell">{getAnimalLabel(license.animalType) || "N/A"}</div></td>}
                                {!isMobile && <td><div className="rr-cell rr-pet-cell"><PawPrint size={16} className="rr-cell-icon" /> {license.pet?.name || "N/A"}</div></td>}
                                {!isMobile && <td><div className="rr-cell rr-date-cell"><Calendar size={16} className="rr-cell-icon" /> {formatDate(license.updatedAt || license.createdAt)}</div></td>}
                                <td><div className="rr-cell rr-status-cell"><StatusBadge status={license.status} isMobile={isMobile} languageType={languageType} /></div></td>
                               <td>
                                    <div className="rr-cell rr-action-cell">
                                         {license.status === 'approved' ? (
                                             <button
                                                 onClick={() => handleRenewRequest(license._id, license.license_Id)} 
                                                 className="rr-button rr-button--renew rr-button--small"
                                                 disabled={renewalStates[license._id] === 'loading'}
                                             >
                                                 {renewalStates[license._id] === 'loading' ? currentText.tableActions.submitting : currentText.tableActions.renew}
                                             </button>
                                         ) : license.status === 'renewal_pending' ? (
                                             <span className="rr-renewal-requested-text">{currentText.tableActions.renewalRequested}</span>
                                         ) : null}
                                    </div>
                                </td>
                               <td>
                                     <div className="rr-cell rr-view-cell">
                                          <button
                                              className="rr-view-btn"
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  setViewingLicenseId(license._id);
                                              }}
                                           >
                                                 <Eye size={16} className="rr-btn-icon" /> {!isMobile && currentText.tableActions.view}
                                          </button>
                                     </div>
                                </td>
                            </tr>
                          ))}
                      </tbody>
                   </table>
                 </div>
                 ) : (
                   <div className="rr-empty-state">
                     <div className="rr-empty-icon">
                      <FileText size={48} />
                     </div>
                     <p className="rr-no-data">{currentText.emptyStateText}</p>
                   </div>
                 )}
              </section>
          )}

          {viewingLicenseId !== null && licenseToView && (
              <section className="rr-section rr-certificate-section">
                  {renderCertificateView(licenseToView, isMobile, downloadPDF, languageType, currentText)}
              </section>
          )}
        </>
      )}
    </main>
  );
};

export default RenewRegistration;