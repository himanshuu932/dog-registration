import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './styles/RenewRegistration.css';
import { CheckCircle, AlertCircle, Calendar, FileText, PawPrint, User, Eye, ChevronLeft, XCircle, Clock, RefreshCw } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const lowerStatus = status ? status.toLowerCase() : 'default';

  let badgeClass = "user-rr-status-badge";
  let Icon = AlertCircle;
  let iconColor = 'var(--user-rr-warning-text)';

  switch(lowerStatus) {
    case 'approved':
      badgeClass += " user-rr-status-approved";
      Icon = CheckCircle;
      iconColor = 'var(--user-rr-success-text)';
      break;
    case 'renewal_pending':
      badgeClass += " user-rr-status-renewal-pending";
      Icon = Clock;
      iconColor = 'var(--user-rr-warning-text)';
      break;
    case 'pending':
      badgeClass += " user-rr-status-pending";
      Icon = Clock;
      iconColor = 'var(--user-rr-warning-text)';
      break;
     case 'rejected':
      badgeClass += " user-rr-status-rejected";
      Icon = XCircle;
      iconColor = 'var(--user-rr-danger-text)';
      break;
    default:
      badgeClass += " user-rr-status-default";
      iconColor = 'var(--user-rr-gray-dark)';
  }

  const displayStatusText = currentStatusText[lowerStatus] || status;

  return (
    <span className={badgeClass}>
      <Icon size={isMobile ? 14 : 16} style={{ color: iconColor }} />
      {!isMobile && <span>{displayStatusText}</span>}
    </span>
  );
};

const getAnimalLabel = (animalType = '') => {
    if (!animalType) return 'Pet';
    const lower = animalType.toLowerCase();
    switch (lower) {
      case 'dog': return 'Dog';
      case 'cat': return 'Cat';
      case 'rabbit': return 'Rabbit';
      default: return animalType.charAt(0).toUpperCase() + animalType.slice(1);
    }
};

const renderCertificateView = (lic, languageType = 'en', currentTextArg) => {
    const currentDateOnCertificate = new Date().toLocaleDateString('en-GB');

    const expiryDate = lic.expiryDate ? formatDate(lic.expiryDate) :
                       lic.pet?.dateOfVaccination ? new Date(new Date(lic.pet.dateOfVaccination).setFullYear(new Date(lic.pet.dateOfVaccination).getFullYear() + 1)).toLocaleDateString('en-GB')
                       : "N/A";

    const currentCertText = currentTextArg || {};

    const animalTypeLabelBilingual = currentCertText.animalTypeLabelBilingual || `Animal Type / पशु का प्रकार`;
    const animalDetailsTitleBilingual = currentCertText.animalDetailsTitleBilingual(getAnimalLabel(lic.animalType));


    return (
       <div className="user-rr-certificate-display-area">
         <div id={`pdf-rr-${lic._id}`} className="user-rr-pdf-layout">
           <div className="user-rr-outer-pdf-border">
             <div className="user-rr-pdf-border">
               <div className="user-rr-pdf-header">
                 <div className="user-rr-pdf-header-left">
                   <div className="user-rr-pdf-logo-icon">
                      <img src="/logo.webp" alt="Organization Logo" onError={(e) => e.target.style.display='none'} />
                   </div>
                   <div className="user-rr-pdf-org-name">
                     <h3>{currentCertText.orgNameEn || 'Nagar Nigam Gorakhpur'}</h3>
                     <h4>{currentCertText.orgNameHi || 'नगर निगम गोरखपुर'}</h4>
                   </div>
                 </div>
                 <div className="user-rr-pdf-header-right">
                    <div className="user-rr-pdf-logo-icon">
                       <img src="/up.webp" alt="State Logo" onError={(e) => e.target.style.display='none'} />
                    </div>
                 </div>
               </div>

               <div className="user-rr-pdf-certificate-title">
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

               <div className="user-rr-pdf-body">
                 <div className="user-rr-pdf-photo-section">
                   <div className="user-rr-pdf-info-block">
                     <div className="user-rr-pdf-info-row"><div className="user-rr-pdf-info-label">नाम / Name</div><div className="user-rr-pdf-info-value">: {lic.fullName || "N/A"}</div></div>
                     <div className="user-rr-pdf-info-row"><div className="user-rr-pdf-info-label">पंजीकरण संख्या / Registration No.</div><div className="user-rr-pdf-info-value">: {lic.license_Id || "N/A"}</div></div>
                     <div className="user-rr-pdf-info-row"><div className="user-rr-pdf-info-label">जारी दिनांक / Issue Date</div><div className="user-rr-pdf-info-value">: {formatDate(lic.createdAt)}</div></div>
                     <div className="user-rr-pdf-info-row"><div className="user-rr-pdf-info-label">समाप्ति तिथि / Expiry Date</div><div className="user-rr-pdf-info-value">: {expiryDate}</div></div>
                   </div>
                   <div className="user-rr-pdf-photo-box">
                     {lic.pet?.avatarUrl ? (
                       <img src={lic.pet.avatarUrl} alt="Pet" className="user-rr-pdf-photo" onError={(e) => e.target.src='https://placehold.co/100x120/e0e0e0/757575?text=No+Image'} />
                     ) : (
                       <div className="user-rr-pdf-photo-placeholder">{currentCertText.photoPlaceholder || 'Pet\'s Photo'}</div>
                     )}
                   </div>
                 </div>

                 <div className="user-rr-pdf-details-section user-rr-pdf-pet-details-section">
                   <div className="user-rr-pdf-section-title">{animalDetailsTitleBilingual}</div>
                   <div className="user-rr-pdf-details-columns">
                     <div className="user-rr-pdf-details-column-left">
                       <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{animalTypeLabelBilingual}</div><div className="user-rr-pdf-details-value">: {getAnimalLabel(lic.animalType) || "N/A"}</div></div>
                       <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.petNameLabel || 'Pet Name / पालतू जानवर का नाम'}</div><div className="user-rr-pdf-details-value">: {lic.pet?.name || "N/A"}</div></div>
                       <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.breedLabel || 'Breed / नस्ल'}</div><div className="user-rr-pdf-details-value">: {lic.pet?.breed || "N/A"}</div></div>
                       <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.categoryLabel || 'Category / वर्ग'}</div><div className="user-rr-pdf-details-value">: {lic.pet?.category || "N/A"}</div></div>
                       <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.colorLabel || 'Color / रंग'}</div><div className="user-rr-pdf-details-value">: {lic.pet?.color || "N/A"}</div></div>
                       <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.ageLabel || 'Age / आयु'}</div><div className="user-rr-pdf-details-value">: {lic.pet?.age || "N/A"}</div></div>
                     </div>
                     <div className="user-rr-pdf-details-column-right">
                       <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.genderLabel || 'Gender / लिंग'}</div><div className="user-rr-pdf-details-value">: {lic.pet?.sex || "N/A"}</div></div>
                       <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.vaccinationDateLabel || 'Vaccination Date / टीकाकरण की तारीख'}</div><div className="user-rr-pdf-details-value">: {formatDate(lic.pet?.dateOfVaccination)}</div></div>
                       <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.vaccinatedLabel || 'Vaccinated / टीकाकरण'}</div><div className="user-rr-pdf-details-value">: {lic.pet?.dateOfVaccination ? (languageType === 'hi' ? ' हाँ' : ' Yes') : (languageType === 'hi' ? ' नहीं' : ' No')}</div></div>
                       {lic.pet?.vaccinationProofUrl && (<div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.vaccinationCertificateLabel || 'Vaccination Certificate / टीकाकरण प्रमाणपत्र'}</div><div className="user-rr-pdf-details-value"><a href={lic.pet.vaccinationProofUrl} target="_blank" rel="noreferrer noopener" className="user-rr-pdf-vaccine-link">View</a></div></div>)}
                       <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.microchippedLabel || 'Microchipped / माइक्रोचिप'}</div><div className="user-rr-pdf-details-value">: {languageType === 'hi' ? 'नहीं' : 'No'}</div></div>
                       <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.nextVaccinationLabel || 'Next Vaccination / अगला टीकाकरण'}</div><div className="user-rr-pdf-details-value">: {formatDate(lic.pet?.dueVaccination)}</div></div>
                     </div>
                   </div>
                 </div>

                 <div className="user-rr-pdf-details-section user-rr-pdf-owner-details-section">
                   <div className="user-rr-pdf-section-title">{currentCertText.ownerDetailsTitle || 'Owner Details / मालिक का विवरण'}</div>
                   <div className="user-rr-pdf-owner-details-table">
                     <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.addressLabel || 'Address / पता'}</div><div className="user-rr-pdf-details-value">: {`${lic.address?.streetName || ""}, ${lic.address?.city || ""}, ${lic.address?.state || ""} - ${lic.address?.pinCode || "N/A"}`}</div></div>
                     <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.phoneNumberLabel || 'Phone Number / फोन नंबर'}</div><div className="user-rr-pdf-details-value">: {lic.phoneNumber || "N/A"}</div></div>
                     <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.numberOfAnimalsLabel(getAnimalLabel(lic.animalType))}</div><div className="user-rr-pdf-details-value">: {lic.numberOfAnimals || "N/A"}</div></div>
                     <div className="user-rr-pdf-details-row"><div className="user-rr-pdf-details-label">{currentCertText.houseAreaLabel || 'House Area / घर का क्षेत्रफल'}</div><div className="user-rr-pdf-details-value">: {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}</div></div>
                   </div>
                 </div>

                 <div className="user-rr-pdf-declaration">
                   <p>{currentCertText.declaration || <>I declare that the information provided above is true to the best of my knowledge. <b>/</b> मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।</>}</p>
                 </div>
               </div>

               <div className="user-rr-pdf-signatures">
                 <div className="user-rr-pdf-signature-block"><div className="user-rr-pdf-signature-line"></div><p>{currentCertText.applicantSignature || 'Applicant\'s Signature / आवेदक के हस्ताक्षर'}</p></div>
                 <div className="user-rr-pdf-signature-block"><div className="user-rr-pdf-signature-line"></div><p>{currentCertText.issuingAuthority || 'Issuing Authority / जारीकर्ता अधिकारी'}</p></div>
               </div>

               <div className="user-rr-pdf-footer-bottom">
                 <div className="user-rr-pdf-qr-code-area">
                   <div className="user-rr-pdf-qr-placeholder"></div>
                   <p>{currentCertText.qrCodeLabel || 'QR Code'}</p>
                 </div>
                 <div className="user-rr-pdf-stamp-area">
                   <div className="user-rr-pdf-stamp-placeholder"><p>{currentCertText.stampLabel || 'STAMP'}</p></div>
                 </div>
               </div>
               <div className="user-rr-pdf-contact-footer">
                 <span>{lic.phoneNumber || currentCertText.contactPhone || "N/A"}</span> |
                 <span>{currentCertText.contactEmail || "info@example.org"}</span> |
                 <span>{currentCertText.contactWebsite || "www.example.org"}</span> |
                 <span>{currentCertText.dateLabel || "Date:"} {currentDateOnCertificate}</span>
               </div>
             </div>
           </div>
         </div>

         {lic.status === 'renewal_pending' && (
           <div className="user-rr-notice user-rr-renewal-pending-notice">
             <AlertCircle size={18} />
             <p>{currentCertText.renewalPendingNotice || 'Your renewal request is being processed.'}</p>
           </div>
         )}

         {lic.status === 'rejected' && (
           <div className="user-rr-notice user-rr-rejected-notice">
             <XCircle size={18} />
             <div>
               <p>{currentCertText.rejectedNoticeText ? currentCertText.rejectedNoticeText(lic.rejectionDate) : `Your application was rejected on ${formatDate(lic.rejectionDate)}.`}</p>
               {lic.rejectionReason && (
                 <div className="user-rr-rejection-reason-box">
                   <strong>{currentCertText.reasonLabel || 'Reason:'}</strong> {lic.rejectionReason}
                 </div>
               )}
               <p>{currentCertText.contactSupport || 'Please contact support for more information.'}</p>
             </div>
           </div>
         )}
       </div>
    );
};

const RenewalConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  licenseNumber,
  captchaSvg,
  captchaInput,
  onCaptchaInputChange,
  loadCaptchaFn,
  captchaError,
  isConfirming,
  currentText
}) => {
  if (!isOpen) return null;

  return (
    <div className="user-rr-modal-overlay">
      <div className="user-rr-modal-content">
        <h3 className="user-rr-modal-title">{currentText.modalTitle}</h3>
        <p>{currentText.renewalConfirm(licenseNumber)} This will proceed to payment after verification.</p>

        {captchaSvg && (
          <div className="user-rr-captcha-container">
            <div className="user-rr-captcha-image-refresh">
              <div className="user-rr-captcha-svg" dangerouslySetInnerHTML={{ __html: captchaSvg }} />
              <button
                type="button"
                onClick={loadCaptchaFn}
                title={currentText.refreshCaptcha}
                className="user-rr-captcha-refresh-btn"
              >
                <RefreshCw size={22} />
              </button>
            </div>
            <input
              type="text"
              placeholder={currentText.enterCaptcha}
              value={captchaInput}
              onChange={onCaptchaInputChange}
              className="user-rr-captcha-input"
            />
          </div>
        )}

        {captchaError && <p className="user-rr-modal-error-text">{captchaError}</p>}

        <div className="user-rr-modal-actions">
          <button
            onClick={onClose}
            className="user-rr-action-button user-rr-modal-cancel-btn"
            disabled={isConfirming}
          >
            {currentText.modalCancelButton}
          </button>
          <button
            onClick={onConfirm}
            className="user-rr-action-button user-rr-modal-confirm-btn"
            disabled={isConfirming || !captchaInput}
          >
            {isConfirming ? currentText.renewalSubmissionInProgress : "Verify & Proceed to Pay"}
          </button>
        </div>
      </div>
    </div>
  );
};


const RenewRegistration = ({ languageType = 'en' }) => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [viewingLicenseId, setViewingLicenseId] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedLicenseForRenewal, setSelectedLicenseForRenewal] = useState(null);
  const [isConfirmingRenewal, setIsConfirmingRenewal] = useState(false);

  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const backendUrl = "http://localhost:5000";
  const authToken = localStorage.getItem('token');

  const textContent = {
    en: {
        pageTitle: 'Renew Pet License',
        backToList: 'Back to Licenses',
        renewalSuccessMessage: 'Your renewal request has been submitted for admin approval. You will be notified once it\'s processed.',
        renewalRequestButton: 'Back to Licenses',
        loadingLicenses: 'Loading your licenses…',
        fetchError: 'Error fetching your licenses. Please try again later.',
        noLicenses: 'You have no licenses eligible for renewal or viewing.',
        tableHeaders: { regNo: 'Reg. No', animalType: 'Animal Type', petName: 'Pet Name', lastUpdate: 'Last Update', status: 'Status', action: 'Action', view: 'View' },
        tableActions: { renew: 'Renew', submitting: 'Processing...', view: 'View', renewalRequested: 'Requested' },
        renewalConfirm: (licenseNum) => `Are you sure you want to renew license ${licenseNum}?`,
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
        numberOfAnimalsLabel: (animalType) => `No. of ${animalType}s / ${animalType} की संख्या`,
        houseAreaLabel: 'House Area / घर का क्षेत्रफल',
        animalDetailsTitleBilingual: (animalType) => `${animalType} Details / ${animalType} का विवरण`,
        contactPhone: 'N/A',
        contactEmail: 'info@example.org',
        contactWebsite: 'www.example.org',
        modalTitle: "Confirm Renewal Request",
        modalConfirmButton: "Confirm & Renew",
        modalCancelButton: "Cancel",
        enterCaptcha: "Enter CAPTCHA",
        invalidCaptcha: "Invalid CAPTCHA. Please try again.",
        failedToLoadCaptcha: "Failed to load CAPTCHA. Please refresh.",
        refreshCaptcha: "Refresh CAPTCHA",
        renewalSubmissionInProgress: "Verifying...",
    },
    hi: { /* Your hi translations */ }
  };
  const currentText = textContent[languageType] || textContent.en;

  const loadCaptcha = useCallback(() => {
    setCaptchaError("");
    setCaptchaInput("");
    setCaptchaSvg("");
    setCaptchaToken("");

    axios
      .get(`${backendUrl}/api/captcha/get-captcha`)
      .then((res) => {
        setCaptchaSvg(res.data.svg);
        setCaptchaToken(res.data.token);
      })
      .catch((err) => {
        console.error("Failed to load CAPTCHA:", err);
        setCaptchaError(currentText.failedToLoadCaptcha);
      });
  }, [currentText, backendUrl]);

  const fetchUserLicenses = useCallback(async () => {
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
      const sortedLicenses = (data || []).sort((a, b) =>
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      setLicenses(sortedLicenses);
    } catch (err) {
      setError(err.message || currentText.fetchError);
      setLicenses([]);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, authToken, currentText.fetchError]);

  useEffect(() => {
    fetchUserLicenses();
  }, [fetchUserLicenses]);

  // --- Auto-refresh on window focus ---
  useEffect(() => {
    const handleFocus = () => {
        fetchUserLicenses();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
        window.removeEventListener('focus', handleFocus);
    };
  }, [fetchUserLicenses]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenConfirmModal = (licenseId, licenseNumber) => {
    setSelectedLicenseForRenewal({ id: licenseId, number: licenseNumber });
    loadCaptcha();
    setIsConfirmModalOpen(true);
    setCaptchaError('');
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setCaptchaInput("");
    setCaptchaError("");
    setSelectedLicenseForRenewal(null);
    setIsConfirmingRenewal(false);
  };

  const handleConfirmRenewalWithPayment = async () => {
    if (!selectedLicenseForRenewal) return;

    setIsConfirmingRenewal(true);
    setCaptchaError("");
    
    try {
      // 1. Verify CAPTCHA first
      const captchaRes = await axios.post(`${backendUrl}/api/captcha/verify-captcha`, { captchaInput, captchaToken });
      if (!captchaRes.data?.success) {
        setCaptchaError(currentText.invalidCaptcha);
        loadCaptcha(); // Refresh CAPTCHA
        setIsConfirmingRenewal(false);
        return;
      }
      
      // 2. If CAPTCHA is good, close modal and call renewal initiation endpoint
      handleCloseConfirmModal();
      toast.info("CAPTCHA verified. Processing renewal...");

      const response = await axios.post(`${backendUrl}/api/license/renew-registration/request`, 
        { licenseNumber: selectedLicenseForRenewal.number },
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );

      if (response.data && response.data.paymentUrl) {
        toast.success("Redirecting to payment gateway...");
        window.open(response.data.paymentUrl, '_blank');
        console.log("Payment URL:", response.data.paymentUrl);
      } else {
        throw new Error("Failed to get payment URL from server.");
      }

    } catch (err) {
      console.error("Renewal/CAPTCHA error:", err);
      const errorMessage = err.response?.data?.message || "Renewal request failed. Please try again.";
      toast.error(errorMessage);
      handleCloseConfirmModal();
    } finally {
      setIsConfirmingRenewal(false);
    }
  };

  const toggleViewLicense = (id) => {
    setViewingLicenseId(prevId => prevId === id ? null : id);
  };

  const licenseToView = licenses.find(lic => lic._id === viewingLicenseId);

  return (
    <main className={`user-rr-page-container ${viewingLicenseId ? 'user-rr-certificate-focused-view' : ''}`}>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <header className={`user-rr-page-header ${viewingLicenseId ? 'user-rr-certificate-view-header' : ''}`}>
        {viewingLicenseId === null ? (
          <h1 className="user-rr-main-title">{currentText.pageTitle}</h1>
        ) : (
          <div className="user-rr-back-navigation">
            <button
              className="user-rr-back-button"
              onClick={() => setViewingLicenseId(null)}
            >
              <ChevronLeft size={isMobile ? 20 : 24} />
              {currentText.backToList}
            </button>
          </div>
        )}
      </header>

      {error && !loading && viewingLicenseId === null && (
          <p className="user-rr-error-message-box">{error}</p>
      )}

      {viewingLicenseId === null && (
          <>
            {loading ? (
              <div className="user-rr-loading-state">
                <div className="user-rr-spinner-animation"></div>
                <p className="user-rr-loading-text">{currentText.loadingLicenses}</p>
              </div>
            ) : licenses.length > 0 ? (
              <div className="user-rr-table-container">
                <table className="user-rr-data-table">
                  <thead>
                    <tr>
                      <th>{currentText.tableHeaders.regNo}</th>
                      {!isMobile && <th>{currentText.tableHeaders.animalType}</th>}
                      {!isMobile && <th>{currentText.tableHeaders.petName}</th>}
                      {!isMobile && <th>{currentText.tableHeaders.lastUpdate}</th>}
                      <th>{currentText.tableHeaders.status}</th>
                      <th>{currentText.tableHeaders.action}</th>
                      {!isMobile && <th>{currentText.tableHeaders.view}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map(license => (
                      <tr key={license._id} onClick={() => isMobile ? toggleViewLicense(license._id) : null} className={`user-rr-table-row ${isMobile ? 'user-rr-table-row-clickable' : ''}`}>
                        <td><div className="user-rr-table-cell-content"><FileText size={16} className="user-rr-cell-icon-style" /> {license.license_Id || "N/A"}</div></td>
                        {!isMobile && <td><div className="user-rr-table-cell-content">{getAnimalLabel(license.animalType) || "N/A"}</div></td>}
                        {!isMobile && <td><div className="user-rr-table-cell-content"><PawPrint size={16} className="user-rr-cell-icon-style" /> {license.pet?.name || "N/A"}</div></td>}
                        {!isMobile && <td><div className="user-rr-table-cell-content"><Calendar size={16} className="user-rr-cell-icon-style" /> {formatDate(license.updatedAt || license.createdAt)}</div></td>}
                        <td><div className="user-rr-table-cell-content"><StatusBadge status={license.status} isMobile={isMobile} languageType={languageType} /></div></td>
                        <td>
                          <div className="user-rr-table-cell-content">
                            {license.status === 'approved' ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenConfirmModal(license._id, license.license_Id);}}
                                className="user-rr-action-button user-rr-renew-action-btn"
                              >
                                {currentText.tableActions.renew}
                              </button>
                            ) : license.status === 'renewal_pending' ? (
                              <span className="user-rr-renewal-status-text">{currentText.tableActions.renewalRequested}</span>
                            ) : (
                              <span>-</span>
                            )}
                          </div>
                        </td>
                        {!isMobile && (
                            <td>
                                <div className="user-rr-table-cell-content">
                                <button
                                    className="user-rr-action-button user-rr-view-action-btn"
                                    onClick={(e) => { e.stopPropagation(); toggleViewLicense(license._id); }}
                                >
                                    <Eye size={16} className="user-rr-button-icon-style" />
                                    <span>{currentText.tableActions.view}</span>
                                </button>
                                </div>
                            </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !error && (
              <div className="user-rr-empty-data-state">
                <div className="user-rr-empty-state-icon"><FileText size={48} /></div>
                <p className="user-rr-no-data-text">{currentText.noLicenses}</p>
              </div>
            )}
          </>
      )}

      {viewingLicenseId !== null && licenseToView && (
          renderCertificateView(licenseToView, languageType, currentText)
      )}

      <RenewalConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmRenewalWithPayment}
        licenseNumber={selectedLicenseForRenewal?.number}
        captchaSvg={captchaSvg}
        captchaInput={captchaInput}
        onCaptchaInputChange={(e) => { setCaptchaInput(e.target.value); setCaptchaError(''); }}
        loadCaptchaFn={loadCaptcha}
        captchaError={captchaError}
        isConfirming={isConfirmingRenewal}
        currentText={currentText}
      />
    </main>
  );
};

export default RenewRegistration;