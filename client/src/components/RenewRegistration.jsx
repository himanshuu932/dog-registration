import React, { useState, useEffect } from 'react';
// import html2pdf from 'html2pdf.js'; // Not used if download button is removed
import './styles/RenewRegistration.css'; // Ensure this path is correct and CSS is updated
import { CheckCircle, AlertCircle, Calendar, FileText, PawPrint, User, Eye, ChevronLeft, XCircle, Clock } from 'lucide-react';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
};

// Component to display status badges, similar to Download.jsx
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
  const lowerStatus = status ? status.toLowerCase() : 'default';

  let badgeClass = "user-rr-status-badge"; // Using new unique class prefix
  let Icon = AlertCircle; // Default icon

  switch(lowerStatus) {
    case 'approved':
      badgeClass += " user-rr-status-approved";
      Icon = CheckCircle;
      break;
    case 'renewal_pending':
      badgeClass += " user-rr-status-renewal-pending"; // Specific class for this status
      Icon = Clock; // Using Clock for pending-like statuses
      break;
    case 'pending':
      badgeClass += " user-rr-status-pending";
      Icon = Clock;
      break;
     case 'rejected':
      badgeClass += " user-rr-status-rejected";
      Icon = XCircle;
      break;
    default:
      badgeClass += " user-rr-status-default"; // Fallback style
  }

  const displayStatusText = currentStatusText[lowerStatus] || status;

  return (
    <span className={badgeClass}>
      <Icon size={isMobile ? 14 : 16} /> {/* Icon size can be responsive */}
      {!isMobile && <span>{displayStatusText}</span>}
    </span>
  );
};

// Helper to get a display label for animal type
const getAnimalLabel = (animalType = '') => {
    if (!animalType) return 'Pet'; // Default
    const lower = animalType.toLowerCase();
    // Simple mapping, can be expanded
    switch (lower) {
      case 'dog': return 'Dog';
      case 'cat': return 'Cat';
      case 'rabbit': return 'Rabbit';
      default: return animalType.charAt(0).toUpperCase() + animalType.slice(1); // Capitalize first letter
    }
};

// Function to render the certificate view, adapted from Download.jsx structure
// Removed downloadPDF argument as button is removed
const renderCertificateView = (lic, languageType = 'en', currentTextArg) => {
    const currentDateOnCertificate = new Date().toLocaleDateString('en-GB'); // Date for the certificate header

    // Determine expiry date
    const expiryDate = lic.expiryDate ? formatDate(lic.expiryDate) :
                       lic.pet?.dateOfVaccination ? new Date(new Date(lic.pet.dateOfVaccination).setFullYear(new Date(lic.pet.dateOfVaccination).getFullYear() + 1)).toLocaleDateString('en-GB')
                       : "N/A";

    // Using passed currentTextArg for all text content within the certificate
    const currentCertText = currentTextArg || {}; // Fallback to empty object if not provided

    // Defaulting animalTypeLabel and animalDetailsTitle if not in currentTextArg
    const animalTypeLabelBilingual = currentCertText.animalTypeLabelBilingual || `Animal Type / पशु का प्रकार`;
    const animalDetailsTitleBilingual = currentCertText.animalDetailsTitleBilingual || `${getAnimalLabel(lic.animalType)} Details / ${getAnimalLabel(lic.animalType)} का विवरण`;


    return (
       // Main container for the certificate and related notices
       <div className="user-rr-certificate-display-area">
         {/* The A4-sized layout for the certificate content */}
         <div id={`pdf-rr-${lic._id}`} className="pdf-rr-layout"> {/* Unique ID with prefix */}
           <div className="pdf-rr-outer-border">
             <div className="pdf-rr-border">
               {/* PDF Header */}
               <div className="pdf-rr-header">
                 <div className="pdf-rr-header-left">
                   <div className="pdf-rr-logo-icon">
                      {/* Placeholder for logo, replace with actual or remove */}
                      <img src="/logo.webp" alt="Organization Logo" onError={(e) => e.target.style.display='none'} />
                   </div>
                   <div className="pdf-rr-org-name">
                     <h3>{currentCertText.orgNameEn || 'Nagar Nigam Gorakhpur'}</h3>
                     <h4>{currentCertText.orgNameHi || 'नगर निगम गोरखपुर'}</h4>
                   </div>
                 </div>
                 <div className="pdf-rr-header-right">
                    {/* Optional: Another logo or element */}
                    <div className="pdf-rr-logo-icon">
                       <img src="/up.webp" alt="State Logo" onError={(e) => e.target.style.display='none'} />
                    </div>
                 </div>
               </div>

               {/* Certificate Title */}
               <div className="pdf-rr-certificate-title">
                 {lic.isProvisional ? (
                   <>
                     <h2>{currentCertText.certificateTitleEnP || 'PROVISIONAL PET LICENSE CERTIFICATE'}</h2>
                     <h3>{currentCertText.certificateTitleHiP || 'अस्थायी पालतू पशु पंजीकरण प्रमाण पत्र'}</h3>
                   </>
                 ) : (
                   <>
                     <h2>{currentCertText.certificateTitleEn || 'PET LICENSE CERTIFICATE'}</h2>
                     <h3>{currentCertText.certificateTitleHi || 'पालतू पशु पंजीकरण प्रमाण पत्र'}</h3>
                   </>
                 )}
               </div>

               {/* PDF Body */}
               <div className="pdf-rr-body">
                 <div className="pdf-rr-photo-section">
                   <div className="pdf-rr-info-block">
                     <div className="pdf-rr-info-row"><div className="pdf-rr-info-label">नाम / Name</div><div className="pdf-rr-info-value">: {lic.fullName || "N/A"}</div></div>
                     <div className="pdf-rr-info-row"><div className="pdf-rr-info-label">पंजीकरण संख्या / Registration No.</div><div className="pdf-rr-info-value">: {lic.license_Id || "N/A"}</div></div>
                     <div className="pdf-rr-info-row"><div className="pdf-rr-info-label">जारी दिनांक / Issue Date</div><div className="pdf-rr-info-value">: {formatDate(lic.createdAt)}</div></div>
                     <div className="pdf-rr-info-row"><div className="pdf-rr-info-label">समाप्ति तिथि / Expiry Date</div><div className="pdf-rr-info-value">: {expiryDate}</div></div>
                   </div>
                   <div className="pdf-rr-photo-box">
                     {lic.pet?.avatarUrl ? (
                       <img src={lic.pet.avatarUrl} alt="Pet" className="pdf-rr-photo" onError={(e) => e.target.src='https://placehold.co/100x120/e0e0e0/757575?text=No+Image'} />
                     ) : (
                       <div className="pdf-rr-photo-placeholder">{currentCertText.photoPlaceholder || 'Pet\'s Photo'}</div>
                     )}
                   </div>
                 </div>

                 {/* Animal Details Section */}
                 <div className="pdf-rr-details-section">
                   <div className="pdf-rr-section-title">{animalDetailsTitleBilingual}</div>
                   <div className="pdf-rr-details-columns">
                     <div className="pdf-rr-details-column-left">
                       <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{animalTypeLabelBilingual}</div><div className="pdf-rr-details-value">: {getAnimalLabel(lic.animalType) || "N/A"}</div></div>
                       <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.petNameLabel || 'Pet Name / पालतू जानवर का नाम'}</div><div className="pdf-rr-details-value">: {lic.pet?.name || "N/A"}</div></div>
                       <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.breedLabel || 'Breed / नस्ल'}</div><div className="pdf-rr-details-value">: {lic.pet?.breed || "N/A"}</div></div>
                       <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.categoryLabel || 'Category / वर्ग'}</div><div className="pdf-rr-details-value">: {lic.pet?.category || "N/A"}</div></div>
                       <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.colorLabel || 'Color / रंग'}</div><div className="pdf-rr-details-value">: {lic.pet?.color || "N/A"}</div></div>
                       <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.ageLabel || 'Age / आयु'}</div><div className="pdf-rr-details-value">: {lic.pet?.age || "N/A"}</div></div>
                     </div>
                     <div className="pdf-rr-details-column-right">
                       <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.genderLabel || 'Gender / लिंग'}</div><div className="pdf-rr-details-value">: {lic.pet?.sex || "N/A"}</div></div>
                       <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.vaccinationDateLabel || 'Vaccination Date / टीकाकरण की तारीख'}</div><div className="pdf-rr-details-value">: {formatDate(lic.pet?.dateOfVaccination)}</div></div>
                       <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.vaccinatedLabel || 'Vaccinated / टीकाकरण'}</div><div className="pdf-rr-details-value">: {lic.pet?.dateOfVaccination ? (languageType === 'hi' ? ' हाँ' : ' Yes') : (languageType === 'hi' ? ' नहीं' : ' No')}</div></div>
                       {lic.pet?.vaccinationProofUrl && (<div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.vaccinationCertificateLabel || 'Vaccination Certificate / टीकाकरण प्रमाणपत्र'}</div><div className="pdf-rr-details-value"><a href={lic.pet.vaccinationProofUrl} target="_blank" rel="noreferrer noopener" className="pdf-rr-vaccine-img-link">View</a></div></div>)}
                       <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.microchippedLabel || 'Microchipped / माइक्रोचिप'}</div><div className="pdf-rr-details-value">: {languageType === 'hi' ? 'नहीं' : 'No'}</div></div> {/* Assuming No for now */}
                       <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.nextVaccinationLabel || 'Next Vaccination / अगला टीकाकरण'}</div><div className="pdf-rr-details-value">: {formatDate(lic.pet?.dueVaccination)}</div></div>
                     </div>
                   </div>
                 </div>

                 {/* Owner Details Section */}
                 <div className="pdf-rr-details-section">
                   <div className="pdf-rr-section-title">{currentCertText.ownerDetailsTitle || 'Owner Details / मालिक का विवरण'}</div>
                   <div className="pdf-rr-details-table"> {/* Using table-like structure for owner details */}
                     <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.addressLabel || 'Address / पता'}</div><div className="pdf-rr-details-value">: {`${lic.address?.streetName || ""}, ${lic.address?.city || ""}, ${lic.address?.state || ""} - ${lic.address?.pinCode || "N/A"}`}</div></div>
                     <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.phoneNumberLabel || 'Phone Number / फोन नंबर'}</div><div className="pdf-rr-details-value">: {lic.phoneNumber || "N/A"}</div></div>
                     <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.numberOfAnimalsLabel || `No. of ${getAnimalLabel(lic.animalType)}s / ${getAnimalLabel(lic.animalType)} की संख्या`}</div><div className="pdf-rr-details-value">: {lic.numberOfAnimals || "N/A"}</div></div>
                     <div className="pdf-rr-details-row"><div className="pdf-rr-details-label">{currentCertText.houseAreaLabel || 'House Area / घर का क्षेत्रफल'}</div><div className="pdf-rr-details-value">: {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}</div></div>
                   </div>
                 </div>

                 {/* Declaration */}
                 <div className="pdf-rr-declaration">
                   <p>{currentCertText.declaration || <>I declare that the information provided above is true to the best of my knowledge. <b>/</b> मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।</>}</p>
                 </div>
               </div> {/* END PDF Body */}

               {/* PDF Signatures and Footer are outside pdf-body to be at the bottom of pdf-border */}
               <div className="pdf-rr-signatures">
                 <div className="pdf-rr-signature-block"><div className="pdf-rr-signature-line"></div><p>{currentCertText.applicantSignature || 'Applicant\'s Signature / आवेदक के हस्ताक्षर'}</p></div>
                 <div className="pdf-rr-signature-block"><div className="pdf-rr-signature-line"></div><p>{currentCertText.issuingAuthority || 'Issuing Authority / जारीकर्ता अधिकारी'}</p></div>
               </div>

               <div className="pdf-rr-footer-bottom">
                 <div className="pdf-rr-qr-code-area">
                   <div className="pdf-rr-qr-placeholder"></div> {/* Placeholder for QR */}
                   <p>{currentCertText.qrCodeLabel || 'QR Code'}</p>
                 </div>
                 <div className="pdf-rr-stamp-area">
                   <div className="pdf-rr-stamp-placeholder"><p>{currentCertText.stampLabel || 'STAMP'}</p></div> {/* Placeholder for Stamp */}
                 </div>
               </div>
               <div className="pdf-rr-contact-footer">
                 {/* Example contact info, make dynamic or remove if not needed */}
                 <span>{lic.phoneNumber || currentCertText.contactPhone || "N/A"}</span> |
                 <span>{currentCertText.contactEmail || "info@example.org"}</span> |
                 <span>{currentCertText.contactWebsite || "www.example.org"}</span> |
                 <span>{currentCertText.dateLabel || "Date:"} {currentDateOnCertificate}</span>
               </div>

             </div> {/* End pdf-rr-border */}
           </div> {/* End pdf-rr-outer-border */}
         </div> {/* End pdf-rr-layout */}

         {/* Notices - Rendered outside the .pdf-layout element, but within the display area */}
         {/* No download button as per request */}

         {lic.status === 'renewal_pending' && (
           <div className="user-rr-pending-notice"> {/* Using unique class */}
             <AlertCircle size={18} />
             <p>{currentTextArg.renewalPendingNotice || 'Your renewal request is being processed.'}</p>
           </div>
         )}

         {lic.status === 'rejected' && (
           <div className="user-rr-rejected-notice"> {/* Using unique class */}
             <XCircle size={18} />
             <div>
               <p>{currentTextArg.rejectedNoticeText ? currentTextArg.rejectedNoticeText(lic.rejectionDate) : `Your application was rejected on ${formatDate(lic.rejectionDate)}.`}</p>
               {lic.rejectionReason && (
                 <div className="user-rr-rejection-reason-box"> {/* Using unique class */}
                   <strong>{currentTextArg.reasonLabel || 'Reason:'}</strong> {lic.rejectionReason}
                 </div>
               )}
               <p>{currentTextArg.contactSupport || 'Please contact support for more information.'}</p>
             </div>
           </div>
         )}
       </div> // End user-rr-certificate-display-area
    );
};


// Main RenewRegistration Component
const RenewRegistration = ({ languageType = 'en' }) => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewalStates, setRenewalStates] = useState({});
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [viewingLicenseId, setViewingLicenseId] = useState(null); // To show expanded certificate view
  const [isProvisional,setIsProvisional]=useState(0);
  // Configuration for backend API
  const backendUrl = "https://dog-registration.onrender.com"; // Replace if different
  const authToken = localStorage.getItem('token'); // Assuming token is stored in localStorage

  // Text content for internationalization (i18n)
  const textContent = {
    en: {
        pageTitle: 'Renew Pet License',
        backToList: 'Back to Licenses',
        renewalSuccessMessage: 'Your renewal request has been submitted for admin approval. You will be notified once it\'s processed.',
        renewalRequestButton: 'Back to Licenses',
        loadingLicenses: 'Loading your licenses…',
        fetchError: 'Error fetching your licenses. Please try again later.',
        noLicenses: 'You have no licenses eligible for renewal or viewing.',
        tableHeaders: {
            regNo: 'Reg. No',
            animalType: 'Animal Type',
            petName: 'Pet Name',
            lastUpdate: 'Last Update',
            status: 'Status',
            action: 'Action',
            view: 'View'
        },
        tableActions: {
            renew: 'Renew',
            submitting: 'Submitting...',
            view: 'View',
            renewalRequested: 'Requested'
        },
        renewalConfirm: (licenseNum) => `Are you sure you want to request renewal for license ${licenseNum}?`,
        // Certificate specific texts (ensure these match what renderCertificateView expects)
        orgNameEn: 'Nagar Nigam Gorakhpur',
        orgNameHi: 'नगर निगम गोरखपुर',
        certificateTitleEn: 'PET LICENSE CERTIFICATE',
        certificateTitleHi: 'पालतू पशु पंजीकरण प्रमाण पत्र',
        certificateTitleEnP: 'PROVISIONAL PET LICENSE CERTIFICATE',
        certificateTitleHiP: 'अस्थायी पालतू पशु पंजीकरण प्रमाण पत्र',
        dateLabel: 'Date:',
        photoPlaceholder: 'Pet\'s Photo',
        declaration: <>I declare that the information provided above is true to the best of my knowledge. <b>/</b> मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।</>,
        applicantSignature: 'Applicant\'s Signature / आवेदक के हस्ताक्षर',
        issuingAuthority: 'Issuing Authority / जारीकर्ता अधिकारी',
        qrCodeLabel: 'QR Code',
        stampLabel: 'STAMP',
        // downloadPdfButton: 'Download PDF', // Removed as per request
        renewalPendingNotice: 'Your renewal request has been submitted and is pending approval.',
        rejectedNoticeText: (rejectionDate) => `Your application has been rejected on ${formatDate(rejectionDate)}.`,
        reasonLabel: 'Reason:',
        contactSupport: 'Please contact support for more information.',
        animalTypeLabelBilingual: 'Animal Type / पशु का प्रकार',
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
        numberOfAnimalsLabel: `No. of Animals / जानवरों की संख्या`, // Generic, will be updated if animalType specific needed
        houseAreaLabel: 'House Area / घर का क्षेत्रफल',
        animalDetailsTitleBilingual: `Animal Details / पशु का विवरण`, // Generic
        contactPhone: 'N/A',
        contactEmail: 'info@example.org',
        contactWebsite: 'www.example.org',
    },
    hi: {
        pageTitle: 'पालतू पशु लाइसेंस नवीनीकृत करें',
        backToList: 'लाइसेंस पर वापस जाएं',
        renewalSuccessMessage: 'आपका नवीनीकरण अनुरोध व्यवस्थापक की मंजूरी के लिए जमा कर दिया गया है। प्रसंस्करण पूरा होने पर आपको सूचित किया जाएगा।',
        renewalRequestButton: 'लाइसेंस पर वापस जाएं',
        loadingLicenses: 'आपके लाइसेंस लोड हो रहे हैं…',
        fetchError: 'आपके लाइसेंस प्राप्त करने में त्रुटि। कृपया बाद में पुनः प्रयास करें।',
        noLicenses: 'आपके पास नवीनीकरण या देखने के लिए कोई लाइसेंस योग्य नहीं है।',
        tableHeaders: {
            regNo: 'पंजी. संख्या',
            animalType: 'पशु का प्रकार',
            petName: 'पालतू जानवर का नाम',
            lastUpdate: 'अंतिम अद्यतन',
            status: 'स्थिति',
            action: 'कार्यवाही',
            view: 'देखें'
        },
        tableActions: {
            renew: 'नवीनीकृत करें',
            submitting: 'जमा हो रहा है...',
            view: 'देखें',
            renewalRequested: 'अनुरोधित'
        },
        renewalConfirm: (licenseNum) => `क्या आप वाकई लाइसेंस ${licenseNum} के नवीनीकरण का अनुरोध करना चाहते हैं?`,
        // Hindi certificate texts
        orgNameEn: 'Nagar Nigam Gorakhpur', // Kept for consistency if needed
        orgNameHi: 'नगर निगम गोरखपुर',
        certificateTitleEn: 'PET LICENSE CERTIFICATE', // Kept for consistency
        certificateTitleHi: 'पालतू पशु पंजीकरण प्रमाण पत्र',
        certificateTitleEnP: 'PROVISIONAL PET LICENSE CERTIFICATE',
        certificateTitleHiP: 'अस्थायी पालतू पशु पंजीकरण प्रमाण पत्र',
        dateLabel: 'दिनांक:',
        photoPlaceholder: 'पालतू जानवर की तस्वीर',
        declaration: <>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है। <b>/</b> I declare that the information provided above is true to the best of my knowledge.</>,
        applicantSignature: 'आवेदक के हस्ताक्षर / Applicant\'s Signature',
        issuingAuthority: 'जारीकर्ता अधिकारी / Issuing Authority',
        qrCodeLabel: 'क्यूआर कोड',
        stampLabel: 'मुहर',
        renewalPendingNotice: 'आपका नवीनीकरण अनुरोध जमा कर दिया गया है और अनुमोदन के लिए लंबित है।',
        rejectedNoticeText: (rejectionDate) => `आपका आवेदन {formatDate(rejectionDate)} को अस्वीकृत कर दिया गया है।`,
        reasonLabel: 'कारण:',
        contactSupport: 'अधिक जानकारी के लिए कृपया सहायता से संपर्क करें।',
        animalTypeLabelBilingual: 'पशु का प्रकार / Animal Type',
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
        numberOfAnimalsLabel: `जानवरों की संख्या / No. of Animals`,
        houseAreaLabel: 'घर का क्षेत्रफल / House Area',
        animalDetailsTitleBilingual: `पशु का विवरण / Animal Details`,
        contactPhone: 'N/A',
        contactEmail: 'info@example.org', // Translate if needed
        contactWebsite: 'www.example.org', // Translate if needed
    }
  };
  const currentText = textContent[languageType] || textContent.en;

  // Effect for handling window resize to set isMobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to fetch user licenses
  const fetchUserLicenses = async () => {
    setLoading(true);
    setError('');
    if (!authToken) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        setLicenses([]);
        return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/license/user`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch licenses');
      }
      const data = await response.json();
      // Sort licenses by last update or creation date, newest first
      const sortedLicenses = (data || []).sort((a, b) =>
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      setLicenses(sortedLicenses);
    } catch (err) {
      setError(err.message || currentText.fetchError);
      setLicenses([]); // Clear licenses on error
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch licenses when component mounts or dependencies change
  useEffect(() => {
    fetchUserLicenses();
  }, [backendUrl, authToken, languageType]); // Rerun if language changes to update text

  // Handle renewal request
  const handleRenewRequest = async (licenseIdToRenew, licenseNumber) => {
    // Confirmation dialog
    if (!window.confirm(currentText.renewalConfirm(licenseNumber))) {
        return;
    }

    setError(''); // Clear previous errors
    setRenewalStates(prev => ({ ...prev, [licenseIdToRenew]: 'loading' }));

    try {
      const response = await fetch(`${backendUrl}/api/license/renew-registration/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ licenseId: licenseIdToRenew })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Renewal request failed');
      }
      setRenewalStates(prev => ({ ...prev, [licenseIdToRenew]: 'success' }));
      alert(currentText.renewalSuccessMessage.split('.')[0]); // Show first part of success message
      fetchUserLicenses(); // Refresh the list of licenses
    } catch (err) {
       setError(err.message || 'Renewal request failed. Please try again.');
       setRenewalStates(prev => ({ ...prev, [licenseIdToRenew]: 'error' })); // Mark as error
    }
  };

  // Find the license to view if an ID is set
  const licenseToView = licenses.find(lic => lic._id === viewingLicenseId);
  // Check if any renewal request was successful to show the main success message
  const isAnyRenewalSuccess = Object.values(renewalStates).includes('success');


  // Main render logic
  return (
    <main className={`user-rr-container ${viewingLicenseId ? 'user-rr-certificate-focused-container' : ''}`}>
      <header className={`user-rr-header ${viewingLicenseId ? 'user-rr-certificate-header' : ''}`}>
        {viewingLicenseId === null ? (
          <h1 className="user-rr-title">{currentText.pageTitle}</h1>
        ) : (
          <div className="user-rr-back-to-list-header">
            <button
              className="user-rr-back-to-list-btn"
              onClick={() => setViewingLicenseId(null)}
            >
              <ChevronLeft size={isMobile ? 20 : 24} />
              {currentText.backToList}
            </button>
          </div>
        )}
      </header>

      {/* Display general error message if any */}
      {error && !loading && viewingLicenseId === null && <p className="user-rr-error-message">{error}</p>}

      {/* Conditional rendering based on state */}
      {isAnyRenewalSuccess && viewingLicenseId === null && !loading && (
        // Shows a general success message if a renewal was just made
        <div className="user-rr-success-message-container">
          <CheckCircle size={48} className="user-rr-success-icon" />
          <strong className="user-rr-message-strong">{currentText.renewalSuccessMessage.split('.')[0]}.</strong>
          <p className="user-rr-message-detail">{currentText.renewalSuccessMessage.split('.').slice(1).join('.').trim()}</p>
          <button
            className="user-rr-back-to-licenses-btn" // Re-styled button
            onClick={() => {
              setRenewalStates({}); // Reset renewal states
              fetchUserLicenses(); // Refresh list
            }}
          >
            {currentText.renewalRequestButton}
          </button>
        </div>
      ) }

      {/* Main content: either list of licenses or certificate view */}
      {!isAnyRenewalSuccess && viewingLicenseId === null && ( // Show list if no recent success message and no specific cert is viewed
          <>
            {loading ? (
              <div className="user-rr-loading">
                <div className="user-rr-spinner"></div>
                <p className="user-rr-status-message">{currentText.loadingLicenses}</p>
              </div>
            ) : licenses.length > 0 ? (
              <div className="user-rr-table-container">
                <table className="user-rr-license-table">
                  <thead>
                    <tr>
                      <th>{currentText.tableHeaders.regNo}</th>
                      {!isMobile && <th>{currentText.tableHeaders.animalType}</th>}
                      {!isMobile && <th>{currentText.tableHeaders.petName}</th>}
                      {!isMobile && <th>{currentText.tableHeaders.lastUpdate}</th>}
                      <th>{currentText.tableHeaders.status}</th>
                      <th>{currentText.tableHeaders.action}</th>
                      <th>{currentText.tableHeaders.view}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map(license => (
                      <tr key={license._id}>
                        <td><div className="user-rr-cell-content">{license.license_Id || "N/A"}</div></td>
                        {!isMobile && <td><div className="user-rr-cell-content">{getAnimalLabel(license.animalType) || "N/A"}</div></td>}
                        {!isMobile && <td><div className="user-rr-cell-content"><PawPrint size={16} className="user-rr-cell-icon" /> {license.pet?.name || "N/A"}</div></td>}
                        {!isMobile && <td><div className="user-rr-cell-content"><Calendar size={16} className="user-rr-cell-icon" /> {formatDate(license.updatedAt || license.createdAt)}</div></td>}
                        <td><div className="user-rr-cell-content"><StatusBadge status={license.status} isMobile={isMobile} languageType={languageType} /></div></td>
                        <td>
                          <div className="user-rr-cell-content">
                            {license.status === 'approved' ? (
                              <button
                                onClick={() => handleRenewRequest(license._id, license.license_Id)}
                                className="user-rr-action-btn user-rr-renew-btn" // Using specific classes for styling
                                disabled={renewalStates[license._id] === 'loading'}
                              >
                                {renewalStates[license._id] === 'loading' ? currentText.tableActions.submitting : currentText.tableActions.renew}
                              </button>
                            ) : license.status === 'renewal_pending' ? (
                              <span className="user-rr-renewal-requested-text">{currentText.tableActions.renewalRequested}</span>
                            ) : (
                              <span>-</span> // Placeholder for other statuses
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="user-rr-cell-content">
                            <button
                              className="user-rr-view-btn"
                              onClick={() => setViewingLicenseId(license._id)}
                            >
                              <Eye size={16} className="user-rr-btn-icon" />
                              {!isMobile && <span>{currentText.tableActions.view}</span>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !error && ( // Show empty state only if no error and no licenses
              <div className="user-rr-empty-state">
                <div className="user-rr-empty-icon"><FileText size={48} /></div>
                <p className="user-rr-no-data-message">{currentText.noLicenses}</p>
              </div>
            )}
          </>
      )}

      {/* Expanded Certificate View */}
      {viewingLicenseId !== null && licenseToView && (
          // The renderCertificateView is already wrapped in user-rr-certificate-display-area
          renderCertificateView(licenseToView, languageType, currentText)
      )}
    </main>
  );
};

export default RenewRegistration;