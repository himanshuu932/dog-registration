import React, { useEffect, useState } from "react"; // Removed useRef
import axios from "axios";
import "./styles/AdminPanel.css"; // Ensure the CSS file is correctly linked
import {
  Dog,
  User,
  Calendar,
  Phone,
  MapPin,
  Home,
  Check,
  X,
  Eye,
  EyeOff, // Keep EyeOff icon just in case, but it might not be used in the UI
  FileText,
  Award,
  Syringe, // Kept for vaccination
  Stamp, // Kept for official stamp
  Globe, // Kept for website
  ChevronLeft, // Added for back button
  LayoutList, // Added for All category icon
} from "lucide-react";

const AdminPanel = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  // State to hold the ID of the currently expanded row (for single expansion)
  const [expandedRowId, setExpandedRowId] = useState(null);
  // State to track if the certificate view is active for the expanded row
  const [certificateView, setCertificateView] = useState({});
  const [activeTab, setActiveTab] = useState('new');


  // State for mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const filteredLicenses = licenses.filter(lic => {
  switch(activeTab) {
    case 'all': // Added 'all' case
        return true; // Show all licenses
    case 'new':
      return lic.status === 'pending';
    case 'renewals':
      return lic.status === 'renewal_pending';
    case 'approved':
      return lic.status === 'approved';
    case 'rejected':
      return lic.status === 'rejected';
    default:
      return true; // Default to showing all licenses if activeTab is unknown
  }
});

  // Removed: Ref for the admin panel element (not needed without resizing)
  // const adminPanelRef = useRef(null);

  // Removed: Handlers for resizing (not needed without resizing)
  // const startResizing = (e) => { ... };

  // Effect to update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      const mobileNow = window.innerWidth <= 768;
      setIsMobile(mobileNow);
      // No layout adjustments needed here anymore, CSS handles desktop/mobile grid
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // No dependency on expandedRowId needed here anymore

  const backend = "https://dog-registration.onrender.com";
  const token = localStorage.getItem("token");

  const fetchLicenses = async () => {
    try {
      const res = await axios.get(`${backend}/api/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLicenses(res.data);
    } catch (err) {
      alert("Failed to load licenses");
    } finally {
      setLoading(false);
    }
  };



// const fetchPendingRenewals = async () => {
//   try {
//     console.log("Fetching pending renewals..."); // Add this
//     const res = await axios.get(`${backend}/api/admin/renewals/pending`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     console.log("Renewals response:", res.data); // Add this
//     setPendingRenewals(res.data.pendingRenewals);
//   } catch (err) {
//     console.error("Error fetching renewals:", err.response?.data || err.message); // Enhanced error logging
//     alert("Failed to load pending renewals");
//   }
// };

  const updateStatus = async (id, action) => {
    try {
      await axios.patch(`${backend}/api/admin/${action}/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`License ${action}d`);
      fetchLicenses(); // refresh
       // If the updated license is currently expanded, trigger a re-render of details
       if (expandedRowId === id) {
           // A simple way to trigger re-render is to just update the licenses state,
           // which fetchLicenses() already does.
       }
    } catch (err) {
      alert("Failed to update license status");
    }
  };

const handleRenewalDecision = async (id, action, reason = '') => {
  try {
    const endpoint = action === 'approve'
      ? `${backend}/api/admin/renew-registration/approve`
      : `${backend}/api/admin/renew-registration/reject`;

    await axios.post(endpoint,
      { licenseId: id, ...(action === 'reject' && { reason }) },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(`Renewal ${action}d`);
    fetchLicenses(); // Refresh the main list
  } catch (err) {
    alert(`Failed to ${action} renewal`);
  }
};

  // Modified toggleExpanded for single row expansion
  const toggleExpanded = (id) => {
      if (expandedRowId === id) {
          // If clicking the already expanded row, collapse it
          setExpandedRowId(null);
          setCertificateView({}); // Also reset certificate view
      } else {
          // If clicking a different row, expand it
          setExpandedRowId(id);
          setCertificateView({ [id]: false }); // Default to standard view
      }
  };


  const toggleCertificateView = (id) => {
    setCertificateView((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const selectedLicense = licenses.find(lic => lic._id === expandedRowId);
  // Removed: isTwoColumnLayout state and calculation
  // const isTwoColumnLayout = expandedRowId !== null && !isMobile;


  const renderStandardView = (lic) => {
    return (
      <div className="license-details standard-form-view">
         {/* Mobile Actions Bar (Visible on mobile, when status is pending) */}
         {/* Show pending actions ONLY on mobile AND if status is pending */}
        {isMobile && (lic.status === 'pending' || lic.status === 'renewal_pending') && (
             <div className="mobile-details-actions">
                 {(lic.status === "pending" || lic.status === "renewal_pending") && (
                        <>
                          <button
                            className="btn-approve"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (lic.status === 'renewal_pending') {
                                handleRenewalDecision(lic._id, "approve");
                              } else {
                                updateStatus(lic._id, "approve");
                              }
                            }}
                          >
                            <Check size={16} className="btn-icon" /> Approve
                          </button>
                          <button
                            className="btn-reject"
                            onClick={(e) => {
                              e.stopPropagation();
                              const reason = prompt('Enter rejection reason:');
                              if (reason) {
                                if (lic.status === 'renewal_pending') {
                                  handleRenewalDecision(lic._id, "reject", reason);
                                } else {
                                  updateStatus(lic._id, "reject");
                                }
                              }
                            }}
                          >
                            <X size={16} className="btn-icon" /> Reject
                          </button>
                        </>
                      )}
             </div>
         )}

         <div className="owner-photo-group">
              <div className="certificate-section owner-details">
                <div className="section-header">
                  <User size={16} className="section-icon" />
                  Owner Information
                </div>
                <div className="section-content">
                  <div className="owner-grid certificate-grid"> {/* Keep certificate-grid class for styling */}
                    <div className="grid-item span-two">
                      <strong>Name:</strong> {lic.fullName || "N/A"}
                    </div>
                     <div className="grid-item">
                      <strong>Gender:</strong> {lic.gender || "N/A"}
                    </div>
                    <div className="grid-item">
                      <strong>Phone Number:</strong> {lic.phoneNumber || "N/A"}
                    </div>
                    <div className="grid-item span-two">
                      <strong>Address:</strong> {lic.address?.streetName}, {lic.address?.city}, {lic.address?.state} - {lic.address?.pinCode || "N/A"}
                    </div>
                     <div className="grid-item">
                      <strong>Number of Dogs:</strong> {lic.numberOfDogs || "N/A"}
                    </div>
                    <div className="grid-item">
                      <strong>House Area:</strong> {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

            <div className="certificate-section dog-photo-section">
                <div className="section-header">
                    <Dog size={16} className="section-icon" />
                    Dog Photo
                </div>
                <div className="section-content">
                    {lic.dog?.avatarUrl ? (
                        <div className="avatar-preview">
                            <img
                                src={lic.dog.avatarUrl}
                                alt="Dog Avatar"
                                className="dog-avatar"
                            />
                        </div>
                    ) : (
                        <div className="no-data-placeholder">
                            No Photo
                        </div>
                    )}
                </div>
            </div>
         </div>


         <div className="certificate-section animal-details">
          <div className="section-header">
            <Dog size={16} className="section-icon" />
            Dog Information
          </div>
          <div className="section-content">
            <div className="detail-grid certificate-grid"> {/* Keep certificate-grid class for styling */}
              <div className="grid-item">
                <strong>Dog Name:</strong> {lic.dog?.name || "N/A"}
              </div>
              <div className="grid-item">
                <strong>Breed:</strong> {lic.dog?.breed || "N/A"}
              </div>
              <div className="grid-item">
                <strong>Category:</strong> {lic.dog?.category || "N/A"}
              </div>
              <div className="grid-item">
                <strong>Color:</strong> {lic.dog?.color || "N/A"}
              </div>
              <div className="grid-item">
                <strong>Age:</strong> {lic.dog?.age || "N/A"}
              </div>
               <div className="grid-item">
                <strong>Sex:</strong> {lic.dog?.sex || "N/A"}
              </div>
               <div className="grid-item">
                <strong>Vaccinated:</strong> {lic.dog?.dateOfVaccination ? "Yes" : "No"}
              </div>
              <div className="grid-item">
                <strong>Microchipped:</strong> No {/* Assuming static for now */}
              </div>
              <div className="grid-item">
                 <Syringe size={16} className="detail-icon" />
                <strong>Vaccination Date:</strong> {formatDate(lic.dog?.dateOfVaccination)}
              </div>
               <div className="grid-item">
                 <Calendar size={16} className="detail-icon" />
                <strong>Next Vaccination Due:</strong> {formatDate(lic.dog?.dueVaccination)}
              </div>
            </div>
          </div>
        </div>

        <div className="certificate-section vaccination-proof-section">
             <div className="section-header">
               <FileText size={16} className="section-icon" />
               Vaccination Certificate
             </div>
             <div className="section-content">
                {lic.dog?.vaccinationProofUrl ? (
                  <a
                    href={lic.dog.vaccinationProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="vaccination-link"
                  >
                    <FileText size={16} className="link-icon" />
                    View Certificate
                  </a>
              ) : (
                   <div className="no-data-placeholder">
                       No Certificate
                   </div>
               )}
             </div>
         </div>

      </div>
    );
  };


  const renderCertificateView = (lic) => {
    const currentDate = new Date().toLocaleDateString('en-GB');

    const expiryDate = lic.dog?.dateOfVaccination ?
      new Date(new Date(lic.dog.dateOfVaccination).setFullYear(
        new Date(lic.dog.dateOfVaccination).getFullYear() + 1
      )).toLocaleDateString('en-GB') : "N/A";

    return (
      <div className="certificate-mode">
         {/* Mobile Actions Bar (Visible on mobile, when status is pending) */}
         {/* Show pending actions ONLY on mobile AND if status is pending */}
        {isMobile && (lic.status === 'pending' || lic.status === 'renewal_pending') && (
             <div className="mobile-details-actions">
                 {(lic.status === "pending" || lic.status === "renewal_pending") && (
                        <>
                          <button
                            className="btn-approve"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (lic.status === 'renewal_pending') {
                                handleRenewalDecision(lic._id, "approve");
                              } else {
                                updateStatus(lic._id, "approve");
                              }
                            }}
                          >
                            <Check size={16} className="btn-icon" /> Approve
                          </button>
                          <button
                            className="btn-reject"
                            onClick={(e) => {
                              e.stopPropagation();
                              const reason = prompt('Enter rejection reason:');
                              if (reason) {
                                if (lic.status === 'renewal_pending') {
                                  handleRenewalDecision(lic._id, "reject", reason);
                                } else {
                                  updateStatus(lic._id, "reject");
                                }
                              }
                            }}
                          >
                            <X size={16} className="btn-icon" /> Reject
                          </button>
                        </>
                      )}
             </div>
         )}
        <div className="certificate-header">
          <div className="logo-container">
            <div className="municipal-logo">
              <Award size={40} />
            </div>
            <div className="header-text">
              <h3>Nagar Nigam Gorakhpur</h3>
              <p>नगर निगम गोरखपुर</p>
            </div>
          </div>
          <div className="date-container">
            <Calendar size={16} className="date-icon" />
            <p><strong>Date:</strong> {currentDate}</p>
          </div>
        </div>

        <div className="certificate-title">
          OFFICIAL DOG LICENSE CERTIFICATE
          <div className="certificate-subtitle">
            कुत्तों के पंजीकरण के लिए अधिकृत पत्र
          </div>
        </div>

        <div className="certificate-main-info">
          <div className="certificate-basic-info">
            <div className="info-row">
              <strong>नाम / Name:</strong> {lic.fullName || "N/A"}
            </div>
            <div className="info-row">
              <strong>पंजीकरण संख्या / Registration No.:</strong> {lic._id?.substring(0, 20) || "N/A"}
            </div>
            <div className="info-row">
              <strong>जारी दिनांक / Issue Date:</strong> {currentDate}
            </div>
            <div className="info-row">
              <strong>समाप्ति तिथि / Expiry Date:</strong> {expiryDate}
            </div>
          </div>
            <div className="certificate-photo">
                {lic.dog?.avatarUrl ? (
                  <img
                    src={lic.dog.avatarUrl}
                    alt="Dog Avatar"
                    className="certificate-dog-photo"
                  />
                ) : (
                  <div className="no-data-placeholder">
                       No Photo
                   </div>
                )}
            </div>
        </div>

        <div className="certificate-section animal-details">
          <div className="section-header">
            <Dog size={16} className="section-icon" />
            पशु का विवरण / Animal Details
          </div>
          <div className="section-content">
            <div className="detail-grid certificate-grid"> {/* Keep certificate-grid class for styling */}
              <div className="grid-item">
                <strong>पशु का नाम / Dog Name:</strong> {lic.dog?.name || "N/A"}
              </div>
              <div className="grid-item">
                <strong>लिंग / Gender:</strong> {lic.dog?.sex || "N/A"}
              </div>
              <div className="grid-item">
                <strong>नस्ल / Breed:</strong> {lic.dog?.breed || "N/A"}
              </div>
               <div className="grid-item">
                <strong>टीकाकरण / Vaccinated:</strong> {lic.dog?.dateOfVaccination ? "Yes" : "No"}
              </div>
              <div className="grid-item">
                <strong>वर्ग / Category:</strong> {lic.dog?.category || "N/A"}
              </div>
              <div className="grid-item">
                <strong>टीकाकरण प्रमाणपत्र / Vaccination Certificate:</strong>
                {lic.dog?.vaccinationProofUrl ? (
                  <a href={lic.dog.vaccinationProofUrl} target="_blank" rel="noreferrer" className="certificate-link">View</a>
                ) : "N/A"}
              </div>
              <div className="grid-item">
                <strong>रंग / Color:</strong> {lic.dog?.color || "N/A"}
              </div>
              <div className="grid-item">
                <strong>माइक्रोचिप्ड / Microchipped:</strong> No {/* Assuming static for now */}
              </div>
              <div className="grid-item">
                <strong>आयु / Age:</strong> {lic.dog?.age || "N/A"}
              </div>
               <div className="grid-item">
                <strong>अगला टीकाकरण / Next Vaccination:</strong> {formatDate(lic.dog?.dueVaccination)}
              </div>
              <div className="grid-item span-two">
                <strong>टीकाकरण की तारीख / Vaccination Date:</strong> {formatDate(lic.dog?.dateOfVaccination)}
              </div>
            </div>
          </div>
        </div>

        <div className="certificate-section owner-details">
          <div className="section-header">
            <User size={16} className="section-icon" />
            मालिक का विवरण / Owner Details
          </div>
          <div className="section-content">
            <div className="owner-grid certificate-grid"> {/* Keep certificate-grid class for styling */}
              <div className="grid-item span-two">
                <strong>पता / Address:</strong> {lic.address?.streetName}, {lic.address?.city}, {lic.address?.state} - {lic.address?.pinCode || "N/A"}
              </div>
              <div className="grid-item">
                <strong>फोन नंबर / Phone Number:</strong> {lic.phoneNumber || "N/A"}
              </div>
              <div className="grid-item">
                <strong>कुत्तों की संख्या / No. of Dogs:</strong> {lic.numberOfDogs || "N/A"}
              </div>
              <div className="grid-item span-two">
                <strong>घर का क्षेत्रफल / House Area:</strong> {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div className="declaration-box">
          <p>
            मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है। / I declare that the information provided above
            is true to the best of my knowledge.
          </p>
        </div>

        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <p>आवेदक के हस्ताक्षर / Applicant's Signature</p>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <p>जारीकर्ता अधिकारी / Issuing Authority</p>
          </div>
        </div>

        <div className="certificate-footer-elements">
          <div className="qr-code">
            <div className="qr-box">{/* QR Code would go here */}QR Code</div>
          </div>
          <div className="official-stamp">
            <Stamp size={40} className="stamp-icon" />
            <span>OFFICIAL STAMP</span>
          </div>
        </div>

        <div className="certificate-footer">
          <Phone size={14} className="footer-icon" /> {lic.phoneNumber || "N/A"} &nbsp;|&nbsp;
          <MapPin size={14} className="footer-icon" /> info@awbi.org &nbsp;|&nbsp; {/* Updated dummy email */}
          <Globe size={14} className="footer-icon" /> www.awbi.org {/* Updated dummy website */}
        </div>
      </div>
    );
  };

return (
  <div className={`admin-panel`}>
    {/* License List Container */}
    {expandedRowId === null && (
      <div className="license-list-container">
        {/* Tabs for switching between different views */}
        <div className="admin-tabs">
           <button
            className={`admin-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <LayoutList size={16} /> All
          </button>
          <button
            className={`admin-tab ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            <FileText size={16} /> New Applications
          </button>
          <button
            className={`admin-tab ${activeTab === 'renewals' ? 'active' : ''}`}
            onClick={() => setActiveTab('renewals')}
          >
            <Calendar size={16} /> Pending Renewals
          </button>
          <button
            className={`admin-tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            <Check size={16} /> Approved
          </button>
          <button
            className={`admin-tab ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            <X size={16} /> Rejected
          </button>
        </div>

        {/* Desktop Title */}
        <h2>
          <Award className="title-icon" />
          {activeTab === 'all' && 'All Licenses'} {/* Updated title */}
          {activeTab === 'new' && 'New Applications'}
          {activeTab === 'renewals' && 'Pending Renewals'}
          {activeTab === 'approved' && 'Approved Licenses'}
          {activeTab === 'rejected' && 'Rejected Licenses'}
        </h2>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          filteredLicenses.length === 0 ? (
            <div className="no-results-message">
              No licenses found for this category. {/* Updated message */}
            </div>
          ) : (
            <table className="license-table">
              <thead>
                <tr>
                  {/* Show License # column only for Renewals and Approved */}
                  {(activeTab === 'renewals' || activeTab === 'approved' || activeTab === 'rejected' || activeTab === 'all') && <th>License #</th>}
                  <th>Owner</th>
                  <th>Dog Name</th>
                  <th>Status</th>
                  {/* Show Expiry Date only for Renewals and Approved */}
                  {!isMobile && (activeTab === 'renewals' || activeTab === 'approved' || activeTab === 'all') && <th>Expiry Date</th>}
                  {/* Show Request Date only for Renewals */}
                  {!isMobile && activeTab === 'renewals' && <th>Request Date</th>}
                   {/* Show Vaccination Date for New, Approved, and All */}
                  {!isMobile && (activeTab === 'new' || activeTab === 'approved' || activeTab === 'all') && <th>Vaccination Date</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.map((lic) => (
                  <tr
                    key={lic._id}
                    className={`${lic.status === 'renewal_pending' ? 'renewal-highlight' : ''} ${lic.status}`}
                    onClick={() => toggleExpanded(lic._id)}
                  >
                     {(activeTab === 'renewals' || activeTab === 'approved' || activeTab === 'rejected' || activeTab === 'all') && <td>{lic.license_Id || lic._id?.substring(0, 8)}</td>}
                    <td><User size={16} className="cell-icon" /> {lic.fullName}</td>
                    <td><Dog size={16} className="cell-icon" /> {lic.dog?.name || "N/A"}</td>
                    <td>
                      <div className={`status-badge ${lic.status}`}>
                        {lic.status === "approved" && <Check size={14} />}
                        {lic.status === "rejected" && <X size={14} />}
                        {lic.status === "pending" && <Calendar size={14} />}
                        {lic.status === "renewal_pending" && <Calendar size={14} />}
                        {lic.status}
                      </div>
                    </td>
                    {!isMobile && (activeTab === 'renewals' || activeTab === 'approved' || activeTab === 'all') && (
                      <td><Calendar size={16} className="cell-icon" /> {formatDate(lic.expiryDate)}</td>
                    )}
                    {!isMobile && activeTab === 'renewals' && (
                      <td><Calendar size={16} className="cell-icon" /> {formatDate(lic.renewalRequestDate)}</td>
                    )}
                     {!isMobile && (activeTab === 'new' || activeTab === 'approved' || activeTab === 'all') && (
                       <td><Calendar size={16} className="cell-icon" /> {formatDate(lic.dog?.dateOfVaccination)}</td>
                     )}
                    <td className="actions-cell">
                      <div className="action-buttons-container">
                        <button
                          className="btn-view"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(lic._id);
                          }}
                        >
                          <Eye size={16} className="btn-icon" />
                          {!isMobile && 'View'}
                        </button>
                        {(lic.status === "pending" || lic.status === "renewal_pending") && (
                          <>
                            <button
                              className="btn-approve"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (lic.status === 'renewal_pending') {
                                  handleRenewalDecision(lic._id, "approve");
                                } else {
                                  updateStatus(lic._id, "approve");
                                }
                              }}
                            >
                              <Check size={16} className="btn-icon" />
                              {!isMobile && 'Approve'}
                            </button>
                            <button
                              className="btn-reject"
                              onClick={(e) => {
                                e.stopPropagation();
                                const reason = prompt('Enter rejection reason:');
                                if (reason) {
                                  if (lic.status === 'renewal_pending') {
                                    handleRenewalDecision(lic._id, "reject", reason);
                                } else {
                                  updateStatus(lic._id, "reject");
                                }
                                }
                              }}
                            >
                              <X size={16} className="btn-icon" />
                              {!isMobile && 'Reject'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    )}

    {/* Details View Container */}
    {selectedLicense && (
      <div className="license-details-container">
        <div className="mobile-details-header">
          <button
            className="back-to-list-btn"
            onClick={() => toggleExpanded(selectedLicense._id)}
          >
            <ChevronLeft size={24} />
            Back to List
          </button>
          <h3>
            {certificateView[selectedLicense._id]
              ? 'License Certificate'
              : 'License Details'}
          </h3>
        </div>

        <button
          className="view-toggle-btn"
          onClick={() => toggleCertificateView(selectedLicense._id)}
        >
          {certificateView[selectedLicense._id] ? (
            <><FileText size={18} className="btn-icon" /> Standard View</>
          ) : (
            <><Award size={18} className="btn-icon" /> Certificate View</>
          )}
        </button>

        {/* Show pending actions for admins */}
        {selectedLicense.status === 'pending' || selectedLicense.status === 'renewal_pending' ? (
          <div className="details-actions">
            <button
              className="btn-approve"
              onClick={() => {
                if (selectedLicense.status === 'renewal_pending') {
                  handleRenewalDecision(selectedLicense._id, "approve");
                } else {
                  updateStatus(selectedLicense._id, "approve");
                }
              }}
            >
              <Check size={16} className="btn-icon" /> Approve
            </button>
            <button
              className="btn-reject"
              onClick={() => {
                const reason = prompt('Enter rejection reason:');
                if (reason) {
                  if (selectedLicense.status === 'renewal_pending') {
                    handleRenewalDecision(selectedLicense._id, "reject", reason);
                  } else {
                    updateStatus(selectedLicense._id, "reject");
                  }
                }
              }}
            >
              <X size={16} className="btn-icon" /> Reject
            </button>
          </div>
        ) : null}

        {certificateView[selectedLicense._id]
          ? renderCertificateView(selectedLicense)
          : renderStandardView(selectedLicense)}
      </div>
    )}
  </div>
);
};

export default AdminPanel;