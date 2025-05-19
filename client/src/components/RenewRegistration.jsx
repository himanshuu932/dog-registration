import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js'; // Import html2pdf for PDF download
import './styles/RenewRegistration.css';
import { CheckCircle, AlertCircle, Calendar, FileText, PawPrint, User, Eye, ChevronLeft, Download, XCircle } from 'lucide-react'; // Changed Dog to PawPrint for generic pet

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
};

// Helper component for status badges
const StatusBadge = ({ status, isMobile, languageType = 'en' }) => {
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
  let Icon = AlertCircle;
  let iconColor = 'var(--rr-warning)';

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

  const displayStatusText = currentStatusText[status.toLowerCase()] || status;

  return (
    <span className={badgeClass}>
      <Icon size={16} style={{ color: iconColor }} />
      {!isMobile && <span>{displayStatusText}</span>}
    </span>
  );
};

// Helper function to render the certificate view
const renderCertificateView = (lic, isMobile, downloadPDF, languageType = 'en') => {
    const currentDate = new Date().toLocaleDateString('en-GB');

    // Calculate expiry date based on pet's vaccination date
    const expiryDate = lic.pet?.dateOfVaccination ?
      new Date(new Date(lic.pet.dateOfVaccination).setFullYear(
        new Date(lic.pet.dateOfVaccination).getFullYear() + 1
      )).toLocaleDateString('en-GB') : "N/A";

    const certificateText = {
        en: {
            orgNameEn: 'Nagar Nigam Gorakhpur',
            orgNameHi: 'नगर निगम गोरखपुर',
            certificateTitleEn: 'PET LICENSE CERTIFICATE', // Changed from "OFFICIAL DOG LICENSE CERTIFICATE"
            certificateTitleHi: 'पालतू पशु पंजीकरण प्रमाण पत्र', // Updated Hindi Title
            dateLabel: 'Date:',
            photoPlaceholder: 'Pet\'s Photo', // Changed from "Dog's Photo"
            declaration: <>I declare that the information provided above is true to the best of my knowledge. <b>/</b> मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।</>,
            applicantSignature: 'Applicant\'s Signature / आवेदक के हस्ताक्षर',
            issuingAuthority: 'Issuing Authority / जारीकर्ता अधिकारी',
            qrCodeLabel: 'QR Code',
            stampLabel: 'STAMP', // Changed from "OFFICIAL STAMP"
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
            numberOfAnimalsLabel: 'No. of Animals / जानवरों की संख्या', // Changed from No. of Dogs
            houseAreaLabel: 'House Area / घर का क्षेत्रफल',
            animalDetailsTitle: 'Animal Details / पशु का विवरण',
        },
        hi: {
            orgNameEn: 'Nagar Nigam Gorakhpur',
            orgNameHi: 'नगर निगम गोरखपुर',
            certificateTitleEn: 'PET LICENSE CERTIFICATE', // Changed
            certificateTitleHi: 'पालतू पशु पंजीकरण प्रमाण पत्र', // Changed
            dateLabel: 'दिनांक:',
            photoPlaceholder: 'पालतू जानवर की तस्वीर', // Changed
            declaration: <>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है। <b>/</b> I declare that the information provided above is true to the best of my knowledge.</>,
            applicantSignature: 'आवेदक के हस्ताक्षर / Applicant\'s Signature',
            issuingAuthority: 'जारीकर्ता अधिकारी / Issuing Authority',
            qrCodeLabel: 'क्यूआर कोड',
            stampLabel: 'मुहर', // Changed
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
            numberOfAnimalsLabel: 'जानवरों की संख्या / No. of Animals', // Changed
            houseAreaLabel: 'घर का क्षेत्रफल / House Area',
            animalDetailsTitle: 'पशु का विवरण / Animal Details',
        }
    };

    const currentCertText = certificateText[languageType] || certificateText.en;


    return (
       <div className="rr-certificate-view">
         <div id={`pdf-${lic._id}`} className="pdf-layout">
           <div className="pdf-border">
             <div className="pdf-header">
               <div className="pdf-header-left">
                 <div className="pdf-logo-icon">
                    <img src="./logo.webp" alt="Organization Logo"></img> {/* Ensure this path is correct */}
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
                    <div className="pdf-info-row"> {/* Added Animal Type to certificate info block */}
                        <div className="pdf-info-label">{currentCertText.animalTypeLabel}</div>
                        <div className="pdf-info-value">: {lic.animalType || "N/A"}</div>
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
                   {lic.pet?.avatarUrl ? ( // Changed from lic.dog to lic.pet
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
                       <div className="pdf-details-value">: {lic.pet?.name || "N/A"}</div> {/* Changed from lic.dog to lic.pet */}
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.breedLabel}</div>
                       <div className="pdf-details-value">: {lic.pet?.breed || "N/A"}</div> {/* Changed from lic.dog to lic.pet */}
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.categoryLabel}</div>
                       <div className="pdf-details-value">: {lic.pet?.category || "N/A"}</div> {/* Changed from lic.dog to lic.pet */}
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.colorLabel}</div>
                       <div className="pdf-details-value">: {lic.pet?.color || "N/A"}</div> {/* Changed from lic.dog to lic.pet */}
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.ageLabel}</div>
                       <div className="pdf-details-value">: {lic.pet?.age || "N/A"}</div> {/* Changed from lic.dog to lic.pet */}
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.vaccinationDateLabel}</div>
                       <div className="pdf-details-value">: {formatDate(lic.pet?.dateOfVaccination)}</div> {/* Changed from lic.dog to lic.pet */}
                     </div>
                   </div>
                   <div className="pdf-details-column-right">
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.genderLabel}</div>
                       <div className="pdf-details-value">: {lic.pet?.sex || "N/A"}</div> {/* Changed from lic.dog to lic.pet */}
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.vaccinatedLabel}</div>
                       <div className="pdf-details-value">
                         : {lic.pet?.dateOfVaccination ? (languageType === 'hi' ? ' हां' : ' Yes') : (languageType === 'hi' ? ' नहीं' : ' No')} {/* Changed from lic.dog to lic.pet */}
                       </div>
                     </div>
                     {lic.pet?.vaccinationProofUrl && ( // Changed from lic.dog to lic.pet
                       <div className="pdf-details-row">
                         <div className="pdf-details-label">{currentCertText.vaccinationCertificateLabel}</div>
                         <div className="pdf-details-value">
                           <a
                             href={lic.pet.vaccinationProofUrl} // Changed from lic.dog to lic.pet
                             target="_blank"
                             rel="noreferrer"
                             className="pdf-vaccine-img"
                           >View </a>
                         </div>
                       </div>
                     )}
                     <div className="pdf-details-row"> {/* Assuming microchip info is not in pet object yet */}
                       <div className="pdf-details-label">{currentCertText.microchippedLabel}</div>
                       <div className="pdf-details-value">
                         : {languageType === 'hi' ? 'नहीं' : 'No'}
                       </div>
                     </div>
                     <div className="pdf-details-row">
                       <div className="pdf-details-label">{currentCertText.nextVaccinationLabel}</div>
                       <div className="pdf-details-value">: {formatDate(lic.pet?.dueVaccination)}</div> {/* Changed from lic.dog to lic.pet */}
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
                     <div className="pdf-details-value">: {lic.numberOfAnimals || "N/A"}</div> {/* Changed from numberOfDogs to numberOfAnimals */}
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
                       <div className="pdf-qr-placeholder"></div> {/* Placeholder for actual QR code */}
                     <p>{currentCertText.qrCodeLabel}</p>
                   </div>
                    <div className="pdf-stamp">
                        <div className="pdf-stamp-placeholder">
                            <p>{currentCertText.stampLabel}</p> {/* Changed from officialStamp */}
                        </div>
                   </div>
               </div>
                <div className="pdf-contact-footer">
                    {lic.phoneNumber || "N/A"} &nbsp;|&nbsp;
                    info@example.org &nbsp;|&nbsp; {/* Placeholder contact info */}
                    www.example.org {/* Placeholder website */}
                </div>
             </div>
           </div>
         </div>
          {lic.status === 'approved' && (
              <button
                className="rr-button rr-certificate-download-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadPDF(lic._id, lic.pet?.name || 'pet'); // Changed from lic.dog to lic.pet
                }}
              >
                <Download size={18} />
                <span>{currentCertText.downloadPdfButton}</span>
              </button>
            )}

            {lic.status === 'pending' && (
              <div className="rr-pending-notice">
                <AlertCircle size={18} />
                <p>{currentCertText.pendingNotice}</p>
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
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [listError, setListError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [viewingLicenseId, setViewingLicenseId] = useState(null);

  const backend = "https://dog-registration.onrender.com"; // Replace with your actual backend URL
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
            approvedLicensesTitle: 'Your Licenses', // Changed title slightly
            tableHeaders: {
                regNo: 'Reg. No',
                animalType: 'Animal Type', // Added Animal Type header
                petName: 'Pet Name', // Changed from Dog Name
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
            emptyStateText: 'You have no licenses yet.', // Updated empty state text
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
            approvedLicensesTitle: 'आपके लाइसेंस', // Changed
            tableHeaders: {
                regNo: 'पंजीकरण संख्या',
                animalType: 'पशु का प्रकार', // Added Animal Type header in Hindi
                petName: 'पालतू जानवर का नाम', // Changed from कुत्ते का नाम
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
            emptyStateText: 'आपके पास अभी तक कोई लाइसेंस नहीं है।', // Updated
            renewalConfirm: (licenseNumber) => `क्या आप लाइसेंस संख्या ${licenseNumber} के लिए नवीनीकरण का अनुरोध करना चाहते हैं?`
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


  useEffect(() => {
    const fetchSuccessfulLicenses = async () => {
      setLoadingLicenses(true);
      setListError('');
      try {
        const response = await fetch(`${backend}/api/license/user`, { // Ensure this endpoint fetches all relevant licenses
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch licenses');
        }

        // Assuming the API returns all licenses for the user.
        // Sorting by creation date (most recent first)
        const sortedLicenses = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSuccessfulLicenses(sortedLicenses || []);
      } catch (err) {
        setListError(err.message || currentText.listError);
        setSuccessfulLicenses([]);
      } finally {
        setLoadingLicenses(false);
      }
    };

    if (token) { // Only fetch if token exists
        fetchSuccessfulLicenses();
    } else {
        setListError("User not authenticated."); // Handle case where token is missing
        setLoadingLicenses(false);
    }
  }, [backend, token, requestSubmitted, languageType, currentText.listError]);

  const handleRenewRequest = async (licenseIdToRenew) => {
      const isConfirmed = window.confirm(currentText.renewalConfirm(licenseIdToRenew));
      if (!isConfirmed) {
          return;
      }

    setListError('');
    setRenewalLoading(true);

    try {
      const response = await fetch(`${backend}/api/license/renew-registration/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ licenseNumber: licenseIdToRenew })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Renewal request failed');
      }

      setRequestSubmitted(true);
      setViewingLicenseId(null);
    } catch (err) {
       setListError(err.message || 'Renewal request failed. Please try again.');
    } finally {
      setRenewalLoading(false);
    }
  };

  const downloadPDF = (id, petName = 'pet') => { // Changed dogName to petName
    const element = document.getElementById(`pdf-${id}`);
      if (!element) {
         console.error("PDF element not found for ID:", id);
         return;
     }
    element.classList.add('force-desktop-pdf-layout');

    const opt = {
      margin: 0.5,
      filename: `Pet_License_${petName.replace(/\s+/g, '_')}.pdf`, // Changed filename
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true }, // Added useCORS if images are from other domains
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

     setTimeout(() => {
         html2pdf().from(element).set(opt).save().then(() => {
           element.classList.remove('force-desktop-pdf-layout');
         }).catch(error => {
            console.error("PDF generation failed:", error);
             element.classList.remove('force-desktop-pdf-layout');
         });
     }, 100); // Increased delay slightly for complex rendering
  };

  const licenseToView = successfulLicenses.find(lic => lic._id === viewingLicenseId);

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

      {requestSubmitted ? (
        <div className="rr-success-container">
          <p className="rr-success">
            {currentText.successMessage1}
          </p>
          <p>{currentText.successMessage2}</p>
          <button
            className="rr-button"
            onClick={() => {
              setRequestSubmitted(false);
              // setSearchedLicense(null); // This state was removed, ensure no lingering references
              setViewingLicenseId(null);
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
                ) : listError ? (
                  <p className="rr-error">{listError}</p>
                ) : successfulLicenses.length > 0 ? (
                  <div className="rr-table-container">
                   <table className="rr-license-table">
                      <thead>
                          <tr>
                            <th>{currentText.tableHeaders.regNo}</th>
                            {!isMobile && <th>{currentText.tableHeaders.animalType}</th>} {/* Added Animal Type Header */}
                            {!isMobile && <th>{currentText.tableHeaders.petName}</th>} {/* Changed to Pet Name */}
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
                                {!isMobile && <td><div className="rr-cell rr-animal-type-cell">{license.animalType || "N/A"}</div></td>} {/* Display Animal Type */}
                                {!isMobile && <td><div className="rr-cell rr-pet-cell"><PawPrint size={16} className="rr-cell-icon" /> {license.pet?.name || "N/A"}</div></td>} {/* Changed to pet.name and PawPrint icon */}
                                {!isMobile && <td><div className="rr-cell rr-date-cell"><Calendar size={16} className="rr-cell-icon" /> {formatDate(license.createdAt)}</div></td>}
                                <td><div className="rr-cell rr-status-cell"><StatusBadge status={license.status} isMobile={isMobile} languageType={languageType} /></div></td>
                               <td>
                                    <div className="rr-cell rr-action-cell">
                                         {license.status === 'approved' ? (
                                             <button
                                                 onClick={() => handleRenewRequest(license.license_Id)}
                                                 className="rr-button rr-button--renew rr-button--small"
                                                 disabled={renewalLoading}
                                             >
                                                 {renewalLoading ? currentText.tableActions.submitting : currentText.tableActions.renew}
                                             </button>
                                         ) : (
                                              null
                                          )}
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
                  {renderCertificateView(licenseToView, isMobile, downloadPDF, languageType)}
              </section>
          )}
        </>
      )}
    </main>
  );
};

export default RenewRegistration;
