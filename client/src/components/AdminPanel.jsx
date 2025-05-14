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
} from "lucide-react";

const AdminPanel = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  // State to hold the ID of the currently expanded row (for single expansion)
  const [expandedRowId, setExpandedRowId] = useState(null);
  // State to track if the certificate view is active for the expanded row
  const [certificateView, setCertificateView] = useState({});

  // State for mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
        {isMobile && lic.status === 'pending' && (
             <div className="mobile-details-actions">
                 <button className="btn-approve" onClick={() => updateStatus(lic._id, "approve")}>
                   <Check size={16} className="btn-icon" /> Approve
                 </button>
                 <button className="btn-reject" onClick={() => updateStatus(lic._id, "reject")}>
                   <X size={16} className="btn-icon" /> Reject
                 </button>
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
        {isMobile && lic.status === 'pending' && (
             <div className="mobile-details-actions">
                 <button className="btn-approve" onClick={() => updateStatus(lic._id, "approve")}>
                   <Check size={16} className="btn-icon" /> Approve
                 </button>
                 <button className="btn-reject" onClick={() => updateStatus(lic._id, "reject")}>
                   <X size={16} className="btn-icon" /> Reject
                 </button>
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
    <div
       className={`admin-panel`} // Removed two-column-layout class logic
       // Removed style prop for dynamic gridTemplateColumns
    >
      {/* License List Container */}
      {/* Show list ONLY if no license is selected */}
      {expandedRowId === null && (
          <div className="license-list-container">
              {/* Desktop Title */}
              {/* Show desktop title if list is visible */}
              {!isMobile && <h2><Award className="title-icon" /> Dog License Applications</h2>}
               {/* Mobile Title (when list is visible) */}
               {isMobile && expandedRowId === null && (
                    <h2 className="mobile-title"><Award className="title-icon" /> Dog License Applications</h2>
               )}

              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading licenses...</p>
                </div>
              ) : (
                <table className="license-table">
                  <thead>
                    <tr>
                      <th>Owner</th>
                      <th>Dog Name</th>
                      <th className="hide-on-mobile">Status</th> {/* Hide Status header on mobile */}
                      <th className="hide-on-mobile">Vaccination Date</th> {/* Hide Vaccination Date header on mobile */}
                      <th>Actions</th> {/* Keep Actions header, will be restyled */}
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((lic) => (
                      <tr
                         key={lic._id}
                         // Removed: className={expandedRowId === lic._id && !isMobile ? 'expanded-row' : ''}
                         onClick={() => toggleExpanded(lic._id)} // Toggle on row click
                      >
                        {/* Conditional rendering for mobile vs desktop columns */}
                        {isMobile ? (
                            <>
                              {/* Combined Info Cell for Mobile */}
                              {/* Added data-label for CSS */}
                                  <div className="user-name"><User size={16} className="cell-icon" /> {lic.fullName}</div>
                                  <div className="dog-name"><Dog size={16} className="cell-icon" /> {lic.dog?.name || "N/A"}</div>
                                   <div className="status-date-group">
                                      <div className={`status-badge ${lic.status}`}>
                                        {lic.status === "approved" && <Check size={14} />}
                                        {lic.status === "rejected" && <X size={14} />}
                                        {lic.status === "pending" && <Calendar size={14} />}
                                        {lic.status}
                                      </div>
                                      <div className="date-text"><Calendar size={16} className="cell-icon" /> {formatDate(lic.dog?.dateOfVaccination)}</div>
                                   </div>
                          
                              {/* View Button Cell for Mobile */}
                               <td data-label="View">
                                     <button
                                        className="btn-view"
                                        onClick={(e) => {
                                             // Prevent row click event from firing again
                                            e.stopPropagation();
                                            toggleExpanded(lic._id);
                                        }}
                                      >
                                          <><Eye size={16} className="btn-icon" /> View</>
                                      </button>
                               </td>
                              {/* Actions Cell for Mobile (Approve/Reject) */}
                              {lic.status === "pending" && ( // Only show this cell if status is pending
                                <td className="mobile-actions-cell" data-label="Actions">
                                    <div className="action-buttons-container">
                                        <button
                                           className="btn-approve"
                                           onClick={(e) => {
                                                e.stopPropagation(); // Prevent row click
                                              updateStatus(lic._id, "approve");
                                           }}
                                         >
                                           <Check size={16} className="btn-icon" />
                                           Approve
                                         </button>
                                         <button
                                           className="btn-reject"
                                           onClick={(e) => {
                                                e.stopPropagation(); // Prevent row click
                                              updateStatus(lic._id, "reject");
                                           }}
                                         >
                                           <X size={16} className="btn-icon" />
                                           Reject
                                         </button>
                                    </div>
                                 </td>
                              )}
                              {/* If status is not pending, render an empty cell to maintain column structure if needed, or adjust CSS display */}
                              {/* Given the 'three columns' instruction, it's better to only render 3 cells total on mobile */}
                               {!isMobile && lic.status !== "pending" && (
                                    <td className="mobile-actions-cell" data-label="Actions"></td> // Empty cell for non-pending on mobile (this shouldn't be rendered based on the isMobile condition above, but keeping here for clarity if logic changes)
                                )}

                            </>
                        ) : (
                            <>
                              {/* Desktop Columns */}
                              <td><div className="user-cell"><User size={16} className="cell-icon" /> {lic.fullName}</div></td>
                              <td><div className="dog-cell"><Dog size={16} className="cell-icon" /> {lic.dog?.name || "N/A"}</div></td>
                              <td className="hide-on-mobile"> {/* Hide Status cell on mobile */}
                                <div className={`status-badge ${lic.status}`}>
                                  {lic.status === "approved" && <Check size={14} />}
                                  {lic.status === "rejected" && <X size={14} />}
                                  {lic.status === "pending" && <Calendar size={14} />}
                                  {lic.status}
                                </div>
                              </td>
                              <td className="hide-on-mobile"><div className="date-cell"><Calendar size={16} className="cell-icon" /> {formatDate(lic.dog?.dateOfVaccination)}</div></td> {/* Hide Vaccination Date cell on mobile */}
                              <td className="actions-cell"> {/* Keep Actions cell, will be restyled on mobile */}
                                {/* Container for buttons in the actions cell */}
                                <div className="action-buttons-container">
                                    {/* Show View button always in the table */}
                                         <button
                                            className="btn-view"
                                            onClick={(e) => {
                                                 // Prevent row click event from firing again
                                                e.stopPropagation();
                                                toggleExpanded(lic._id);
                                            }}
                                          >
                                              <><Eye size={16} className="btn-icon" /> View</>
                                          </button>

                                    {/* Show pending actions ONLY on non-mobile AND if status is pending */}
                                    {!isMobile && lic.status === "pending" && (
                                       <div className={`pending-actions`}> {/* Removed icon-only class logic */}
                                           <button
                                              className="btn-approve"
                                              onClick={(e) => {
                                                   e.stopPropagation(); // Prevent row click
                                                  updateStatus(lic._id, "approve");
                                              }}
                                            >
                                              <Check size={16} className="btn-icon" />
                                              {/* Show text on desktop */}
                                              Approve
                                            </button>
                                            <button
                                              className="btn-reject"
                                              onClick={(e) => {
                                                   e.stopPropagation(); // Prevent row click
                                                  updateStatus(lic._id, "reject");
                                              }}
                                            >
                                              <X size={16} className="btn-icon" />
                                              {/* Show text on desktop */}
                                              Reject
                                            </button>
                                       </div>
                                    )}
                                </div>
                              </td>
                            </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
      )}

       {/* Removed: Resizable Divider */}
       {/* {isTwoColumnLayout && (
        <div
          className="resizable-divider"
          onMouseDown={startResizing}
        ></div>
      )} */}


      {/* Details View Container (rendered alongside the list on desktop, or centered on mobile) */}
      {/* Show details ONLY if a license is selected */}
      {selectedLicense && (
          <div className="license-details-container">
              {/* Back to List button - Show if a license is selected (on both desktop and mobile) */}
               {/* This header is now always shown when details are open */}
               <div className="mobile-details-header"> {/* Container for mobile details header - reusing this class */}
                    <button
                        className="back-to-list-btn"
                        onClick={() => toggleExpanded(selectedLicense._id)} // Toggle to close details
                    >
                       <ChevronLeft size={24} />
                       Back to List
                   </button>
                   {/* Optionally add a title here like "License Details" */}
               </div>


               <button
                className="view-toggle-btn"
                onClick={() => toggleCertificateView(selectedLicense._id)}
              >
                {certificateView[selectedLicense._id] ?
                  <><FileText size={18} className="btn-icon" /> Standard View</> :
                  <><Award size={18} className="btn-icon" /> Certificate View</>}
              </button>

              {certificateView[selectedLicense._id]
                ? renderCertificateView(selectedLicense)
                : renderStandardView(selectedLicense)}
          </div>
      )}
    </div>
  );
};

export default AdminPanel;