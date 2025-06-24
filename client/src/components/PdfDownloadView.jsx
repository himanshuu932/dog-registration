// PdfDownloadView.jsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AlertCircle } from 'lucide-react';
import './PdfDownloadView.css'; // New CSS file for this component

// Helper functions (could be moved to a shared utility file if desired)
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

const PdfDownloadView = React.forwardRef(({ licenseData, languageType = 'en' }, ref) => {
  const lic = licenseData;
  const currentDateOnCertificate = new Date().toLocaleDateString('en-GB');

  const expiryDate = lic.isProvisional ?
    formatDate(lic.provisionalExpiryDate) :
    lic.pet?.dateOfVaccination ?
      new Date(new Date(lic.pet.dateOfVaccination).setFullYear(
        new Date(lic.pet.dateOfVaccination).getFullYear() + 1
      )).toLocaleDateString('en-GB') : "N/A";

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
      rulesTitle: 'Rules and Regulations / नियम और कानून',
      rules: [
        'Pet owners must ensure their animals are vaccinated against rabies annually. / पालतू पशु मालिकों को यह सुनिश्चित करना होगा कि उनके जानवरों को सालाना रेबीज का टीका लगाया जाए।',
        'Pets must be kept on a leash in public areas. / सार्वजनिक स्थानों पर पालतू जानवरों को पट्टा (लीश) लगाकर रखना चाहिए।',
        'Owners are responsible for cleaning up after their pets. / मालिकों को अपने पालतू जानवरों के बाद गंदगी साफ करने की जिम्मेदारी है।',
        'No person shall abandon any pet animal in any public place. / कोई भी व्यक्ति किसी भी पालतू जानवर को किसी भी सार्वजनिक स्थान पर नहीं छोड़ेगा।',
        'All pets must be registered with the local municipal authority. / सभी पालतू जानवरों को स्थानीय नगर पालिका प्राधिकरण के साथ पंजीकृत होना चाहिए।',
        'The license must be renewed annually. / लाइसेंस का नवीनीकरण सालाना किया जाना चाहिए।',
        'Any change in ownership or address must be reported to the authority. / स्वामित्व या पते में कोई भी बदलाव प्राधिकरण को सूचित किया जाना चाहिए।',
        'Keeping exotic or wild animals without proper authorization is prohibited. / उचित प्राधिकरण के बिना विदेशी या जंगली जानवरों को रखना प्रतिबंधित है।',
        'Cruelty to animals is strictly prohibited and punishable by law. / जानवरों के प्रति क्रूरता सख्त वर्जित है और कानून द्वारा दंडनीय है।',
        'Noise pollution caused by pets, especially barking, must be controlled. / पालतू जानवरों द्वारा उत्पन्न ध्वनि प्रदूषण, विशेष रूप से भौंकना, नियंत्रित किया जाना चाहिए।',
      ],
      paymentReferenceNoLabel: 'Payment Reference No. / भुगतान संदर्भ संख्या'
    },
    hi: {
      orgNameEn: 'Nagar Nigam Gorakhpur',
      orgNameHi: 'नगर निगम गोरखपुर',
      certificateTitleEn: 'PET LICENSE CERTIFICATE',
      certificateTitleHi: 'पशु लाइसेंस प्रमाणपत्र',
      provisionalCertificateTitleEn: 'PROVISIONAL PET LICENSE CERTIFICATE',
      provisionalCertificateTitleHi: 'अस्थायी पशु लाइसेंस प्रमाणपत्र',
      dateLabel: 'दिनांक:',
      photoPlaceholder: 'पशु की तस्वीर',
      declaration: <>मैं घोषणा करता/करती हूँ कि उपरोक्त दी गई जानकारी मेरी जानकारी के अनुसार सत्य है। <b>/</b> I declare that the information provided above is true to the best of my knowledge.</>,
      applicantSignature: 'आवेदक के हस्ताक्षर / Applicant\'s Signature',
      issuingAuthority: 'जारीकर्ता अधिकारी / Issuing Authority',
      qrCodeLabel: 'क्यूआर कोड',
      officialStamp: 'आधिकारिक मुहर',
      provisionalNoticeBanner: 'अस्थायी लाइसेंस: 30 दिनों के लिए वैध। पूर्ण लाइसेंस के लिए रेबीज प्रमाणीकरण आवश्यक है।',
      vetDetailsTitle: 'अनुमोदित पशु चिकित्सा क्लिनिक',
      vetNameLabel: 'पशु चिकित्सक:',
      vetClinicLabel: 'क्लिनिक:',
      vetPhoneLabel: 'संपर्क:',
      vetAddressLabel: 'पता:',
      provisionalInstructions: 'आपको अपने पालतू जानवर का टीकाकरण कराने और इसे पूर्ण लाइसेंस में बदलने के लिए 30 दिनों के भीतर अनुमोदित पशु चिकित्सा क्लिनिक पर जाना होगा।',
      animalTypeLabelBilingual: 'पशु का प्रकार / Animal Type',
      rulesTitle: 'नियम और कानून / Rules and Regulations',
      rules: [
        'पालतू पशु मालिकों को यह सुनिश्चित करना होगा कि उनके जानवरों को सालाना रेबीज का टीका लगाया जाए। / Pet owners must ensure their animals are vaccinated against rabies annually.',
        'सार्वजनिक स्थानों पर पालतू जानवरों को पट्टा (लीश) लगाकर रखना चाहिए। / Pets must be kept on a leash in public areas.',
        'मालिकों को अपने पालतू जानवरों के बाद गंदगी साफ करने की जिम्मेदारी है। / Owners are responsible for cleaning up after their pets.',
        'कोई भी व्यक्ति किसी भी पालतू जानवर को किसी भी सार्वजनिक स्थान पर नहीं छोड़ेगा। / No person shall abandon any pet animal in any public place.',
        'सभी पालतू जानवरों को स्थानीय नगर पालिका प्राधिकरण के साथ पंजीकृत होना चाहिए। / All pets must be registered with the local municipal authority.',
        'लाइसेंस का नवीनीकरण सालाना किया जाना चाहिए। / The license must be renewed annually.',
        'स्वामित्व या पते में कोई भी बदलाव प्राधिकरण को सूचित किया जाना चाहिए। / Any change in ownership or address must be reported to the authority.',
        'उचित प्राधिकरण के बिना विदेशी या जंगली जानवरों को रखना प्रतिबंधित है। / Keeping exotic or wild animals without proper authorization is prohibited.',
        'जानवरों के प्रति क्रूरता सख्त वर्जित है और कानून द्वारा दंडनीय है। / Cruelty to animals is strictly prohibited and punishable by law.',
        'पालतू जानवरों द्वारा उत्पन्न ध्वनि प्रदूषण, विशेष रूप से भौंकना, नियंत्रित किया जाना चाहिए। / Noise pollution caused by pets, especially barking, controlled.',
      ],
      paymentReferenceNoLabel: 'भुगतान संदर्भ संख्या / Payment Reference No.'
    }
  };

  const currentCertText = certificateText[languageType] || certificateText.en;

  const certTitleEn = lic.isProvisional ? currentCertText.provisionalCertificateTitleEn : currentCertText.certificateTitleEn;
  const certTitleHi = lic.isProvisional ? currentCertText.provisionalCertificateTitleHi : currentCertText.certificateTitleHi;

  return (
    <div ref={ref} className="pdf-download-layout">
      <div className="pdf-download-outer-border">
        <div className="pdf-download-border">
          <div className="pdf-download-header">
            <div className="pdf-download-header-left">
              <div className="pdf-download-logo-icon">
                <img src="/logo.webp" alt="Organization Logo" onError={(e) => e.target.style.display = 'none'} />
              </div>
              <div className="pdf-download-org-name">
                <h3>{currentCertText.orgNameEn}</h3>
                <h4>{currentCertText.orgNameHi}</h4>
              </div>
            </div>
            <div className="pdf-download-header-right">
              <div className="pdf-download-logo-icon">
                <img src="/up.webp" alt="State Logo" onError={(e) => e.target.style.display = 'none'} />
              </div>
            </div>
          </div>

          <div className="pdf-download-certificate-title">
            <h2>{certTitleEn}</h2>
            <h3>{certTitleHi}</h3>
          </div>

          <div className="pdf-download-body">
            <div className="pdf-download-photo-section">
              <div className="pdf-download-info-block">
                <div className="pdf-download-info-row"><div className="pdf-download-info-label">नाम / Name</div><div className="pdf-download-info-value">: {lic.fullName || "N/A"}</div></div>
                <div className="pdf-download-info-row"><div className="pdf-download-info-label">पंजीकरण संख्या / Registration No.</div><div className="pdf-download-info-value">: {lic.license_Id || "N/A"}</div></div>
                <div className="pdf-download-info-row"><div className="pdf-download-info-label">जारी दिनांक / Issue Date</div><div className="pdf-download-info-value">: {formatDate(lic.createdAt)}</div></div>
                <div className="pdf-download-info-row"><div className="pdf-download-info-label">समाप्ति तिथि / Expiry Date</div><div className="pdf-download-info-value">: {expiryDate}</div></div>
              </div>
              <div className="pdf-download-photo-box">
                {lic.pet?.avatarUrl ? (
                  <img src={lic.pet.avatarUrl} alt="Pet" className="pdf-download-photo" onError={(e) => e.target.src = 'https://placehold.co/100x120/e0e0e0/757575?text=No+Image'} />
                ) : (
                  <div className="pdf-download-photo-placeholder">{currentCertText.photoPlaceholder}</div>
                )}
              </div>
            </div>

            {lic.isProvisional && (
              <div className="pdf-download-details-section pdf-download-vet-details-section">
                <div className="pdf-download-section-title">{currentCertText.vetDetailsTitle}</div>
                <div className="pdf-download-details-columns">
                  <div className="pdf-download-details-column-left">
                    <div className="pdf-download-details-row"><div className="pdf-download-details-label">{currentCertText.vetNameLabel}</div><div className="pdf-download-details-value">{VET_DETAILS.name}</div></div>
                    <div className="pdf-download-details-row"><div className="pdf-download-details-label">{currentCertText.vetPhoneLabel}</div><div className="pdf-download-details-value">{VET_DETAILS.phone}</div></div>
                  </div>
                  <div className="pdf-download-details-column-right">
                    <div className="pdf-download-details-row"><div className="pdf-download-details-label">{currentCertText.vetClinicLabel}</div><div className="pdf-download-details-value">{VET_DETAILS.clinic}</div></div>
                    <div className="pdf-download-details-row"><div className="pdf-download-details-label">{currentCertText.vetAddressLabel}</div><div className="pdf-download-details-value">{VET_DETAILS.address}</div></div>
                  </div>
                </div>
                <div className="pdf-download-provisional-instructions">
                  <p>{currentCertText.provisionalInstructions}</p>
                </div>
              </div>
            )}

            <div className="pdf-download-details-section pdf-download-pet-details-section">
              <div className="pdf-download-section-title">पशु का विवरण / Pet Details</div>
              <div className="pdf-download-details-columns">
                <div className="pdf-download-details-column-left">
                  <div className="pdf-download-details-row"><div className="pdf-download-details-label">{currentCertText.animalTypeLabelBilingual}</div><div className="pdf-download-details-value">: {getAnimalLabel(lic.animalType) || "N/A"}</div></div>
                  <div className="pdf-download-details-row"><div className="pdf-download-details-label">पशु का नाम / Pet Name</div><div className="pdf-download-info-value">: {lic.pet?.name || "N/A"}</div></div>
                  <div className="pdf-download-details-row"><div className="pdf-download-details-label">नस्ल / Breed</div><div className="pdf-download-info-value">: {lic.pet?.breed || "N/A"}</div></div>
                  <div className="pdf-download-details-row"><div className="pdf-download-details-label">वर्ग / Category</div><div className="pdf-download-info-value">: {lic.pet?.category || "N/A"}</div></div>
                  <div className="pdf-download-details-row"><div className="pdf-download-details-label">रंग / Color</div><div className="pdf-download-info-value">: {lic.pet?.color || "N/A"}</div></div>
                  <div className="pdf-download-details-row"><div className="pdf-download-details-label">आयु / Age</div><div className="pdf-download-info-value">: {lic.pet?.age || "N/A"}</div></div>
                </div>
                <div className="pdf-download-details-column-right">
                  <div className="pdf-download-details-row"><div className="pdf-download-details-label">लिंग / Gender</div><div className="pdf-download-info-value">: {lic.pet?.sex || "N/A"}</div></div>
                  <div className="pdf-download-details-row"><div className="pdf-download-details-label">टीकाकरण की तारीख / Vaccination Date</div><div className="pdf-download-info-value">: {formatDate(lic.pet?.dateOfVaccination)}</div></div>
                  <div className="pdf-download-details-row"><div className="pdf-download-details-label">टीकाकरण / Vaccinated</div><div className="pdf-download-info-value">: {lic.pet?.dateOfVaccination ? (languageType === 'hi' ? ' हां' : ' Yes') : (languageType === 'hi' ? ' नहीं' : ' No')}</div></div>
                  {lic.pet?.vaccinationProofUrl && (<div className="pdf-download-details-row"><div className="pdf-download-details-label">टीकाकरण प्रमाणपत्र / Vaccination Certificate</div><div className="pdf-download-info-value"><a href={lic.pet.vaccinationProofUrl} target="_blank" rel="noreferrer noopener" className="pdf-download-vaccine-link">View</a></div></div>)}
                  <div className="pdf-download-details-row"><div className="pdf-download-details-label">माइक्रोचिप / Microchipped</div><div className="pdf-download-info-value">: {languageType === 'hi' ? 'नहीं' : 'No'}</div></div>
                  <div className="pdf-download-details-row"><div className="pdf-download-details-label">अगला टीकाकरण / Next Vaccination</div><div className="pdf-download-info-value">: {formatDate(lic.pet?.dueVaccination)}</div></div>
                </div>
              </div>
            </div>

            <div className="pdf-download-details-section pdf-download-owner-details-section">
              <div className="pdf-download-section-title">मालिक का विवरण / Owner Details</div>
              <div className="pdf-download-owner-details-table">
                <div className="pdf-download-details-row"><div className="pdf-download-details-label">पता / Address</div><div className="pdf-download-details-value">: {`${lic.address?.streetName || ""}, ${lic.address?.city || ""}, ${lic.address?.state || ""} - ${lic.address?.pinCode || "N/A"}`}</div></div>
                <div className="pdf-download-details-row"><div className="pdf-download-details-label">फोन नंबर / Phone Number</div><div className="pdf-download-details-value">: {lic.phoneNumber || "N/A"}</div></div>
                <div className="pdf-download-details-row"><div className="pdf-download-details-label">{`जानवरों की संख्या / No. of ${getAnimalLabel(lic.animalType)}s`}</div><div className="pdf-download-details-value">:{lic.numberOfAnimals || "N/A"}</div></div>
                <div className="pdf-download-details-row"><div className="pdf-download-details-label">घर का क्षेत्रफल / House Area</div><div className="pdf-download-details-value">: {lic.totalHouseArea ? `${lic.totalHouseArea} sq meter` : "N/A"}</div></div>
                <div className="pdf-download-details-row">
                  <div className="pdf-download-details-label">{currentCertText.paymentReferenceNoLabel}</div>
                  <div className="pdf-download-details-value">: {lic.paymentReferenceNo || "N/A"}</div>
                </div>
              </div>
            </div>

            <div className="pdf-download-declaration"><p>{currentCertText.declaration}</p></div>
          </div>

          <div className="pdf-download-footer-bottom">
            <div className="pdf-download-qr-code-area">
              <QRCodeSVG
                id={`qr-${lic.license_Id}`}
                value={lic.license_Id || 'N/A'}
                size={150}
                level={"H"}
                includeMargin={true}
              />
            </div>
            {lic.isProvisional && (
              <div className="pdf-download-provisional-notice-banner">
                <AlertCircle size={14} />
                <span>{currentCertText.provisionalNoticeBanner}</span>
              </div>
            )}
            <div className="pdf-download-stamp-area">
              <div className="pdf-download-stamp-placeholder"><p>{currentCertText.officialStamp}</p></div>
            </div>
          </div>
          <div className="pdf-download-contact-footer">
            <span>{currentCertText.dateLabel} {currentDateOnCertificate}</span>
          </div>
        </div>
      </div>

      <div className="pdf-download-outer-border pdf-download-rules-page">
        <div className="pdf-download-border">
          <div className="pdf-download-header">
            <div className="pdf-download-header-left">
              <div className="pdf-download-logo-icon">
                <img src="/logo.webp" alt="Organization Logo" onError={(e) => e.target.style.display = 'none'} />
              </div>
              <div className="pdf-download-org-name">
                <h3>{currentCertText.orgNameEn}</h3>
                <h4>{currentCertText.orgNameHi}</h4>
              </div>
            </div>
            <div className="pdf-download-header-right">
              <div className="pdf-download-logo-icon">
                <img src="/up.webp" alt="State Logo" onError={(e) => e.target.style.display = 'none'} />
              </div>
            </div>
          </div>
          <div className="pdf-download-rules-box">
            <h2 className="pdf-download-rules-title">{currentCertText.rulesTitle}</h2>
            <ul className="pdf-download-rules-list">
              {currentCertText.rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
          <div className="pdf-download-contact-footer pdf-download-rules-footer">
            <span>{currentCertText.dateLabel} {currentDateOnCertificate}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PdfDownloadView;