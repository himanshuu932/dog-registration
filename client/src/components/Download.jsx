// Download.jsx (Modified)
import React, { useEffect, useState, useRef } from "react";
import html2pdf from 'html2pdf.js';
import './styles/Download.css'; // Original CSS for responsive view
import PdfDownloadView from './PdfDownloadView'; // Import the new component
import {
  Download,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  User,
  Dog,
  Eye,
  ChevronLeft,
  ChevronDown,
  Filter,
  RefreshCcw
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
};

const UserStatusBadge = ({ status, isMobile, languageType = 'en' }) => {
  const statusText = {
    en: {
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected',
      provisional: 'Provisional',
      'provisional approved': 'Provisional Approved',
      'provisional pending': 'Provisional Pending',
      'provisional rejected': 'Provisional Rejected',
      'payment_processing': 'Payment Processing'
    },
    hi: {
      approved: 'स्वीकृत',
      pending: 'लंबित',
      rejected: 'अस्वीकृत',
      provisional: 'अस्थायी',
      'provisional approved': 'अस्थायी स्वीकृत',
      'provisional pending': 'अस्थायी लंबित',
      'provisional rejected': 'अस्थायी अस्वीकृत',
      'payment_processing': 'भुगतान प्रक्रियाधीन'
    }
  };

  const currentStatusText = statusText[languageType] || statusText.en;
  const statusKey = status ? status.toLowerCase() : 'default';

  let badgeClass = "user-dl-status-badge";
  let Icon = AlertCircle;

  switch(statusKey) {
    case 'approved':
    case 'provisional approved':
      badgeClass += " user-dl-status-approved";
      Icon = CheckCircle;
      break;
    case 'pending':
    case 'provisional pending':
      badgeClass += " user-dl-status-pending";
      Icon = Clock;
      break;
    case 'rejected':
    case 'provisional rejected':
      badgeClass += " user-dl-status-rejected";
      Icon = XCircle;
      break;
    case 'provisional':
      badgeClass += " user-dl-status-provisional";
      Icon = Clock;
      break;
    case 'payment_processing':
      badgeClass += " user-dl-status-payment-processing";
      Icon = Clock;
      break;
    default:
      badgeClass += " user-dl-status-default";
      Icon = AlertCircle;
  }

  const displayStatusText = currentStatusText[statusKey] || status;

  return (
    <span className={badgeClass}>
      <Icon size={isMobile ? 14 : 16} />
      { <span>{displayStatusText}</span>}
    </span>
  );
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


const DogLicenseDownload = ({ languageType = 'en' }) => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLicenseId, setExpandedLicenseId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);
  const pdfDownloadRef = useRef(null); // Ref for the PdfDownloadView component

  const backend = "http://localhost:5000";
  const token = localStorage.getItem('token');

  const textContent = {
    en: {
      pageTitle: 'My Pet License Applications',
      filterLabel: 'Filter by:',
      filterDropdownLabel: 'Filter Status',
      filterButtons: { all: 'All', approved: 'Approved', pending: 'Pending', rejected: 'Rejected', provisional: 'Provisional', payment_processing: 'Payment Processing' },
      backToList: 'Back to Applications List',
      loadingData: 'Loading license data…',
      tableHeaders: { regNo: 'Reg. No', owner: 'Owner', petName: 'Pet Name', animalType: 'Animal Type', payRefNo: 'Pay Ref No.', status: 'Status', appliedDate: 'Applied Date', view: 'View/Download' },
      emptyState: { noApplications: 'You have not applied for any licenses yet.', noFiltered: (status) => `No "${status}" licenses found.`, applyButton: 'Apply for a New License' },
      verifyPaymentButton: 'Verify Payment Status',
      downloadPdfButton: 'Download PDF', // Added for the button text
      pendingNotice: <>Your application is under review. You will be able to download the license once approved.</>,
      rejectedNotice: (rejectionDate) => <>Your application has been rejected on {formatDate(rejectionDate)}.</>,
      reasonLabel: 'Reason:',
      contactSupport: <>Please contact support for more information.</>,
    },
    hi: {
      pageTitle: 'मेरे पालतू पशु लाइसेंस आवेदन',
      filterLabel: 'फ़िल्टर करें:',
      filterDropdownLabel: 'फ़िल्टर स्थिति',
      filterButtons: { all: 'सभी', approved: 'स्वीकृत', pending: 'लंबित', rejected: 'अस्वीकृत', provisional: 'अस्थायी', payment_processing: 'भुगतान प्रक्रियाधीन' },
      backToList: 'आवेदन सूची पर वापस जाएं',
      loadingData: 'लाइसेंस डेटा लोड हो रहा है…',
      tableHeaders: { regNo: 'पंजीकरण संख्या', owner: 'मालिक', petName: 'पशु का नाम', animalType: 'पशु का प्रकार', payRefNo: 'भुगतान संदर्भ संख्या', status: 'स्थिति', appliedDate: 'आवेदन की तिथि', view: 'देखें/डाउनलोड करें' },
      emptyState: { noApplications: 'आपने अभी तक किसी भी लाइसेंस के लिए आवेदन नहीं किया है।', noFiltered: (status) => `कोई भी "${status}" लाइसेंस नहीं मिला।`, applyButton: 'नए लाइसेंस के लिए आवेदन करें' },
      verifyPaymentButton: 'भुगतान स्थिति सत्यापित करें',
      downloadPdfButton: 'पीडीएफ डाउनलोड करें',
      pendingNotice: <>आपका आवेदन समीक्षाधीन है। अनुमोदन के बाद ही आप लाइसेंस डाउनलोड कर पाएंगे।</>,
      rejectedNotice: (rejectionDate) => <>आपका आवेदन {formatDate(rejectionDate)} को अस्वीकृत कर दिया गया है।</>,
      reasonLabel: 'कारण:',
      contactSupport: <>अधिक जानकारी के लिए कृपया सहायता से संपर्क करें।</>,
    }
  };
  const currentText = textContent[languageType] || textContent.en;

  const getFilterButtonText = (statusKey) => currentText.filterButtons[statusKey] || statusKey;

  const getTranslatedFilterStatus = (englishStatus) => {
    const statusKey = Object.keys(textContent.en.filterButtons).find(key => textContent.en.filterButtons[key] === englishStatus);
    if (statusKey) {
      return currentText.filterButtons[statusKey] || englishStatus;
    }
    return englishStatus;
  };


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterDropdownRef]);


  const fetchLicenses = () => {
    setLoading(true);
    fetch(`${backend}/api/license/user`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.message || 'Failed to fetch licenses'); }))
      .then(data => {
        const sortedLicenses = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLicenses(sortedLicenses);
      })
      .catch(error => {
        console.error("Error fetching licenses:", error);
        setLicenses([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLicenses();
  }, [backend, token]);

  const toggleExpanded = (id) => setExpandedLicenseId(prevId => (prevId === id ? null : id));

  const downloadPDF = (lic) => {
    if (!pdfDownloadRef.current) {
      console.error("PDF element not found for download.");
      return;
    }

    const element = pdfDownloadRef.current;
    const animalTypeForName = lic.animalType || 'Pet';

    const opt = {
      margin: 0,
      filename: `${getAnimalLabel(animalTypeForName)}_License_${lic.pet?.name ? lic.pet.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Pet'}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    setTimeout(() => {
      html2pdf().from(element).set(opt).save()
        .catch(error => console.error("PDF generation failed:", error));
    }, 100);
  };

  const handleVerifyPayment = async (licenseId, paymentReferenceNo) => {
    if (!paymentReferenceNo) {
      alert(languageType === 'en' ? 'Payment reference number is not available.' : 'भुगतान संदर्भ संख्या उपलब्ध नहीं है।');
      return;
    }

    try {
      setLoading(true);
      const verificationUrl = `${backend}/verify-eazypay-payment?pgreferenceno=${paymentReferenceNo}`;

      const response = await fetch(verificationUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(languageType === 'en' ? data.message || 'Payment verification successful!' : data.message || 'भुगतान सत्यापन सफल रहा!');
        console.log("Payment verification successful:", data);
        fetchLicenses();
      } else {
        alert(languageType === 'en' ? data.message || 'Payment verification failed.' : data.message || 'भुगतान सत्यापन विफल रहा।');
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert(languageType === 'en' ? 'An error occurred during payment verification.' : 'भुगतान सत्यापन के दौरान एक त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  const selectedLicense = licenses.find(lic => lic._id === expandedLicenseId);

  const filteredLicenses = licenses.filter(license => {
    if (filterStatus === 'All') return true;
    if (filterStatus.toLowerCase() === 'provisional') {
      return license.isProvisional;
    }
    return license.status && license.status.toLowerCase() === filterStatus.toLowerCase();
  });


  if (loading) {
    return (
      <main className="user-dl-page-container">
        <div className="user-dl-loading-state">
          <div className="user-dl-spinner-animation"></div>
          <p className="user-dl-loading-text">{currentText.loadingData}</p>
        </div>
      </main>
    );
  }

  if (selectedLicense) {
    return (
      <main className="user-dl-page-container user-dl-certificate-focused-view">
        <header className="user-dl-page-header user-dl-certificate-view-header">
          <button onClick={() => toggleExpanded(null)} className="user-dl-back-button">
            <ChevronLeft size={20} />
            {currentText.backToList}
          </button>
        </header>

        {/* This is the PDF render component */}
        <div className="user-dl-certificate-display-area">
          <PdfDownloadView licenseData={selectedLicense} languageType={languageType} ref={pdfDownloadRef} />

          {(selectedLicense.status === 'approved' || selectedLicense.isProvisional) && (
            <button
              className="user-dl-action-button user-dl-certificate-download-btn"
              onClick={() => downloadPDF(selectedLicense)}
            >
              <Download size={18} />
              <span>{currentText.downloadPdfButton}</span>
            </button>
          )}

          {selectedLicense.status === 'pending' && !selectedLicense.isProvisional && (
            <div className="user-dl-notice user-dl-pending-notice">
              <AlertCircle size={18} />
              <p>{currentText.pendingNotice}</p>
            </div>
          )}

          {selectedLicense.status === 'rejected' && (
            <div className="user-dl-notice user-dl-rejected-notice">
              <XCircle size={18} />
              <div>
                <p>{currentText.rejectedNotice(selectedLicense.rejectionDate)}</p>
                {selectedLicense.rejectionReason && (
                  <div className="user-dl-rejection-reason-box">
                    <strong>{currentText.reasonLabel}</strong> {selectedLicense.rejectionReason}
                  </div>
                )}
                <p>{currentText.contactSupport}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="user-dl-page-container">
      <header className="user-dl-page-header">
        <h1 className="user-dl-main-title">{currentText.pageTitle}</h1>

        {isMobile ? (
          <div className="user-dl-filter-dropdown-container" ref={filterDropdownRef}>
            <button
              className="user-dl-filter-dropdown-button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter size={20} />
              <span>{currentText.filterDropdownLabel}: {getTranslatedFilterStatus(filterStatus)}</span>
              <ChevronDown size={20} className={`user-dl-dropdown-chevron ${showFilterDropdown ? 'user-dl-dropdown-chevron-open' : ''}`} />
            </button>
            {showFilterDropdown && (
              <ul className="user-dl-filter-dropdown-list">
                {Object.keys(currentText.filterButtons).map(key => (
                  <li
                    key={key}
                    className={filterStatus === key.charAt(0).toUpperCase() + key.slice(1) ? 'user-dl-dropdown-item-active' : ''}
                    onClick={() => {
                      setFilterStatus(key.charAt(0).toUpperCase() + key.slice(1));
                      setShowFilterDropdown(false);
                    }}
                  >
                    {getFilterButtonText(key)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="user-dl-filter-controls">
            <span className="user-dl-filter-label-text">{currentText.filterLabel}</span>
            {Object.keys(currentText.filterButtons).map(key => (
              <button
                key={key}
                className={`user-dl-filter-button user-dl-filter-style-${key.toLowerCase()} ${filterStatus === (key.charAt(0).toUpperCase() + key.slice(1)) ? 'user-dl-filter-active' : ''}`}
                onClick={() => setFilterStatus(key.charAt(0).toUpperCase() + key.slice(1))}
              >
                {getFilterButtonText(key)}
              </button>
            ))}
          </div>
        )}
      </header>

      {filteredLicenses.length > 0 ? (
        <div className="user-dl-table-container">
          <table className="user-dl-data-table">
            <thead>
              <tr>
                <th>{currentText.tableHeaders.regNo}</th>
                <th>{currentText.tableHeaders.owner}</th>
                {!isMobile && <th>{currentText.tableHeaders.petName}</th>}
                {!isMobile && <th>{currentText.tableHeaders.animalType}</th>}
                <th>{currentText.tableHeaders.payRefNo}</th> {/* Updated table header */}
                <th>{currentText.tableHeaders.status}</th>
                {!isMobile && <th>{currentText.tableHeaders.appliedDate}</th>}
                {!isMobile && <th>{currentText.tableHeaders.view}</th>}
              </tr>
            </thead>
            <tbody>
              {filteredLicenses.map(license => (
                <tr key={license._id} onClick={() => toggleExpanded(license._id)} className="user-dl-table-row-clickable">
                  <td><div className="user-dl-table-cell-content">{!isMobile && <FileText size={16} className="user-dl-cell-icon-style" />} {license.license_Id || "N/A"}</div></td>
                  <td><div className="user-dl-table-cell-content">{!isMobile && <User size={16} className="user-dl-cell-icon-style" />} {license.fullName}</div></td>
                  {!isMobile && <td><div className="user-dl-table-cell-content"><Dog size={16} className="user-dl-cell-icon-style" /> {license.pet?.name || "N/A"}</div></td>}
                  {!isMobile && <td><div className="user-dl-table-cell-content">{getAnimalLabel(license.animalType) || "N/A"}</div></td>}
                  <td>
                    <div className="user-dl-table-cell-content">
                      {license.paymentReferenceNo || "N/A"}
                      {/* Button for payment_processing status */}
                      {license.status === 'payment_processing' && license.paymentReferenceNo && (
                        <button
                          className="user-dl-verify-payment-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifyPayment(license._id, license.paymentReferenceNo);
                          }}
                          title={currentText.verifyPaymentButton}
                        >
                          <RefreshCcw size={14} />
                          {isMobile ? '' : <span>{currentText.verifyPaymentButton}</span>}
                        </button>
                      )}
                    </div>
                  </td>
                  <td><div className="user-dl-table-cell-content"><UserStatusBadge status={license.isProvisional ? `provisional ${license.status}` : license.status} isMobile={isMobile} languageType={languageType} /></div></td>
                {!isMobile && <td><div className="user-dl-table-cell-content"><Calendar size={16} className="user-dl-cell-icon-style" /> {formatDate(license.createdAt)}</div></td>}
                  {!isMobile && (
                    <td>
                      <button
                        className="user-dl-table-view-button"
                        onClick={(e) => { e.stopPropagation(); toggleExpanded(license._id); }}
                      >
                        <Eye size={16} className="user-dl-button-icon-style" />
                         <span>{currentText.tableHeaders.view.split('/')[0]}</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="user-dl-empty-data-state">
          <div className="user-dl-empty-state-icon"><FileText size={48} /></div>
          <p className="user-dl-no-data-text">
            {filterStatus === 'All' ? currentText.emptyState.noApplications : currentText.emptyState.noFiltered(getTranslatedFilterStatus(filterStatus))}
          </p>
          {filterStatus === 'All' && licenses.length === 0 &&
            <button className="user-dl-apply-new-button" onClick={() => alert('Navigate to application form') /* Replace with actual navigation */}>
              {currentText.emptyState.applyButton}
            </button>
          }
        </div>
      )}
    </main>
  );
};

export default DogLicenseDownload;