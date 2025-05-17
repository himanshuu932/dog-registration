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

// Helper component for status badges (inspired by Download.jsx)
const StatusBadge = ({ status, isMobile }) => { // Added isMobile prop
  let badgeClass = "rr-status-badge";
  let Icon = AlertCircle;
  let iconColor = 'var(--rr-warning)'; // Using a new variable for warning color

  switch(status.toLowerCase()) {
    case 'approved':
      badgeClass += " rr-status-approved";
      Icon = CheckCircle;
      iconColor = 'var(--rr-success)'; // Using a new variable for success color
      break;
    case 'renewal_pending':
      badgeClass += " rr-status-pending";
      Icon = AlertCircle; // Using AlertCircle for pending/already applied
      iconColor = 'var(--rr-warning)';
      break;
    default:
      badgeClass += " rr-status-default";
      iconColor = 'var(--rr-dark)'; // Using a new variable for dark color
  }

  return (
    <span className={badgeClass}>
      <Icon size={16} style={{ color: iconColor }} />
      {!isMobile && <span>{status === 'renewal_pending' ? 'Already Applied' : status}</span>} {/* Display 'Already Applied' for renewal_pending */}
    </span>
  );
};

// Helper function to render the certificate view (copied from Download.jsx)
const renderCertificateView = (lic, isMobile, downloadPDF) => {
    const currentDate = new Date().toLocaleDateString('en-GB');

    const expiryDate = lic.dog?.dateOfVaccination ?
      new Date(new Date(lic.dog.dateOfVaccination).setFullYear(
        new Date(lic.dog.dateOfVaccination).getFullYear() + 1
      )).toLocaleDateString('en-GB') : "N/A";

      return (
           <div className="rr-certificate-view"> {/* Changed class prefix */}
              <div id={`pdf-${lic._id}`} className="pdf-layout">
                <div className="pdf-border">
                  <div className="pdf-header">
                    <div className="pdf-header-left">
                      <div className="pdf-logo-icon">
                         <img src="./logo.webp" alt="Organization Logo"></img> {/* Added alt text */}
                      </div>
                      <div className="pdf-org-name">
                        <h3>Nagar Nigam Gorakhpur</h3>
                        <h4>नगर निगम गोरखपुर</h4>
                      </div>
                    </div>
                    <div className="pdf-header-right">
                      <div className="pdf-date">
                        <span> Date: {currentDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pdf-certificate-title">
                    <h2>OFFICIAL DOG LICENSE CERTIFICATE</h2>
                    <h3>कुत्तों के पंजीकरण के लिए अधिकृत पत्र</h3>
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
                          <div className="pdf-photo-placeholder">प पशु की तस्वीर / Dog's Photo</div>
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
                      <p>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।  <b>/</b> I declare that the information provided above is true to the best of my knowledge.</p>
                    </div>

                    <div className="pdf-signatures">
                      <div className="pdf-signature-block">
                        <div className="pdf-signature-line"></div>
                        <p>आवेदक के हस्ताक्षर / Applicant's Signature</p>
                      </div>
                      <div className="pdf-signature-block">
                        <div className="pdf-signature-line"></div>
                        <p>जारीकर्ता अधिकारी / Issuing Authority</p>
                      </div>
                    </div>

                    <div className="pdf-footer">
                          <div className="pdf-qr-code">
                             <div className="pdf-qr-placeholder"></div>
                            <p>QR Code</p>
                          </div>
                           <div className="pdf-stamp">
                                <div className="pdf-stamp-placeholder">
                                    <p>OFFICIAL STAMP</p>
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
                      <span>Download PDF</span>
                    </button>
                  )}

                  {/* Pending/Rejected notices (optional, depending on if you want to show them in this view) */}
                  {lic.status === 'pending' && (
                    <div className="rr-pending-notice"> {/* Changed class prefix */}
                      <AlertCircle size={18} />
                      <p>Your application is under review. You will be able to download the license once approved.</p>
                    </div>
                  )}

  {lic.status === 'rejected' && (
  <div className="rr-rejected-notice"> {/* Changed class prefix */}
    <XCircle size={18} />
    <div>
      <p>Your application has been rejected on {formatDate(lic.rejectionDate)}.</p>
      {lic.rejectionReason && (
        <div className="rr-rejection-reason"> {/* Changed class prefix */}
          <strong>Reason:</strong> {lic.rejectionReason}
        </div>
      )}
      <p>Please contact support for more information.</p>
    </div>
  </div>
)}
           </div>
      );
   };


const RenewRegistration = () => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [searchedLicense, setSearchedLicense] = useState(null); // Renamed to avoid conflict
  const [successfulLicenses, setSuccessfulLicenses] = useState([]); // State for the list of successful licenses
  const [loadingSearch, setLoadingSearch] = useState(false); // Loading state for search by number
  const [loadingLicenses, setLoadingLicenses] = useState(true); // Loading state for fetching list
  const [renewalLoading, setRenewalLoading] = useState(false); // Loading state for renewal request
  const [requestSubmitted, setRequestSubmitted] = useState(false); // State for successful renewal request submission
  const [searchError, setSearchError] = useState(''); // Error for search by number
  const [listError, setListError] = useState(''); // Error for fetching list
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // State for mobile view
  const [viewingLicenseId, setViewingLicenseId] = useState(null); // State to track which license's certificate is being viewed

  const backend = "https://dog-registration.onrender.com";
  const token = localStorage.getItem('token');

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
        const approvedLicenses = data.filter(lic => lic.status === 'approved' || lic.status === 'renewal_pending');
        approvedLicenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setSuccessfulLicenses(approvedLicenses || []);
      } catch (err) {
        setListError(err.message || 'Error fetching your licenses. Please try again.');
        setSuccessfulLicenses([]); // Clear list on error
      } finally {
        setLoadingLicenses(false);
      }
    };

    fetchSuccessfulLicenses();
  }, [backend, token, requestSubmitted]); // Refetch list after a successful renewal request

  // Handle search for a specific license by number
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchedLicense(null); // Clear previous search result
    setLoadingSearch(true);
    setRequestSubmitted(false); // Reset request submitted status
    setViewingLicenseId(null); // Close certificate view if open

    if (!licenseNumber) {
        setSearchError('Please enter a license number.');
        setLoadingSearch(false);
        return;
    }

    try {
      // Using the existing endpoint, assuming it can also return details for an approved license
      const response = await fetch(
        `${backend}/api/license/renew-registration?licenseNumber=${encodeURIComponent(licenseNumber)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch license');
      }

      if (data.license) {
         // Check if the fetched license is approved or renewal_pending to be eligible for display/renewal
         if (data.license.status === 'approved' || data.license.status === 'renewal_pending') {
             setSearchedLicense(data.license);
         } else {
             // Handle cases where status is pending or rejected via search
             let errorMessage = 'License found, but cannot be renewed.';
             if (data.license.status === 'pending') {
                 errorMessage = 'Your license application is still under review. You can only request a renewal after it has been approved.';
             } else if (data.license.status === 'rejected') {
                 errorMessage = 'Your license application was rejected. You need to apply for a new registration to proceed.';
             }
             setSearchError(errorMessage);
             setSearchedLicense(null);
         }
      } else {
        setSearchError('License not found with this number.');
        setSearchedLicense(null);
      }

    } catch (err) {
      setSearchError(err.message || 'Error fetching data. Please try again.');
      setSearchedLicense(null);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handle renewal request for a license from the list or search result
  const handleRenewRequest = async (licenseIdToRenew) => {
      // Show confirmation dialog
      const isConfirmed = window.confirm(`Are you sure you want to request renewal for license number ${licenseIdToRenew}?`);

      if (!isConfirmed) {
          return; // Stop if user cancels
      }

    setSearchError(''); // Clear search error
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
      setSearchedLicense(null); // Clear the searched license details after successful request
      setLicenseNumber(''); // Clear the input field
      setViewingLicenseId(null); // Close certificate view if open after successful renewal
      // The useEffect will refetch the list and update the status for the renewed license
    } catch (err) {
      // Display error based on where the renewal was initiated from if needed,
      // but for simplicity, we'll use a general error state or refine later.
      setSearchError(err.message || 'Renewal request failed. Please try again.');
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

    html2pdf().from(element).set(opt).save().then(() => {
      // Remove the class after PDF generation
      element.classList.remove('force-desktop-pdf-layout');
    });
  };


  // Find the license being viewed
  const licenseToView = successfulLicenses.find(lic => lic._id === viewingLicenseId);


  return (
    <main className="rr-container">
      {/* Header section */}
       <header className="rr-header"> {/* Added header class */}
            {viewingLicenseId === null ? (
               <h1 className="rr-title">Renew Registration</h1>
            ) : (
                <div className="rr-back-to-list-header"> {/* Added back button header class */}
                     <button
                         className="rr-back-to-list-btn" // Added back button class
                         onClick={() => setViewingLicenseId(null)} // Set viewingLicenseId to null to go back
                     >
                        <ChevronLeft size={24} />
                        Back to List
                     </button>
                </div>
            )}
       </header>


      {requestSubmitted ? (
        <div className="rr-success-container">
          <p className="rr-success">
            Your renewal request has been submitted for admin approval.
          </p>
          <p>You will be notified once it's processed.</p>
          <button
            className="rr-button"
            onClick={() => {
              setRequestSubmitted(false);
              setLicenseNumber('');
              setSearchedLicense(null); // Also clear searched license
            }}
          >
            Request Another Renewal
          </button>
        </div>
      ) : (
        <>
          {/* Section for searching by license number - Hidden when viewing a certificate */}
          {viewingLicenseId === null && (
              <section className="rr-section">
                 <h2 className="rr-subtitle">Search by License Number</h2>
                  <form onSubmit={handleSearch} className="rr-search-form" noValidate>
                    <label htmlFor="licenseNumber" className="rr-label">
                      Enter License Number
                    </label>
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      className="rr-input"
                      value={licenseNumber}
                      onChange={e => setLicenseNumber(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="rr-button"
                      disabled={loadingSearch}
                    >
                      {loadingSearch ? 'Searching...' : 'Search'}
                    </button>
                  </form>

                  {loadingSearch && <p className="rr-status">Searching…</p>}
                  {searchError && <p className="rr-error">{searchError}</p>}

                  {searchedLicense && (
                    <section className="rr-card rr-searched-license-card">
                      <h3 className="rr-card-title">License Details</h3>
                      <dl>
                        <div className="rr-row">
                          <dt>Dog Name</dt>
                          <dd>{searchedLicense.dog?.name || 'N/A'}</dd>
                        </div>
                        <div className="rr-row">
                          <dt>License No.</dt>
                          <dd>{searchedLicense.license_Id || 'N/A'}</dd>
                        </div>
                        <div className="rr-row">
                          <dt>Applied Date</dt>
                          <dd>{formatDate(searchedLicense.createdAt)}</dd>
                        </div>
                        <div className="rr-row">
                          <dt>Current Status</dt>
                          <dd><StatusBadge status={searchedLicense.status} isMobile={isMobile} /></dd> {/* Pass isMobile */}
                        </div>
                        {/* Display renew button if status is approved */}
                        {searchedLicense.status === 'approved' && (
                             <div className="rr-row rr-row-action">
                                 <dt>Action</dt>
                                 <dd>
                                     <button
                                         onClick={() => handleRenewRequest(searchedLicense.license_Id)}
                                         className="rr-button rr-button--renew"
                                         disabled={renewalLoading}
                                     >
                                         {renewalLoading ? 'Submitting...' : 'Request Renewal'}
                                     </button>
                                 </dd>
                             </div>
                         )}
                    </dl>
                    </section>
                  )}
              </section>
          )}


          {/* Section for displaying the list of successful licenses in a table - Hidden when viewing a certificate */}
          {viewingLicenseId === null && (
              <section className="rr-section rr-successful-licenses-section">
                <h2 className="rr-subtitle">Your Approved Licenses</h2>

                {loadingLicenses ? (
                  <div className="rr-loading">
                    <div className="rr-spinner"></div>
                    <p className="rr-status">Loading your licenses…</p>
                  </div>
                ) : listError ? (
                  <p className="rr-error">{listError}</p>
                ) : successfulLicenses.length > 0 ? (
                  <div className="rr-table-container"> {/* Use the table container class */}
                   <table className="rr-license-table"> {/* Use the table class */}
                      <thead>
                         <tr>
                            <th>Reg. No</th>
                            {!isMobile && <th>Dog Name</th>} {/* Hide on mobile */}
                            {!isMobile && <th>Applied Date</th>} {/* Hide on mobile */}
                            <th>Status</th>
                            <th>Action</th>
                            <th>View</th> {/* Added View column */}
                         </tr>
                      </thead>
                      <tbody>
                         {successfulLicenses.map(license => (
                            <tr key={license._id}> {/* No click handler for row in this view */}
                                <td><div className="rr-cell rr-reg-no-cell">{license.license_Id || "N/A"}</div></td>
                                {!isMobile && <td><div className="rr-cell rr-dog-cell">{license.dog?.name || "N/A"}</div></td>} {/* Hide on mobile */}
                                {!isMobile && <td><div className="rr-cell rr-date-cell"><Calendar size={16} className="rr-cell-icon" /> {formatDate(license.createdAt)}</div></td>} {/* Hide on mobile */}
                                <td><div className="rr-cell rr-status-cell"><StatusBadge status={license.status} isMobile={isMobile} /></div></td> {/* Pass isMobile */}
                               <td>
                                    <div className="rr-cell rr-action-cell">
                                        {/* Show Renew button only if status is approved */}
                                        {license.status === 'approved' ? (
                                            <button
                                                onClick={() => handleRenewRequest(license.license_Id)}
                                                className="rr-button rr-button--renew rr-button--small"
                                                disabled={renewalLoading}
                                            >
                                                {renewalLoading ? 'Submitting...' : 'Renew'}
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
                                            className="rr-view-btn" // Added view button class
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent row click
                                                setViewingLicenseId(license._id); // Set the license ID to view
                                            }}
                                          >
                                              <Eye size={16} className="rr-btn-icon" /> {!isMobile && 'View'}
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
                     <p className="rr-no-data">You have no approved licenses yet.</p>
                  </div>
                )}
              </section>
          )}

          {/* Section for displaying the certificate view - Only shown when viewingLicenseId is set */}
          {viewingLicenseId !== null && licenseToView && (
              <section className="rr-section rr-certificate-section"> {/* Added certificate section class */}
                  {/* Render the certificate view using the helper function */}
                  {renderCertificateView(licenseToView, isMobile, downloadPDF)}
              </section>
          )}
        </>
      )}
    </main>
  );
};

export default RenewRegistration;