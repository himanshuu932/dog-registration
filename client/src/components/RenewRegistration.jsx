import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js'; // Import html2pdf for PDF download
import './styles/RenewRegistration.css';
import { CheckCircle, AlertCircle, Calendar, FileText, Dog, User, Eye, ChevronLeft, Download,XCircle } from 'lucide-react'; // Import necessary icons

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
};

// Helper component for status badges
const StatusBadge = ({ status, isMobile, languageType = 'en' }) => { // Added languageType prop
  const statusText = {
    en: {
      approved: 'Approved',
      renewal_pending: 'Already Applied',
      pending: 'Pending',
      rejected: 'Rejected'
    },
    hi: {
      approved: 'स्वीकृत',
      renewal_pending: 'पहले से आवेदन किया गया',
      pending: 'लंबित',
      rejected: 'अस्वीकृत'
    }
  };

  const currentStatusText = statusText[languageType] || statusText.en;

  let badgeClass = "rr-status-badge";
  let Icon = AlertCircle; // Default icon
  let iconColor = 'var(--rr-warning)'; // Default color

  switch(status.toLowerCase()) {
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
     case 'rejected': // Added rejected status styling
      badgeClass += " rr-status-rejected";
      Icon = XCircle;
      iconColor = 'var(--rr-error)'; // Assuming a variable for error color
      break;
    default: // Handles 'pending' and any other unknown status
      badgeClass += " rr-status-default";
      Icon = AlertCircle; // Use AlertCircle for pending/default
      iconColor = 'var(--rr-dark)';
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
       <div className="rr-certificate-view"> {/* Changed class prefix */}
         <div id={`pdf-${lic._id}`} className="pdf-layout">
           <div className="pdf-border">
             <div className="pdf-header">
               <div className="pdf-header-left">
                 <div className="pdf-logo-icon">
                    <img src="./logo.webp" alt="Organization Logo"></img>
                 </div>
                 <div className="pdf-org-name">
                   <h3>{currentCertText.orgNameEn}</h3> {/* English Name */}
                   <h4>{currentCertText.orgNameHi}</h4> {/* Hindi Name */}
                 </div>
               </div>
               <div className="pdf-header-right">
                 <div className="pdf-date">
                   <span> {currentCertText.dateLabel} {currentDate}</span> {/* Dynamic Date Label */}
                 </div>
               </div>
             </div>

             <div className="pdf-certificate-title">
               <h2>{currentCertText.certificateTitleEn}</h2> {/* English Title */}
               <h3>{currentCertText.certificateTitleHi}</h3> {/* Hindi Title */}
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
                    info@awbi.org &nbsp;|&nbsp; {/* Placeholder contact info */}
                    www.awbi.org {/* Placeholder website */}
                </div>
             </div>
           </div>
         </div>
          {/* Download button only for approved licenses in the view */}
          {lic.status === 'approved' && (
              <button
                className="rr-button rr-certificate-download-btn" // Changed class prefix
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
              <div className="rr-pending-notice">
                <AlertCircle size={18} />
                <p>{currentCertText.pendingNotice}</p> {/* Dynamic pending text */}
              </div>
            )}

            {lic.status === 'rejected' && (
            <div className="rr-rejected-notice">
              <XCircle size={18} />
              <div>
                <p>{currentCertText.rejectedNotice(lic.rejectionDate)}</p> {/* Dynamic rejected text with date */}
                {lic.rejectionReason && (
                  <div className="rr-rejection-reason">
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


const RenewRegistration = ({ languageType = 'en' }) => { // Added languageType prop with default
  const [searchedLicense, setSearchedLicense] = useState(null); // State is no longer needed with search removed
  const [successfulLicenses, setSuccessfulLicenses] = useState([]); // State for the list of successful licenses
  const [loadingLicenses, setLoadingLicenses] = useState(true); // Loading state for fetching list
  const [renewalLoading, setRenewalLoading] = useState(false); // Loading state for renewal request
  const [requestSubmitted, setRequestSubmitted] = useState(false); // State for successful renewal request submission
  const [listError, setListError] = useState(''); // Error for fetching list
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // State for mobile view
  const [viewingLicenseId, setViewingLicenseId] = useState(null); // State to track which license's certificate is being viewed

  const backend = "https://dog-registration.onrender.com";
  const token = localStorage.getItem('token');

    const textContent = {
        en: {
            pageTitle: 'Renew Registration',
            backToList: 'Back to List',
            successMessage1: 'Your renewal request has been submitted for admin approval.',
            successMessage2: 'You will be notified once it\'s processed.',
            requestAnotherButton: 'Request Another Renewal',
            loadingLicenses: 'Loading your licenses…',
            listError: 'Error fetching your licenses. Please try again.',
            approvedLicensesTitle: 'Your Approved Licenses',
            tableHeaders: {
                regNo: 'Reg. No',
                dogName: 'Dog Name',
                appliedDate: 'Applied Date',
                status: 'Status',
                action: 'Action',
                view: 'View'
            },
            tableActions: {
                renew: 'Renew',
                submitting: 'Submitting...',
                view: 'View'
            },
            emptyStateText: 'You have no approved licenses yet.',
            renewalConfirm: (licenseNumber) => `Are you sure you want to request renewal for license number ${licenseNumber}?`
        },
        hi: {
             pageTitle: 'पंजीकरण नवीनीकृत करें',
            backToList: 'सूची पर वापस जाएं',
            successMessage1: 'आपका नवीनीकरण अनुरोध व्यवस्थापक की मंजूरी के लिए जमा कर दिया गया है।',
            successMessage2: 'प्रसंस्करण पूरा होने पर आपको सूचित किया जाएगा।',
            requestAnotherButton: 'एक और नवीनीकरण अनुरोध करें',
            loadingLicenses: 'आपके लाइसेंस लोड हो रहे हैं…',
            listError: 'आपके लाइसेंस प्राप्त करने में त्रुटि। कृपया पुनः प्रयास करें।',
             approvedLicensesTitle: 'आपके स्वीकृत लाइसेंस',
             tableHeaders: {
                regNo: 'पंजीकरण संख्या',
                dogName: 'कुत्ते का नाम',
                appliedDate: 'आवेदन की तिथि',
                status: 'स्थिति',
                action: 'कार्यवाही',
                view: 'देखें'
            },
            tableActions: {
                renew: 'नवीनीकृत करें',
                submitting: 'जमा हो रहा है...',
                view: 'देखें'
            },
            emptyStateText: 'आपके पास अभी तक कोई स्वीकृत लाइसेंस नहीं है।',
            renewalConfirm: (licenseNumber) => `क्या आप लाइसेंस संख्या ${licenseNumber} के लिए नवीनीकरण का अनुरोध करना चाहते हैं?`
        }
    };

    const currentText = textContent[languageType] || textContent.en; // Default to English


  // Effect to handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  // Effect to fetch the list of successful licenses on component mount and updates
  useEffect(() => {
    const fetchSuccessfulLicenses = async () => {
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

        // Filter for 'approved' or 'renewal_pending' status and sort by creation date (most recent first)
        const relevantLicenses = data.filter(lic => lic.status === 'approved' || lic.status === 'renewal_pending' || lic.status === 'pending' || lic.status === 'rejected');
        relevantLicenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


        setSuccessfulLicenses(relevantLicenses || []);
      } catch (err) {
        setListError(err.message || currentText.listError); // Dynamic error message
        setSuccessfulLicenses([]); // Clear list on error
      } finally {
        setLoadingLicenses(false);
      }
    };

    fetchSuccessfulLicenses();
  }, [backend, token, requestSubmitted, languageType, currentText.listError]); // Added languageType and currentText.listError to dependency array

  // Handle renewal request for a license from the list or search result
  const handleRenewRequest = async (licenseIdToRenew) => {
      // Show confirmation dialog
      const isConfirmed = window.confirm(currentText.renewalConfirm(licenseIdToRenew)); // Dynamic confirmation message

      if (!isConfirmed) {
          return; // Stop if user cancels
      }

    setListError(''); // Clear list error
    setRenewalLoading(true);

    try {
      const response = await fetch(`${backend}/api/license/renew-registration/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Send the license number of the license being renewed
        body: JSON.stringify({ licenseNumber: licenseIdToRenew })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Renewal request failed');
      }

      setRequestSubmitted(true);
      setViewingLicenseId(null); // Close certificate view if open after successful renewal
      // The useEffect will refetch the list and update the status for the renewed license
    } catch (err) {
       setListError(err.message || 'Renewal request failed. Please try again.'); // Using a generic error for now, could refine later
    } finally {
      setRenewalLoading(false);
    }
  };

    // Function to handle PDF download (copied from Download.jsx)
  const downloadPDF = (id, dogName = 'dog') => {
    const element = document.getElementById(`pdf-${id}`);
      if (!element) {
         console.error("PDF element not found for ID:", id);
         return;
     }

    // Add class to force desktop layout for PDF generation if needed
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


  // Find the license being viewed
  const licenseToView = successfulLicenses.find(lic => lic._id === viewingLicenseId);


  return (
    <main className="rr-container">
      {/* Header section */}
        <header className="rr-header">
             {viewingLicenseId === null ? (
                <h1 className="rr-title">{currentText.pageTitle}</h1> 
             ) : (
                 <div className="rr-back-to-list-header">
                     <button
                           className="rr-back-to-list-btn"
                           onClick={() => setViewingLicenseId(null)} // Set viewingLicenseId to null to go back
                       >
                         <ChevronLeft size={24} />
                         {currentText.backToList} {/* Dynamic Back button text */}
                       </button>
                 </div>
             )}
        </header>


      {requestSubmitted ? (
        <div className="rr-success-container">
          <p className="rr-success">
            {currentText.successMessage1} {/* Dynamic success message 1 */}
          </p>
          <p>{currentText.successMessage2}</p> {/* Dynamic success message 2 */}
          <button
            className="rr-button"
            onClick={() => {
              setRequestSubmitted(false);
              setSearchedLicense(null);
              setViewingLicenseId(null); // Also clear viewed license
            }}
          >
            {currentText.requestAnotherButton} {/* Dynamic button text */}
          </button>
        </div>
      ) : (
        <>
          {/* Section for displaying the list of successful licenses in a table - Hidden when viewing a certificate */}
          {viewingLicenseId === null && (
              <section className="rr-section rr-successful-licenses-section">
                <h2 className="rr-subtitle">{currentText.approvedLicensesTitle}</h2> {/* Dynamic section title */}

                {loadingLicenses ? (
                  <div className="rr-loading">
                    <div className="rr-spinner"></div>
                    <p className="rr-status">{currentText.loadingLicenses}</p> {/* Dynamic loading text */}
                  </div>
                ) : listError ? (
                  <p className="rr-error">{listError}</p> 
                ) : successfulLicenses.length > 0 ? (
                  <div className="rr-table-container">
                   <table className="rr-license-table">
                      <thead>
                          <tr>
                            <th>{currentText.tableHeaders.regNo}</th> {/* Dynamic header */}
                            {!isMobile && <th>{currentText.tableHeaders.dogName}</th>} {/* Dynamic header & Hide on mobile */}
                            {!isMobile && <th>{currentText.tableHeaders.appliedDate}</th>} {/* Dynamic header & Hide on mobile */}
                            <th>{currentText.tableHeaders.status}</th> {/* Dynamic header */}
                            <th>{currentText.tableHeaders.action}</th> {/* Dynamic header */}
                            <th>{currentText.tableHeaders.view}</th> {/* Dynamic header */}
                          </tr>
                      </thead>
                      <tbody>
                          {successfulLicenses.map(license => (
                            <tr key={license._id}>
                                <td><div className="rr-cell rr-reg-no-cell">{license.license_Id || "N/A"}</div></td>
                                {!isMobile && <td><div className="rr-cell rr-dog-cell">{license.dog?.name || "N/A"}</div></td>}
                                {!isMobile && <td><div className="rr-cell rr-date-cell"><Calendar size={16} className="rr-cell-icon" /> {formatDate(license.createdAt)}</div></td>}
                                <td><div className="rr-cell rr-status-cell"><StatusBadge status={license.status} isMobile={isMobile} languageType={languageType} /></div></td> {/* Pass languageType */}
                               <td>
                                    <div className="rr-cell rr-action-cell">
                                         {/* Show Renew button only if status is approved */}
                                         {license.status === 'approved' ? (
                                             <button
                                                 onClick={() => handleRenewRequest(license.license_Id)}
                                                 className="rr-button rr-button--renew rr-button--small"
                                                 disabled={renewalLoading}
                                             >
                                                 {renewalLoading ? currentText.tableActions.submitting : currentText.tableActions.renew} {/* Dynamic button text */}
                                             </button>
                                         ) : (
                                              // StatusBadge already handles 'renewal_pending' displaying 'Already Applied'
                                              // No button needed if status is not approved
                                              null
                                          )}
                                    </div>
                                </td>
                               <td> {/* View Button Cell */}
                                     <div className="rr-cell rr-view-cell">
                                          <button
                                              className="rr-view-btn"
                                              onClick={(e) => {
                                                  e.stopPropagation(); // Prevent row click
                                                  setViewingLicenseId(license._id); // Set the license ID to view
                                              }}
                                           >
                                                 <Eye size={16} className="rr-btn-icon" /> {!isMobile && currentText.tableActions.view} {/* Dynamic button text */}
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
                      <FileText size={48} /> {/* Or perhaps a Dog icon? */}
                     </div>
                     <p className="rr-no-data">{currentText.emptyStateText}</p> {/* Dynamic empty state text */}
                   </div>
                 )}
              </section>
          )}

          {/* Section for displaying the certificate view - Only shown when viewingLicenseId is set */}
          {viewingLicenseId !== null && licenseToView && (
              <section className="rr-section rr-certificate-section">
                  {/* Render the certificate view using the helper function */}
                  {renderCertificateView(licenseToView, isMobile, downloadPDF, languageType)} {/* Pass languageType */}
              </section>
          )}
        </>
      )}
    </main>
  );
};

export default RenewRegistration;