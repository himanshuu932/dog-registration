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
  Syringe,
  Stamp,
  Globe,
  ChevronLeft,
  LayoutList,
  Clock,
  PawPrint, 
} from "lucide-react";

// Define VET_DETAILS at the module level or within the component if it can change
const VET_DETAILS = {
  name: "Dr. John Smith",
  clinic: "City Veterinary Hospital",
  phone: "+1 (555) 123-4567",
  address: "123 Main Street, Gorakhpur, UP 273001" // Example address
};

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
        return lic.isProvisional === true;
      case 'renewals':
        return lic.status === 'renewal_pending';
      case 'approved': 
        return lic.status === 'approved' && !lic.isProvisional;
      case 'rejected':
        return lic.status === 'rejected';
      default:
        return true;
    }
  });

  const newRegistrationsCount = licenses.filter(lic => lic.status === 'pending' && !lic.isProvisional).length;
  const pendingRenewalsCount = licenses.filter(lic => lic.status === 'renewal_pending').length;
  const provisionalCount = licenses.filter(lic => lic.isProvisional === true).length;


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

  const backend = "https://dog-registration.onrender.com";
  const token = localStorage.getItem("token");

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backend}/api/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedLicenses = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLicenses(sortedLicenses);
    } catch (err) {
      alert("Failed to load licenses");
      setLicenses([]); 
    } finally {
      setLoading(false);
    }
  };
  
  const getAnimalLabel = (animalType = 'Pet') => {
    if (!animalType) return 'Pet';
    const lower = animalType.toLowerCase();
    switch (lower) {
      case 'dog': return 'Dog';
      case 'cat': return 'Cat';
      case 'rabbit': return 'Rabbit';
      default: return animalType;
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
      alert(`License ${action}ed`);
      fetchLicenses(); 
      if (expandedRowId === id && (action === 'approve' || action === 'reject')) { 
          setExpandedRowId(null); 
          setCertificateView({});
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

      await axios.post(
        endpoint,
        { licenseId: id, ...(action === 'reject' && { reason }) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Renewal ${action}d`);
      fetchLicenses(); 
      if (expandedRowId === id) { 
          setExpandedRowId(null); 
          setCertificateView({});
      }
    } catch (err)
    {
      alert(`Failed to ${action} renewal: ${err.response?.data?.message || err.message}`);
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
    let statusText = license.isProvisional ? 'Provisional' : license.status;
    let icon;
    
    if (license.isProvisional) {
      icon = <Clock size={14} />;
    } else {
      switch(license.status.toLowerCase()) {
        case "approved":
          icon = <Check size={14} />;
          break;
        case "rejected":
          icon = <X size={14} />;
          break;
        case "pending":
          icon = <FileText size={14} />; 
          break;
        case "renewal_pending":
          icon = <Calendar size={14} />;
          break;
        default:
          icon = <FileText size={14} />;
      }
    }

    return (
      <div className={`status-badge ${license.status.toLowerCase()} ${license.isProvisional ? 'provisional' : ''}`}>
        {icon}
        <span>{statusText.charAt(0).toUpperCase() + statusText.slice(1)}</span>
      </div>
    );
  };

  

  const renderStandardView = (lic) => {
    return (
      <div className="license-details standard-form-view">
        {isMobile && (lic.status === 'pending' || lic.status === 'renewal_pending' || lic.isProvisional) && (
          <div className="mobile-details-actions">
            {(lic.status === "pending" || lic.status === "renewal_pending" || lic.isProvisional) && !lic.isProvisional && lic.status !== 'approved' && lic.status !== 'rejected' &&(
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
                    if (reason !== null && reason.trim() !== "") { 
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
                  <strong>Address:</strong> {`${lic.address?.streetName || ""}, ${lic.address?.city || ""}, ${lic.address?.state || ""} - ${lic.address?.pinCode || "N/A"}`}
                </div>
                <div className="grid-item">
                  <strong>{`No. of ${getAnimalLabel(lic.animalType)}s:`}</strong> {lic.numberOfAnimals || "N/A"}
                </div>
                <div className="grid-item">
                  <strong>House Area:</strong> {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div className="certificate-section dog-photo-section"> 
            <div className="section-header">
              <PawPrint size={16} className="section-icon" /> 
              Pet Photo
            </div>
            <div className="section-content">
              {lic.pet?.avatarUrl ? (
                <div className="avatar-preview">
                  <img
                    src={lic.pet.avatarUrl}
                    alt={`${getAnimalLabel(lic.animalType)} Avatar`}
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
            <PawPrint size={16} className="section-icon" /> 
            {getAnimalLabel(lic.animalType)} Information
          </div>
          <div className="section-content">
            <div className="detail-grid certificate-grid">
              <div className="grid-item">
                <strong>Pet Name:</strong> {lic.pet?.name || "N/A"}
              </div>
              <div className="grid-item">
                <strong>Animal Type:</strong> {getAnimalLabel(lic.animalType) || "N/A"}
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
              <div className="grid-item">
                <strong>Vaccinated:</strong> {lic.pet?.dateOfVaccination ? "Yes" : "No"}
              </div>
              <div className="grid-item">
                <strong>Microchipped:</strong> No 
              </div>
              <div className="grid-item">
                <Syringe size={16} className="detail-icon" />
                <strong>Vaccination Date:</strong> {formatDate(lic.pet?.dateOfVaccination)}
              </div>
              <div className="grid-item">
                <Calendar size={16} className="detail-icon" />
                <strong>Next Vaccination Due:</strong> {formatDate(lic.pet?.dueVaccination)}
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
            {lic.pet?.vaccinationProofUrl ? (
              <a
                href={lic.pet.vaccinationProofUrl}
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
    
    const provisionalExpiry = lic.provisionalExpiryDate ? formatDate(lic.provisionalExpiryDate) : "N/A";
    const regularExpiry = lic.pet?.dateOfVaccination ?
      new Date(new Date(lic.pet.dateOfVaccination).setFullYear(
        new Date(lic.pet.dateOfVaccination).getFullYear() + 1
      )).toLocaleDateString('en-GB') : "N/A";
    
    const expiryDate = lic.isProvisional ? provisionalExpiry : regularExpiry;
    
    const certificateTitleEn = lic.isProvisional ? "PROVISIONAL PET LICENSE CERTIFICATE" : "PET LICENSE CERTIFICATE";
    const certificateTitleHi = lic.isProvisional ? "अस्थायी पशु लाइसेंस प्रमाणपत्र" : "पशु लाइसेंस प्रमाणपत्र";


    return (
      <div className="certificate-mode"> 
         {lic.isProvisional && (
            <div className="admin-provisional-notice-overlay">
                PROVISIONAL LICENSE
            </div>
        )}
        {isMobile && (lic.status === 'pending' || lic.status === 'renewal_pending' || lic.isProvisional) && !lic.isProvisional && lic.status !== 'approved' && lic.status !== 'rejected' && (
          <div className="mobile-details-actions">
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
                    if (reason !== null && reason.trim() !== "") {
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
              <img src="/logo.webp" alt="Municipal Logo" style={{width: '40px', height: '40px'}}/> 
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
          {certificateTitleEn}
          <div className="certificate-subtitle">
            {certificateTitleHi}
          </div>
        </div>

        <div className="certificate-main-info">
          <div className="certificate-basic-info">
            <div className="info-row">
              <strong>नाम / Name:</strong> {lic.fullName || "N/A"}
            </div>
            <div className="info-row">
              <strong>पंजीकरण संख्या / Registration No.:</strong> {lic.license_Id || lic._id?.substring(0,15) || "N/A"}
            </div>
            <div className="info-row">
              <strong>जारी दिनांक / Issue Date:</strong> {formatDate(lic.createdAt) || currentDate}
            </div>
            <div className="info-row">
              <strong>समाप्ति तिथि / Expiry Date:</strong> {expiryDate}
            </div>
          </div>
          <div className="certificate-photo">
            {lic.pet?.avatarUrl ? (
              <img
                src={lic.pet.avatarUrl}
                alt={`${getAnimalLabel(lic.animalType)} Avatar`}
                className="certificate-dog-photo" 
              />
            ) : (
              <div className="no-data-placeholder">
                Pet's Photo
              </div>
            )}
          </div>
        </div>
        
        {lic.isProvisional && VET_DETAILS && (
             <div className="certificate-section provisional-vet-details">
                <div className="section-header">
                    <Syringe size={16} className="section-icon" />
                    Approved Veterinary Clinic (For Provisional License)
                </div>
                <div className="section-content">
                    <div className="detail-grid certificate-grid">
                        <div className="grid-item"><strong>Veterinarian:</strong> {VET_DETAILS.name}</div>
                        <div className="grid-item"><strong>Clinic:</strong> {VET_DETAILS.clinic}</div>
                        <div className="grid-item"><strong>Contact:</strong> {VET_DETAILS.phone}</div>
                        <div className="grid-item span-two"><strong>Address:</strong> {VET_DETAILS.address}</div>
                    </div>
                    <p className="provisional-instructions-text">
                        Owner must visit this clinic within 30 days for rabies vaccination to convert to a full license.
                    </p>
                </div>
            </div>
        )}


        <div className="certificate-section animal-details">
          <div className="section-header">
            <PawPrint size={16} className="section-icon" /> 
            पशु का विवरण / {getAnimalLabel(lic.animalType)} Details
          </div>
          <div className="section-content">
            <div className="detail-grid certificate-grid">
               <div className="grid-item">
                <strong>पशु का प्रकार / Animal Type:</strong> {getAnimalLabel(lic.animalType) || "N/A"}
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
              <div className="grid-item">
                <strong>टीकाकरण / Vaccinated:</strong> {lic.pet?.dateOfVaccination ? "हाँ / Yes" : "नहीं / No"}
              </div>
              <div className="grid-item">
                <strong>वर्ग / Category:</strong> {lic.pet?.category || "N/A"}
              </div>
              <div className="grid-item">
                <strong>टीकाकरण प्रमाणपत्र / Vaccination Certificate:</strong>
                {lic.pet?.vaccinationProofUrl ? (
                  <a href={lic.pet.vaccinationProofUrl} target="_blank" rel="noreferrer" className="certificate-link">View</a>
                ) : "N/A"}
              </div>
              <div className="grid-item">
                <strong>रंग / Color:</strong> {lic.pet?.color || "N/A"}
              </div>
              <div className="grid-item">
                <strong>माइक्रोचिप्ड / Microchipped:</strong> No 
              </div>
              <div className="grid-item">
                <strong>आयु / Age:</strong> {lic.pet?.age || "N/A"}
              </div>
              <div className="grid-item">
                <strong>अगला टीकाकरण / Next Vaccination:</strong> {formatDate(lic.pet?.dueVaccination)}
              </div>
              <div className="grid-item span-two">
                <strong>टीकाकरण की तारीख / Vaccination Date:</strong> {formatDate(lic.pet?.dateOfVaccination)}
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
                <strong>पता / Address:</strong> {`${lic.address?.streetName || ""}, ${lic.address?.city || ""}, ${lic.address?.state || ""} - ${lic.address?.pinCode || "N/A"}`}
              </div>
              <div className="grid-item">
                <strong>फोन नंबर / Phone Number:</strong> {lic.phoneNumber || "N/A"}
              </div>
              <div className="grid-item">
                <strong>{`जानवरों की संख्या / No. of ${getAnimalLabel(lic.animalType)}s:`}</strong> {lic.numberOfAnimals || "N/A"}
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
            <div className="qr-box">QR Code Placeholder</div> 
          </div>
          <div className="official-stamp">
            <div className="stamp-placeholder-circle">OFFICIAL STAMP</div> 
          </div>
        </div>

        <div className="certificate-footer">
          <Phone size={14} className="footer-icon" /> {lic.phoneNumber || "N/A"}  | 
          <MapPin size={14} className="footer-icon" /> info@example.org  |  
          <Globe size={14} className="footer-icon" /> www.example.org 
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
              <LayoutList size={16} /> All ({licenses.length})
            </button>
            <button
              className={`admin-tab ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <FileText size={16} />
                {newRegistrationsCount > 0 && <span className="notification-dot"></span>}
              </div>
              New ({newRegistrationsCount})
            </button>
            <button
              className={`admin-tab ${activeTab === 'provisional' ? 'active' : ''}`}
              onClick={() => setActiveTab('provisional')}
            >
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <Clock size={16} />
                {provisionalCount > 0 && <span className="notification-dot"></span>}
              </div>
              Provisional ({provisionalCount})
            </button>
            <button
              className={`admin-tab ${activeTab === 'renewals' ? 'active' : ''}`}
              onClick={() => setActiveTab('renewals')}
            >
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <Calendar size={16} />
                {pendingRenewalsCount > 0 && <span className="notification-dot"></span>}
              </div>
              Renewals ({pendingRenewalsCount})
            </button>
            <button
              className={`admin-tab ${activeTab === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveTab('approved')}
            >
              <Check size={16} /> Approved ({licenses.filter(l => l.status === 'approved' && !l.isProvisional).length})
            </button>
            <button
              className={`admin-tab ${activeTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveTab('rejected')}
            >
              <X size={16} /> Rejected ({licenses.filter(l => l.status === 'rejected').length})
            </button>
          </div>
        ) : (
          <div className="admin-filter-mobile">
            <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
              <option value="all">All ({licenses.length})</option>
              <option value="new">New Apps {newRegistrationsCount > 0 && `(${newRegistrationsCount})`}</option>
              <option value="provisional">Provisional {provisionalCount > 0 && `(${provisionalCount})`}</option>
              <option value="renewals">Renewals {pendingRenewalsCount > 0 && `(${pendingRenewalsCount})`}</option>
              <option value="approved">Approved ({licenses.filter(l => l.status === 'approved' && !l.isProvisional).length})</option>
              <option value="rejected">Rejected ({licenses.filter(l => l.status === 'rejected').length})</option>
            </select>
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
                <th>Reg. #</th>
                <th>Owner</th>
                {!isMobile && <th>Pet Name</th>}
                {!isMobile && <th>Animal Type</th>}
                <th>Status</th>
                {!isMobile && (activeTab === 'all' || activeTab === 'approved' || activeTab === 'provisional' || activeTab === 'rejected' || activeTab === 'renewals') && <th>Expiry Date</th>}
                {!isMobile && (activeTab === 'all' || activeTab === 'new' || activeTab === 'provisional') && <th>Applied Date</th>}
                {!isMobile && activeTab === 'renewals' && <th>Renewal Req. Date</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLicenses.map((lic) => (
                <tr
                  key={lic._id}
                  className={`${lic.status === 'renewal_pending' ? 'renewal-highlight' : ''} ${lic.status.toLowerCase()} ${lic.isProvisional ? 'provisional' : ''}`}
                  onClick={() => toggleExpanded(lic._id)}
                >
                  <td>{lic.license_Id || lic._id?.substring(0, 8)}</td>
                  <td><User size={16} className="cell-icon" /> {lic.fullName}</td>
                  {!isMobile && <td><PawPrint size={16} className="cell-icon" /> {lic.pet?.name || "N/A"}</td>}
                  {!isMobile && <td>{getAnimalLabel(lic.animalType) || "N/A"}</td>}
                  <td>{renderStatusBadge(lic)}</td>
                  {!isMobile && (activeTab === 'all' || activeTab === 'approved' || activeTab === 'provisional' || activeTab === 'rejected' || activeTab === 'renewals') && (
                    <td><Calendar size={16} className="cell-icon" /> {lic.isProvisional ? formatDate(lic.provisionalExpiryDate) : formatDate(lic.expiryDate)}</td>
                  )}
                  {!isMobile && (activeTab === 'all' || activeTab === 'new' || activeTab === 'provisional') && (
                    <td><Calendar size={16} className="cell-icon" /> {formatDate(lic.createdAt)}</td>
                  )}
                  {!isMobile && activeTab === 'renewals' && (
                    <td><Calendar size={16} className="cell-icon" /> {formatDate(lic.renewalRequestDate)}</td>
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
                      {!lic.isProvisional && (lic.status === "pending" || lic.status === "renewal_pending") && (
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
                              if (reason !== null && reason.trim() !== "") {
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
        
        {!selectedLicense.isProvisional && (selectedLicense.status === 'pending' || selectedLicense.status === 'renewal_pending') && (
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
                 if (reason !== null && reason.trim() !== "") {
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