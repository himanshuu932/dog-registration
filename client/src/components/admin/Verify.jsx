import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/Verify.css'; // Dedicated CSS for Verify component
import {
  Search, User, Dog, Calendar, Phone, MapPin, Home, FileText, Award, Clock,
  CheckCircle, XCircle, AlertCircle // Added for certificate status icons
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; // Import QRCodeSVG

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
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

// VET_DETAILS for provisional licenses, as in Download.jsx
const VET_DETAILS = {
  name: "Dr. John Smith",
  clinic: "City Veterinary Hospital",
  phone: "+1 (555) 123-4567",
  address: "123 Main Street, Gorakhpur, UP 273001"
};


const renderCertificateView = (lic) => {
  const currentDateOnCertificate = new Date().toLocaleDateString('en-GB'); 
  
  // Calculate expiry date based on provisional status or vaccination date
  const expiryDate = lic.isProvisional ? 
    formatDate(lic.provisionalExpiryDate) : 
    lic.pet?.dateOfVaccination ?
      new Date(new Date(lic.pet.dateOfVaccination).setFullYear(
        new Date(lic.pet.dateOfVaccination).getFullYear() + 1
      )).toLocaleDateString('en-GB') : "N/A";

  // Construct QR code value to only use the license_Id
  const qrCodeValue = `${lic.license_Id}`;

  // Text content for the certificate (simplified to English for Verify.jsx)
  const certificateText = {
    orgNameEn: 'Nagar Nigam Gorakhpur',
    orgNameHi: 'नगर निगम गोरखपुर',
    certificateTitleEn: 'PET LICENSE CERTIFICATE',
    certificateTitleHi: 'पशु लाइसेंस प्रमाणपत्र',
    provisionalCertificateTitleEn: 'PROVISIONAL PET LICENSE CERTIFICATE',
    provisionalCertificateTitleHi: 'अस्थायी पशु लाइसेंस प्रमाणपत्र',
    dateLabel: 'Date:',
    photoPlaceholder: 'Pet\'s Photo',
    // Removed declaration text as requested
    // declaration: <>I declare that the information provided above is true to the best of my knowledge. <b>/</b> मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।</>,
    applicantSignature: 'Applicant\'s Signature / आवेदक के हस्ताक्षर',
    issuingAuthority: 'Issuing Authority / जारीकर्ता अधिकारी',
    qrCodeLabel: 'QR Code',
    officialStamp: 'OFFICIAL STAMP',
    provisionalNoticeBanner: 'PROVISIONAL LICENSE: Valid for 30 days. Rabies certification required for full license.',
    vetDetailsTitle: 'Approved Veterinary Clinic',
    vetNameLabel: 'Veterinarian:',
    vetClinicLabel: 'Clinic:',
    vetPhoneLabel: 'Contact:',
    vetAddressLabel: 'Address:',
    provisionalInstructions: 'You must visit the approved veterinary clinic within 30 days to vaccinate your pet and convert this to a full license.',
    animalTypeLabelBilingual: 'Animal Type / पशु का प्रकार',
    paymentReferenceNoLabel: 'Payment Reference No. / भुगतान संदर्भ संख्या' // Added payment reference label
  };

  const certTitleEn = lic.isProvisional ? certificateText.provisionalCertificateTitleEn : certificateText.certificateTitleEn;
  const certTitleHi = lic.isProvisional ? certificateText.provisionalCertificateTitleHi : certificateText.certificateTitleHi;

  return (
    <div className="verify-certificate-display-area"> 
      <div id={`verify-pdf-${lic._id}`} className="verify-pdf-layout">
        <div className="verify-outer-pdf-border">
          <div className="verify-pdf-border">
            <div className="verify-pdf-header">
              <div className="verify-pdf-header-left">
                <div className="verify-pdf-logo-icon">
                  {/* Placeholder for logo, replace with actual image path if available */}
                  <img src="/logo.webp" alt="Organization Logo" onError={(e) => e.target.style.display='none'} />
                </div>
                <div className="verify-pdf-org-name">
                  <h3>{certificateText.orgNameEn}</h3>
                  <h4>{certificateText.orgNameHi}</h4>
                </div>
              </div>
              <div className="verify-pdf-header-right">
                 <div className="verify-pdf-logo-icon">
                  {/* Placeholder for state logo, replace with actual image path if available */}
                  <img src="/up.webp" alt="State Logo" onError={(e) => e.target.style.display='none'} />
                </div>
              </div>
            </div>

            <div className="verify-pdf-certificate-title">
              <h2>{certTitleEn}</h2>
              <h3>{certTitleHi}</h3>
            </div>
            
            <div className="verify-pdf-body">
              <div className="verify-pdf-photo-section">
                <div className="verify-pdf-info-block">
                  <div className="verify-pdf-info-row"><div className="verify-pdf-info-label">नाम / Name</div><div className="verify-pdf-info-value">: {lic.fullName || "N/A"}</div></div>
                  <div className="verify-pdf-info-row"><div className="verify-pdf-info-label">पंजीकरण संख्या / Registration No.</div><div className="verify-pdf-info-value">: {lic.license_Id || "N/A"}</div></div>
                  <div className="verify-pdf-info-row"><div className="verify-pdf-info-label">जारी दिनांक / Issue Date</div><div className="verify-pdf-info-value">: {formatDate(lic.createdAt)}</div></div>
                  <div className="verify-pdf-info-row"><div className="verify-pdf-info-label">समाप्ति तिथि / Expiry Date</div><div className="verify-pdf-info-value">: {expiryDate}</div></div>
                </div>
                <div className="verify-pdf-photo-box">
                  {lic.pet?.avatarUrl ? (
                    <img src={lic.pet.avatarUrl} alt="Pet" className="verify-pdf-photo" onError={(e) => e.target.src='https://placehold.co/100x120/e0e0e0/757575?text=No+Image'} />
                  ) : (
                    <div className="verify-pdf-photo-placeholder">{certificateText.photoPlaceholder}</div>
                  )}
                </div>
              </div>

              {lic.isProvisional && (
                <div className="verify-pdf-details-section verify-pdf-vet-details-section">
                  <div className="verify-pdf-section-title">{certificateText.vetDetailsTitle}</div>
                  <div className="verify-pdf-details-columns">
                    <div className="verify-pdf-details-column-left">
                      <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">{certificateText.vetNameLabel}</div><div className="verify-pdf-details-value">{VET_DETAILS.name}</div></div>
                      <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">{certificateText.vetPhoneLabel}</div><div className="verify-pdf-details-value">{VET_DETAILS.phone}</div></div>
                    </div>
                    <div className="verify-pdf-details-column-right">
                      <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">{certificateText.vetClinicLabel}</div><div className="verify-pdf-details-value">{VET_DETAILS.clinic}</div></div>
                      <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">{certificateText.vetAddressLabel}</div><div className="verify-pdf-details-value">{VET_DETAILS.address}</div></div>
                    </div>
                  </div>
                  <div className="verify-pdf-provisional-instructions">
                    <p>{certificateText.provisionalInstructions}</p>
                  </div>
                </div>
              )}

              <div className="verify-pdf-details-section verify-pdf-pet-details-section">
                <div className="verify-pdf-section-title">पशु का विवरण / Pet Details</div>
                <div className="verify-pdf-details-columns">
                  <div className="verify-pdf-details-column-left">
                    <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">{certificateText.animalTypeLabelBilingual}</div><div className="verify-pdf-info-value">: {getAnimalLabel(lic.animalType) || "N/A"}</div></div>
                    <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">पशु का नाम / Pet Name</div><div className="verify-pdf-info-value">: {lic.pet?.name || "N/A"}</div></div>
                    <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">नस्ल / Breed</div><div className="verify-pdf-info-value">: {lic.pet?.breed || "N/A"}</div></div>
                    <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">वर्ग / Category</div><div className="verify-pdf-info-value">: {lic.pet?.category || "N/A"}</div></div>
                    <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">रंग / Color</div><div className="verify-pdf-info-value">: {lic.pet?.color || "N/A"}</div></div>
                    <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">आयु / Age</div><div className="verify-pdf-info-value">: {lic.pet?.age || "N/A"}</div></div>
                  </div>
                  <div className="verify-pdf-details-column-right">
                    <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">लिंग / Gender</div><div className="verify-pdf-info-value">: {lic.pet?.sex || "N/A"}</div></div>
                    <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">टीकाकरण की तारीख / Vaccination Date</div><div className="verify-pdf-info-value">: {formatDate(lic.pet?.dateOfVaccination)}</div></div>
                    <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">टीकाकरण / Vaccinated</div><div className="verify-pdf-info-value">: {lic.pet?.dateOfVaccination ? 'Yes' : 'No'}</div></div>
                    {lic.pet?.vaccinationProofUrl && (<div className="verify-pdf-details-row"><div className="verify-pdf-details-label">टीकाकरण प्रमाणपत्र / Vaccination Certificate</div><div className="verify-pdf-info-value"><a href={lic.pet.vaccinationProofUrl} target="_blank" rel="noreferrer noopener" className="verify-pdf-vaccine-link">View</a></div></div>)}
                    <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">माइक्रोचिप / Microchipped</div><div className="verify-pdf-info-value">: No</div></div>
                    <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">अगला टीकाकरण / Next Vaccination</div><div className="verify-pdf-info-value">: {formatDate(lic.pet?.dueVaccination)}</div></div>
                  </div>
                </div>
              </div>

              <div className="verify-pdf-details-section verify-pdf-owner-details-section">
                <div className="verify-pdf-section-title">मालिक का विवरण / Owner Details</div>
                <div className="verify-pdf-owner-details-table">
                  <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">पता / Address</div><div className="verify-pdf-info-value">: {`${lic.address?.streetName || ""}, ${lic.address?.city || ""}, ${lic.address?.state || ""} - ${lic.address?.pinCode || "N/A"}`}</div></div>
                  <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">फोन नंबर / Phone Number</div><div className="verify-pdf-info-value">: {lic.phoneNumber || "N/A"}</div></div>
                  <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">{`जानवरों की संख्या / No. of ${getAnimalLabel(lic.animalType)}s`}</div><div className="verify-pdf-info-value">:{lic.numberOfAnimals || "N/A"}</div></div>
                  <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">घर का क्षेत्रफल / House Area</div><div className="verify-pdf-info-value">: {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}</div></div>
                  {/* Added Payment Reference No. similar to PdfDownloadView.jsx */}
                  <div className="verify-pdf-details-row">
                    <div className="verify-pdf-details-label">{certificateText.paymentReferenceNoLabel}</div>
                    <div className="verify-pdf-info-value">: {lic.paymentReferenceNo || "N/A"}</div>
                  </div>
                </div>
              </div>

              {/* Removed Declaration as requested
              <div className="verify-pdf-declaration"><p>{certificateText.declaration}</p></div>
              */}
            </div>

            {/* Removed Signatures block as requested
            <div className="verify-pdf-signatures">
              <div className="verify-pdf-signature-block"><div className="verify-pdf-signature-line"></div><p>{certificateText.applicantSignature}</p></div>
              <div className="verify-pdf-signature-block"><div className="verify-pdf-signature-line"></div><p>{certificateText.issuingAuthority}</p></div>
            </div>
            */}

            <div className="verify-pdf-footer-bottom">
              <div className="verify-pdf-qr-code-area">
                {/* Replaced placeholder with QRCodeSVG component */}
                <QRCodeSVG value={qrCodeValue} size={65} level="H" /> 
                <p>{certificateText.qrCodeLabel}</p>
              </div>
              {lic.isProvisional && (
              <div className="verify-pdf-provisional-notice-banner">
                <AlertCircle size={14} /> 
                <span>{certificateText.provisionalNoticeBanner}</span>
              </div>
            )}
              <div className="verify-pdf-stamp-area">
                <div className="verify-pdf-stamp-placeholder"><p>{certificateText.officialStamp}</p></div>
              </div>
            </div>
            <div className="verify-pdf-contact-footer">
              1234  |  info@awbi.org  |  www.awbi.org | <span>{certificateText.dateLabel} {currentDateOnCertificate}</span>
            </div>
          </div> 
        </div> 
      </div> 
    </div> 
  );
};


const Verify = () => {
  const [licenseIdInput, setLicenseIdInput] = useState('');
  const [fetchedLicense, setFetchedLicense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const backend = "http://localhost:5000";
  // Assuming token is stored in localStorage and available for admin endpoint
  const token = localStorage.getItem("token"); 

  const handleInputChange = (e) => {
    setLicenseIdInput(e.target.value);
    setFetchedLicense(null); // Clear previous results
    setError(''); // Clear previous errors
  };

  const handleFetchLicense = async () => {
    if (!licenseIdInput.trim()) {
      toast.error("Please enter a License ID.");
      setError("Please enter a License ID.");
      return;
    }

    setLoading(true);
    setFetchedLicense(null);
    setError('');

    try {
      // Using the /api/admin endpoint with Authorization header as specified
      const res = await axios.get(`${backend}/api/admin/${licenseIdInput}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFetchedLicense(res.data);
      toast.success("License fetched successfully!");
    } catch (err) {
      console.error("Error fetching license:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch license. Please check the ID.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-license-container">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <h2 className="verify-page-title">
        <Search className="verify-title-icon" /> Verify License
      </h2>

      <div className="verify-input-section">
        <div className="verify-input-group">
          <label htmlFor="licenseId">Enter License ID:</label>
          <input
            type="text"
            id="licenseId"
            value={licenseIdInput}
            onChange={handleInputChange}
            placeholder="e.g., 2505151940387977"
            className="verify-id-input"
          />
        </div>
        <button onClick={handleFetchLicense} className="verify-fetch-button" disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch License'}
        </button>
      </div>

      {error && (
        <div className="verify-error-message">
          {error}
        </div>
      )}

      {fetchedLicense && (
        // Render the certificate view if a license is fetched
        renderCertificateView(fetchedLicense)
      )}
    </div>
  );
};

export default Verify;