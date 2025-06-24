import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Don't forget to import the CSS!
import { ShieldCheck, Search, User, Dog, Calendar, Phone, MapPin, Home, FileText, Award, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; // Import QRCodeSVG
import './styles/UpdateProvisional.css'; // Make sure this CSS file is in a 'styles' folder relative to this component

// Helper functions (duplicated from Verify.jsx and PdfDownloadView.jsx for self-containment)
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

const VET_DETAILS = {
  name: "Dr. John Smith",
  clinic: "City Veterinary Hospital",
  phone: "+1 (555) 123-4567",
  address: "123 Main Street, Gorakhpur, UP 273001"
};

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
    provisionalNoticeBanner: 'PROVISIONAL LICENSE: Valid for 30 days. Rabies certification required for full license.',
    vetDetailsTitle: 'Approved Veterinary Clinic',
    vetNameLabel: 'Veterinarian:',
    vetClinicLabel: 'Clinic:',
    vetPhoneLabel: 'Contact:',
    vetAddressLabel: 'Address:',
    provisionalInstructions: 'You must visit the approved veterinary clinic within 30 days to vaccinate your pet and convert this to a full license.',
    animalTypeLabelBilingual: 'Animal Type / पशु का प्रकार',
    paymentReferenceNoLabel: 'Payment Reference No. / भुगतान संदर्भ संख्या'
  }
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

  const currentCertText = certificateText.en; // Using English for simplicity in this component

  const certTitleEn = lic.isProvisional ? currentCertText.provisionalCertificateTitleEn : currentCertText.certificateTitleEn;
  const certTitleHi = lic.isProvisional ? currentCertText.provisionalCertificateTitleHi : currentCertText.certificateTitleHi;

  return (
    <div className="update-provisional-certificate-display-area"> 
      <div className="verify-pdf-layout"> {/* Reusing verify-pdf-layout for consistent styling */}
        <div className="verify-outer-pdf-border">
          <div className="verify-pdf-border">
            <div className="verify-pdf-header">
              <div className="verify-pdf-header-left">
                <div className="verify-pdf-logo-icon">
                  <img src="/logo.webp" alt="Organization Logo" onError={(e) => e.target.style.display='none'} />
                </div>
                <div className="verify-pdf-org-name">
                  <h3>{currentCertText.orgNameEn}</h3>
                  <h4>{currentCertText.orgNameHi}</h4>
                </div>
              </div>
              <div className="verify-pdf-header-right">
                 <div className="verify-pdf-logo-icon">
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
                    <div className="verify-pdf-photo-placeholder">{currentCertText.photoPlaceholder}</div>
                  )}
                </div>
              </div>

              {lic.isProvisional && (
                <div className="verify-pdf-details-section verify-pdf-vet-details-section">
                  <div className="verify-pdf-section-title">{currentCertText.vetDetailsTitle}</div>
                  <div className="verify-pdf-details-columns">
                    <div className="verify-pdf-details-column-left">
                      <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">{currentCertText.vetNameLabel}</div><div className="verify-pdf-details-value">{VET_DETAILS.name}</div></div>
                      <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">{currentCertText.vetPhoneLabel}</div><div className="verify-pdf-details-value">{VET_DETAILS.phone}</div></div>
                    </div>
                    <div className="verify-pdf-details-column-right">
                      <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">{currentCertText.vetClinicLabel}</div><div className="verify-pdf-details-value">{VET_DETAILS.clinic}</div></div>
                      <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">{currentCertText.vetAddressLabel}</div><div className="verify-pdf-details-value">{VET_DETAILS.address}</div></div>
                    </div>
                  </div>
                  <div className="verify-pdf-provisional-instructions">
                    <p>{currentCertText.provisionalInstructions}</p>
                  </div>
                </div>
              )}

              <div className="verify-pdf-details-section verify-pdf-pet-details-section">
                <div className="verify-pdf-section-title">पशु का विवरण / Pet Details</div>
                <div className="verify-pdf-details-columns">
                  <div className="verify-pdf-details-column-left">
                    <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">{currentCertText.animalTypeLabelBilingual}</div><div className="verify-pdf-info-value">: {getAnimalLabel(lic.animalType) || "N/A"}</div></div>
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
                  <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">पता / Address</div><div className="verify-pdf-details-value">: {`${lic.address?.streetName || ""}, ${lic.address?.city || ""}, ${lic.address?.state || ""} - ${lic.address?.pinCode || "N/A"}`}</div></div>
                  <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">फोन नंबर / Phone Number</div><div className="verify-pdf-details-value">: {lic.phoneNumber || "N/A"}</div></div>
                  <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">{`जानवरों की संख्या / No. of ${getAnimalLabel(lic.animalType)}s`}</div><div className="verify-pdf-details-value">:{lic.numberOfAnimals || "N/A"}</div></div>
                  <div className="verify-pdf-details-row"><div className="verify-pdf-details-label">घर का क्षेत्रफल / House Area</div><div className="verify-pdf-details-value">: {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}</div></div>
                  <div className="verify-pdf-details-row">
                    <div className="verify-pdf-details-label">{currentCertText.paymentReferenceNoLabel}</div>
                    <div className="verify-pdf-details-value">: {lic.paymentReferenceNo || "N/A"}</div>
                  </div>
                </div>
              </div>

              {/* Removed Declaration as requested */}
              {/* <div className="verify-pdf-declaration"><p>{currentCertText.declaration}</p></div> */}
            </div>

            {/* Removed Signatures block as requested */}
            {/* <div className="verify-pdf-signatures">
              <div className="verify-pdf-signature-block"><div className="verify-pdf-signature-line"></div><p>{currentCertText.applicantSignature}</p></div>
              <div className="verify-pdf-signature-block"><div className="verify-pdf-signature-line"></div><p>{currentCertText.issuingAuthority}</p></div>
            </div>
            */}

            <div className="verify-pdf-footer-bottom">
              <div className="verify-pdf-qr-code-area">
                {lic.license_Id && (
                    <QRCodeSVG 
                        value={lic.license_Id} // Changed to use only license_Id as requested
                        size={50}
                        level="H"
                        includeMargin={false}
                    />
                )}
                <p>{currentCertText.qrCodeLabel}</p>
              </div>
              {lic.isProvisional && (
              <div className="verify-pdf-provisional-notice-banner">
                <AlertCircle size={14} /> 
                <span>{currentCertText.provisionalNoticeBanner}</span>
              </div>
            )}
              <div className="verify-pdf-stamp-area">
                <div className="verify-pdf-stamp-placeholder"><p>{currentCertText.officialStamp}</p></div>
              </div>
            </div>
            <div className="verify-pdf-contact-footer">
              1234  |  info@awbi.org  |  www.awbi.org | <span>{currentCertText.dateLabel} {currentDateOnCertificate}</span>
            </div>
          </div> 
        </div> 
      </div> 
    </div> 
  );
};


const UpdateProvisional = () => {
    const [licenseIdInput, setLicenseIdInput] = useState('');
    const [fetchedLicense, setFetchedLicense] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [updatedLicense, setUpdatedLicense] = useState(null); // For displaying after successful update

    const backend = "http://localhost:5000";
    const token = localStorage.getItem("token");

    const handleInputChange = (e) => {
        setLicenseIdInput(e.target.value.toUpperCase());
        setFetchedLicense(null); // Clear previous results when input changes
        toast.dismiss(); // Dismiss any existing toasts
        setUpdatedLicense(null);
    };

    const handleFetchLicense = async () => {
        if (!licenseIdInput.trim()) {
            toast.error("Please enter a Provisional License ID.");
            return;
        }

        // Only fetch if it's a provisional license
        if (!licenseIdInput.toUpperCase().startsWith('PL')) {
            toast.error('Please enter a valid Provisional License ID (e.g., PL123).');
            return;
        }

        setIsLoading(true);
        setFetchedLicense(null); // Clear any previously fetched license
        toast.dismiss(); // Dismiss any existing toasts
        setUpdatedLicense(null);

        try {
            const res = await axios.get(`${backend}/api/admin/${licenseIdInput}`, { // Assuming a new endpoint for fetching single license by ID
                headers: { Authorization: `Bearer ${token}` },
            });
            
            // --- MODIFIED LOGIC AS PER YOUR REQUEST ---
            console.log("Fetched License Data:", res.data); // Log the entire data for inspection
            console.log("isProvisional status:", res.data.isProvisional); // Log the specific property
            
            // Ensure the fetched license is provisional before displaying
            if (res.data && res.data.isProvisional) { // Direct check on res.data.isProvisional
                setFetchedLicense(res.data); // Set the entire res.data as the license
                toast.success("Provisional License details fetched successfully!");
            } else {
                toast.error('License found but it is not a Provisional License or invalid.');
            }
        } catch (err) {
            console.error("Error fetching license:", err);
            const errorMessage = err.response?.data?.message || "Failed to fetch license. Please check the ID.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpgradeLicense = async (e) => {
        e.preventDefault();
        toast.dismiss(); // Dismiss any existing toasts
        setUpdatedLicense(null);

        if (!fetchedLicense || !fetchedLicense.isProvisional) {
            toast.error('No provisional license selected for upgrade or it\'s already a full license.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${backend}/api/admin/update-provisional`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ licenseId: fetchedLicense.license_Id })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update license status.');
            }

            toast.success(data.message);
            setUpdatedLicense(data.license); // Store the updated license details
            setLicenseIdInput(''); // Clear input on success
            setFetchedLicense(null); // Clear the displayed provisional license

        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="update-provisional-container">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            <div className="update-provisional-card">
                <h1 className="update-provisional-title"><Search className="update-title-icon" /> Update Provisional License</h1>
                <p className="update-provisional-subtitle">
                    Enter a Provisional License ID (PL) to view details and convert it to a Full License (FL).
                </p>

                <div className="update-input-section">
                    <div className="form-group">
                        <label htmlFor="licenseId">Provisional License ID</label>
                        <input
                            type="text"
                            id="licenseId"
                            name="licenseId"
                            value={licenseIdInput}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="e.g., PL12345"
                            required
                        />
                    </div>
                    <button 
                        onClick={handleFetchLicense} 
                        className="btn-fetch" 
                        disabled={isLoading || !licenseIdInput.trim() || !licenseIdInput.toUpperCase().startsWith('PL')}
                    >
                        {isLoading ? 'Fetching...' : 'Fetch Details'}
                    </button>
                </div>
                
                {/* Message display handled by react-toastify */}

                {/* Display fetched provisional license details */}
                {fetchedLicense && (
                    <div className="provisional-details-section">
                        <h2>Provisional License Details</h2>
                        {renderCertificateView(fetchedLicense)}

                        {/* Upgrade button for the fetched provisional license */}
                        <form onSubmit={handleUpgradeLicense} className="upgrade-form">
                            <button 
                                type="submit" 
                                className="btn-submit" 
                                disabled={isLoading || fetchedLicense.status !== 'approved'} // Disabled if loading OR status is not 'approved'
                            >
                                {isLoading ? 'Upgrading...' : 'Upgrade to Full License'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Display updated license details after successful upgrade */}
                {updatedLicense && (
                    <div className="updated-license-details">
                         <div className="success-icon">
                            <ShieldCheck size={48} />
                        </div>
                        <h3>Update Successful</h3>
                        <p><strong>New License ID:</strong> {updatedLicense.license_Id}</p>
                        <p><strong>Status:</strong> <span className="status-approved">{updatedLicense.status}</span></p>
                        <p><strong>Is Provisional:</strong> {updatedLicense.isProvisional ? 'Yes' : 'No'}</p>
                        <p><strong>New Expiry Date:</strong> {new Date(updatedLicense.expiryDate).toLocaleDateString()}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateProvisional;