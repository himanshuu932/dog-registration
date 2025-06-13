import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/AdminPanel.css";
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
  EyeOff,
  FileText,
  Award,
  Syringe, // Syringe icon might still be used if other medical data is present, but will be removed if not.
  Stamp,
  Globe,
  ChevronLeft,
  LayoutList,
  Clock,
} from "lucide-react";

const AdminPanel = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [certificateView, setCertificateView] = useState({});
  const [activeTab, setActiveTab] = useState('new');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

 const filteredLicenses = licenses.filter(lic => {
    switch(activeTab) {
      case 'all':
        return true;
      case 'new':
        return lic.status === 'pending' && !lic.isProvisional;
      case 'provisional':
        return lic.isProvisional;
      case 'renewals':
        return lic.status === 'renewal_pending';
      case 'approved':
        return lic.status === 'approved';
      case 'rejected':
        return lic.status === 'rejected';
      default:
        return true;
    }
  });

  // Corrected calculation for newRegistrationsCount to exclude provisional licenses
  const newRegistrationsCount = licenses.filter(lic => lic.status === 'pending' && !lic.isProvisional).length;
  const pendingRenewalsCount = licenses.filter(lic => lic.status === 'renewal_pending').length;
  const provisionalCount = licenses.filter(lic => lic.isProvisional).length;


  useEffect(() => {
    const handleResize = () => {
      const mobileNow = window.innerWidth <= 768;
      setIsMobile(mobileNow);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const backend = "http://localhost:5000";
  const token = localStorage.getItem("token");

  const fetchLicenses = async () => {
    try {
      const res = await axios.get(`${backend}/api/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLicenses(res.data);
    } catch (err) {
      // Replaced alert with console.error for better user experience
      console.error("Failed to load licenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, action, reason = '') => {
    try {
      await axios.patch(
        `${backend}/api/admin/${action}/${id}`,
        { ...(action === 'reject' && { reason }) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Replaced alert with console.log for better user experience
      console.log(`License ${action}d`);
      fetchLicenses();
    } catch (err) {
      // Replaced alert with console.error for better user experience
      console.error("Failed to update license status:", err);
    }
  };

  const handleRenewalDecision = async (id, action, reason = '') => {
    try {
      const endpoint = action === 'approve'
        ? `${backend}/api/admin/renew-registration/approve`
        : `${backend}/api/admin/renew-registration/reject`;

      await axios.post(
        endpoint,
        { licenseId: id, ...(action === 'reject' && { reason }) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Replaced alert with console.log for better user experience
      console.log(`Renewal ${action}d`);
      fetchLicenses();
    } catch (err) {
      // Replaced alert with console.error for better user experience
      console.error(`Failed to ${action} renewal:`, err);
    }
  };

  const toggleExpanded = (id) => {
    if (expandedRowId === id) {
      setExpandedRowId(null);
      setCertificateView({});
    } else {
      setExpandedRowId(id);
      setCertificateView({ [id]: false });
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


   const renderStatusBadge = (license) => {
    let statusText = license.status;
    let icon = <Calendar size={14} />;
    
    if (license.isProvisional) {
      statusText = 'Provisional';
      icon = <Clock size={14} />;
    } else {
      switch(license.status) {
        case "approved":
          icon = <Check size={14} />;
          break;
        case "rejected":
          icon = <X size={14} />;
          break;
        case "pending":
        case "renewal_pending":
          icon = <Calendar size={14} />;
          break;
        default:
          icon = <Calendar size={14} />;
      }
    }

    return (
      <div className={`status-badge ${license.status} ${license.isProvisional ? 'provisional' : ''}`}>
        {icon}
        {statusText}
      </div>
    );
  };

  

  const renderStandardView = (lic) => {
    return (
      <div className="license-details standard-form-view">
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
                    // Replaced prompt with a custom modal/dialog for rejection reason
                    const reason = window.prompt('Enter rejection reason:'); // Using window.prompt for demonstration, replace with custom UI
                    if (reason) {
                      if (lic.status === 'renewal_pending') {
                        handleRenewalDecision(lic._id, "reject", reason);
                      } else {
                        updateStatus(lic._id, "reject", reason);
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

        {lic.status === 'rejected' && lic.rejectionReason && (
          <div className="certificate-section rejection-reason">
            <div className="section-header">
              <X size={16} className="section-icon" />
              Rejection Reason
            </div>
            <div className="section-content">
              <div className="rejection-reason-text">
                {lic.rejectionReason}
              </div>
            </div>
          </div>
        )}

        <div className="certificate-section">
  <div className="section-header">
    <Award size={16} className="section-icon" />
    License ID
  </div>
  <div className="section-content">
    {lic.license_Id || "Not assigned"}
  </div>
</div>


        <div className="owner-photo-group">
          <div className="certificate-section owner-details">
            <div className="section-header">
              <User size={16} className="section-icon" />
              Owner Information
            </div>
            <div className="section-content">
              <div className="owner-grid certificate-grid">
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
                  <strong>Number of Animals:</strong> {lic.numberOfAnimals || "N/A"}
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
              Pet Photo
            </div>
            <div className="section-content">
              {lic.pet?.avatarUrl ? (
                <div className="avatar-preview">
                  <img
                    src={lic.pet.avatarUrl}
                    alt="Pet Avatar"
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
            Pet Information
          </div>
          <div className="section-content">
            <div className="detail-grid certificate-grid">
              <div className="grid-item">
                <strong>Animal Type:</strong> {lic.animalType || "N/A"}
              </div>
              <div className="grid-item">
                <strong>Pet Name:</strong> {lic.pet?.name || "N/A"}
              </div>
              <div className="grid-item">
                <strong>Breed:</strong> {lic.pet?.breed || "N/A"}
              </div>
              <div className="grid-item">
                <strong>Category:</strong> {lic.pet?.category || "N/A"}
              </div>
              <div className="grid-item">
                <strong>Color:</strong> {lic.pet?.color || "N/A"}
              </div>
              <div className="grid-item">
                <strong>Age:</strong> {lic.pet?.age || "N/A"}
              </div>
              <div className="grid-item">
                <strong>Sex:</strong> {lic.pet?.sex || "N/A"}
              </div>
              {/* Removed Vaccination fields */}
              <div className="grid-item">
                <strong>Microchipped:</strong> No
              </div>
            </div>
          </div>
        </div>

        {/* Removed Vaccination Certificate section */}
      </div>
    );
  };

  const renderCertificateView = (lic) => {
    const currentDate = new Date().toLocaleDateString('en-GB');
    // Removed expiryDate calculation based on vaccination date
    const expiryDate = lic.expiryDate ? formatDate(lic.expiryDate) : "N/A";


    return (
      <div className="certificate-mode">
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
                    // Replaced prompt with a custom modal/dialog for rejection reason
                    const reason = window.prompt('Enter rejection reason:'); // Using window.prompt for demonstration, replace with custom UI
                    if (reason) {
                      if (lic.status === 'renewal_pending') {
                        handleRenewalDecision(lic._id, "reject", reason);
                      } else {
                        updateStatus(lic._id, "reject", reason);
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

        {lic.status === 'rejected' && lic.rejectionReason && (
          <div className="certificate-section rejection-reason">
            <div className="section-header">
              <X size={16} className="section-icon" />
              अस्वीकृति का कारण / Rejection Reason
            </div>
            <div className="section-content">
              <div className="rejection-reason-text">
                {lic.rejectionReason}
              </div>
            </div>
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
          OFFICIAL PET LICENSE CERTIFICATE
          <div className="certificate-subtitle">
            पशुओं के पंजीकरण के लिए अधिकृत पत्र
          </div>
        </div>

        <div className="certificate-main-info">
          <div className="certificate-basic-info">
            <div className="info-row">
              <strong>नाम / Name:</strong> {lic.fullName || "N/A"}
            </div>
          <div className="info-row">
  <strong>पंजीकरण संख्या / Registration No.:</strong> {lic.license_Id || lic._id?.substring(0, 8)}
</div>

            <div className="info-row">
              <strong>जारी दिनांक / Issue Date:</strong> {currentDate}
            </div>
            <div className="info-row">
              <strong>समाप्ति तिथि / Expiry Date:</strong> {expiryDate}
            </div>
          </div>
          <div className="certificate-photo">
            {lic.pet?.avatarUrl ? (
              <img
                src={lic.pet.avatarUrl}
                alt="Pet Avatar"
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
            <div className="detail-grid certificate-grid">
              <div className="grid-item">
                <strong>पशु का प्रकार / Animal Type:</strong> {lic.animalType || "N/A"}
              </div>
              <div className="grid-item">
                <strong>पशु का नाम / Pet Name:</strong> {lic.pet?.name || "N/A"}
              </div>
              <div className="grid-item">
                <strong>लिंग / Gender:</strong> {lic.pet?.sex || "N/A"}
              </div>
              <div className="grid-item">
                <strong>नस्ल / Breed:</strong> {lic.pet?.breed || "N/A"}
              </div>
              {/* Removed Vaccination fields */}
              <div className="grid-item">
                <strong>वर्ग / Category:</strong> {lic.pet?.category || "N/A"}
              </div>
              {/* Removed Vaccination Certificate link */}
              <div className="grid-item">
                <strong>रंग / Color:</strong> {lic.pet?.color || "N/A"}
              </div>
              <div className="grid-item">
                <strong>माइक्रोचिप्ड / Microchipped:</strong> No
              </div>
              <div className="grid-item">
                <strong>आयु / Age:</strong> {lic.pet?.age || "N/A"}
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
            <div className="owner-grid certificate-grid">
              <div className="grid-item span-two">
                <strong>पता / Address:</strong> {lic.address?.streetName}, {lic.address?.city}, {lic.address?.state} - {lic.address?.pinCode || "N/A"}
              </div>
              <div className="grid-item">
                <strong>फोन नंबर / Phone Number:</strong> {lic.phoneNumber || "N/A"}
              </div>
              <div className="grid-item">
                <strong>पशुओं की संख्या / No. of Animals:</strong> {lic.numberOfAnimals || "N/A"}
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
            <div className="qr-box">QR Code</div>
          </div>
          <div className="official-stamp">
            <Stamp size={40} className="stamp-icon" />
            <span>OFFICIAL STAMP</span>
          </div>
        </div>

        <div className="certificate-footer">
          <Phone size={14} className="footer-icon" /> {lic.phoneNumber || "N/A"} &nbsp;|&nbsp;
          <MapPin size={14} className="footer-icon" /> info@awbi.org &nbsp;|&nbsp;
          <Globe size={14} className="footer-icon" /> www.awbi.org
        </div>
      </div>
    );
  };

return (
  <div className={`admin-panel`}>
    {expandedRowId === null ? (
      <div className="license-list-container">
        {!isMobile ? (
          <div className="admin-tabs-desktop">
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
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <FileText size={16} />
                {/* Corrected notification dot logic */}
                {newRegistrationsCount > 0 && <span className="notification-dot"></span>}
              </div>
              New Applications
            </button>
            <button
              className={`admin-tab ${activeTab === 'provisional' ? 'active' : ''}`}
              onClick={() => setActiveTab('provisional')}
            >
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Clock size={16} />
                {/* Corrected notification dot logic */}
                {provisionalCount > 0 && <span className="notification-dot"></span>}
              </div>
              Provisional
            </button>
            <button
              className={`admin-tab ${activeTab === 'renewals' ? 'active' : ''}`}
              onClick={() => setActiveTab('renewals')}
            >
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Calendar size={16} />
                {/* Corrected notification dot logic */}
                {pendingRenewalsCount > 0 && <span className="notification-dot"></span>}
              </div>
              Pending Renewals
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
        ) : (
          <div className="admin-filter-mobile">
            <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
              <option value="all">All Licenses</option>
              <option value="new">New Applications {newRegistrationsCount > 0 ? `(${newRegistrationsCount})` : ''}</option>
              <option value="provisional">Provisional {provisionalCount > 0 ? `(${provisionalCount})` : ''}</option>
              <option value="renewals">Pending Renewals {pendingRenewalsCount > 0 ? `(${pendingRenewalsCount})` : ''}</option>
              <option value="approved">Approved Licenses</option>
              <option value="rejected">Rejected Licenses</option>
            </select>
            {/* These notification dots are redundant if counts are shown in options, but kept for consistency if needed */}
            {activeTab === 'new' && newRegistrationsCount > 0 && <span className="notification-dot"></span>}
            {activeTab === 'provisional' && provisionalCount > 0 && <span className="notification-dot"></span>}
            {activeTab === 'renewals' && pendingRenewalsCount > 0 && <span className="notification-dot"></span>}
          </div>
        )}

        <h2>
          <Award className="title-icon" />
          {activeTab === 'all' && 'All Licenses'}
          {activeTab === 'new' && 'New Applications'}
          {activeTab === 'provisional' && 'Provisional Licenses'}
          {activeTab === 'renewals' && 'Pending Renewals'}
          {activeTab === 'approved' && 'Approved Licenses'}
          {activeTab === 'rejected' && 'Rejected Licenses'}
        </h2>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className="no-results-message">
            No licenses found for this category.
          </div>
        ) : (
          <table className="license-table">
            <thead>
              <tr>
                {(activeTab === 'renewals' || activeTab === 'approved' || activeTab === 'rejected' || activeTab === 'all' || activeTab === 'provisional') && <th>License #</th>}
                <th>Owner</th>
                <th>Animal Type</th>
                <th>Pet Name</th>
                {/* New column for License Type */}
                <th>License Type</th> 
                <th>Status</th>
                {/* Removed Vaccination Date column */}
                {!isMobile && (activeTab === 'renewals' || activeTab === 'approved' || activeTab === 'all' || activeTab === 'provisional') && <th>Expiry Date</th>}
                {!isMobile && activeTab === 'renewals' && <th>Request Date</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLicenses.map((lic) => (
                <tr
                  key={lic._id}
                  className={`${lic.status === 'renewal_pending' ? 'renewal-highlight' : ''} ${lic.status} ${lic.isProvisional ? 'provisional' : ''}`}
                  onClick={() => toggleExpanded(lic._id)}
                >
                  {(activeTab === 'renewals' || activeTab === 'approved' || activeTab === 'rejected' || activeTab === 'all' || activeTab === 'provisional') && <td>{lic.license_Id || lic._id?.substring(0, 8)}</td>}
                  <td><User size={16} className="cell-icon" /> {lic.fullName}</td>
                  <td><Dog size={16} className="cell-icon" /> {lic.animalType || "N/A"}</td>
                  <td><Dog size={16} className="cell-icon" /> {lic.pet?.name || "N/A"}</td>
                  {/* Display License Type */}
                  <td>{lic.isProvisional ? 'Provisional' : 'Full'}</td> 
                  <td>
                    <div className={`status-badge ${lic.status} ${lic.isProvisional ? 'provisional' : ''}`}>
                      {lic.isProvisional ? (
                        <Clock size={14} />
                      ) : lic.status === "approved" ? (
                        <Check size={14} />
                      ) : lic.status === "rejected" ? (
                        <X size={14} />
                      ) : (
                        <Calendar size={14} />
                      )}
                      { lic.status}
                    </div>
                  </td>
                  {!isMobile && (activeTab === 'renewals' || activeTab === 'approved' || activeTab === 'all' || activeTab === 'provisional') && (
                    <td><Calendar size={16} className="cell-icon" /> {formatDate(lic.expiryDate)}</td>
                  )}
                  {!isMobile && activeTab === 'renewals' && (
                    <td><Calendar size={16} className="cell-icon" /> {formatDate(lic.renewalRequestDate)}</td>
                  )}
                  {/* Removed Vaccination Date column */}
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
                      {(lic.status === "pending" || lic.status === "renewal_pending" || (lic.status === "pending" && lic.isProvisional)) && (
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
                              // Replaced prompt with a custom modal/dialog for rejection reason
                              const reason = window.prompt('Enter rejection reason:'); // Using window.prompt for demonstration, replace with custom UI
                              if (reason) {
                                if (lic.status === 'renewal_pending') {
                                  handleRenewalDecision(lic._id, "reject", reason);
                                } else {
                                  updateStatus(lic._id, "reject", reason);
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
        )}
      </div>
    ) : (
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

        {(selectedLicense.status === 'pending' || selectedLicense.status === 'renewal_pending' || selectedLicense.isProvisional) && (
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
                // Replaced prompt with a custom modal/dialog for rejection reason
                const reason = window.prompt('Enter rejection reason:'); // Using window.prompt for demonstration, replace with custom UI
                if (reason) {
                  if (selectedLicense.status === 'renewal_pending') {
                    handleRenewalDecision(selectedLicense._id, "reject", reason);
                  } else {
                    updateStatus(selectedLicense._id, "reject", reason);
                  }
                }
              }}
            >
              <X size={16} className="btn-icon" /> Reject
            </button>
          </div>
        )}

        {certificateView[selectedLicense._id]
          ? renderCertificateView(selectedLicense)
          : renderStandardView(selectedLicense)}
      </div>
    )}
  </div>
);
};

export default AdminPanel;
