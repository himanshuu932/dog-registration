import React, { useState, useCallback, useEffect } from 'react';
import './styles/Petform.css'; // Ensure this path is correct
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS
import { RefreshCw } from 'lucide-react'; // For the refresh CAPTCHA button

const PetRegistrationForm = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarFileName, setAvatarFileName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);
  const [vaccinationProof, setVaccinationProof] = useState({
    url: '',
    publicId: ''
  });
  const [fineFees, setFineFees] = useState(0);
  const [totalFees, setTotalFees] = useState(200); // Initial registration fee

  // CAPTCHA States
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // Animal type data
  const animalBreeds = {
    Dog: ['Any', 'Labrador', 'German Shepherd', 'Golden Retriever', 'Other'],
    Cat: ['Any', 'Persian', 'Siamese', 'Maine Coon', 'Other'],
    Rabbit: ['Any', 'Dutch', 'Lionhead', 'Flemish Giant', 'Other']
  };

  const animalCategories = {
    Dog: ['Indian/Desi', 'Foreign Breed'],
    Cat: ['Indian', 'Foreign'],
    Rabbit: ['Domestic', 'Foreign']
  };

  const VET_DETAILS = {
    name: "Dr. John Smith",
    clinic: "City Veterinary Hospital",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, Gorakhpur, UP 273001",
    instructions: "Please visit the above veterinary clinic within 30 days to vaccinate your pet and convert your provisional license to a full license."
  };

  const initialFormData = {
    animalType: 'Dog',
    fullName: '',
    phoneNumber: '',
    gender: '',
    streetName: '',
    pinCode: '',
    city: '',
    state: '',
    isVaccinated: '',
    totalHouseArea: '',
    numberOfDogs: '1',
    petName: '',
    petCategory: '',
    petBreed: '',
    petColor: '',
    petAge: '',
    petSex: '',
    dateOfVaccination: '',
    dueVaccination: '',
    declaration1: false,
    declaration2: false,
    declaration3: false,
    declaration4: false
  };

  const [formData, setFormData] = useState(initialFormData);

  const backend = "http://localhost:5000"; // Adjust this to your backend URL

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: ''
    }));

    if (name === 'animalType' || (name === 'petCategory' && value === 'Indian/Desi' && formData.animalType === 'Dog')) {
      setFormData(prev => ({
        ...prev,
        petBreed: ''
      }));
    }
    if (name === 'isVaccinated' && value === 'No') {
      setFormData(prev => ({
        ...prev,
        dateOfVaccination: '',
        dueVaccination: '',
      }));
      setFile(null);
      setFileName('No file chosen');
      setVaccinationProof({ url: '', publicId: '' });
    }
  };

  const calculateFineFees = () => {
    const registrationDate = new Date();
    const financialYearEnd = new Date(registrationDate.getFullYear(), 2, 31);
    let fees = 0;
    if (registrationDate > financialYearEnd) {
      const currentMonth = registrationDate.getMonth();
      const currentDay = registrationDate.getDate();
      if (currentMonth === 3) {
        fees = 0;
      } else if (currentMonth === 4) {
        fees = 100;
      } else if (currentMonth > 4) {
        fees = 100;
        let daysForDailyFine = 0;
        for (let i = 5; i < currentMonth; i++) {
          const year = registrationDate.getFullYear();
          daysForDailyFine += new Date(year, i + 1, 0).getDate();
        }
        daysForDailyFine += currentDay;
        fees += daysForDailyFine * 50;
      }
    }
    setFineFees(fees);
    setTotalFees(200 + fees);
  };

  const validateStep = () => {
    const newErrors = {};
    if (activeTab === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.streetName.trim()) newErrors.streetName = 'Street name is required';
      if (!formData.pinCode.trim()) newErrors.pinCode = 'Pin code is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.totalHouseArea) newErrors.totalHouseArea = 'Total house area is required';
      if (!formData.numberOfDogs) newErrors.numberOfDogs = 'Number of animals is required';
    } else if (activeTab === 2) {
      if (!formData.petName.trim()) newErrors.petName = `${formData.animalType} Name is required`;
      if (!formData.petCategory) newErrors.petCategory = `${formData.animalType} Category is required`;
      if (!(formData.animalType === 'Dog' && formData.petCategory === 'Indian/Desi')) {
        if (!formData.petBreed) {
          newErrors.petBreed = `${formData.animalType} Breed is required`;
        }
      }
      if (!formData.petColor.trim()) newErrors.petColor = `${formData.animalType} Colour is required`;
      if (!formData.petAge) newErrors.petAge = `${formData.animalType} Age is required`;
      if (!formData.petSex) newErrors.petSex = `${formData.animalType} Sex is required'`;
      if (!formData.isVaccinated) newErrors.isVaccinated = 'Vaccination status is required';
      if (formData.isVaccinated === 'Yes') {
        if (!formData.dateOfVaccination) newErrors.dateOfVaccination = 'Vaccination Date is required';
        if (!formData.dueVaccination) newErrors.dueVaccination = 'Due Date is required';
        if (!file && !vaccinationProof.url) newErrors.vaccinationCertificate = 'Vaccination Certificate is required (upload or select file)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeTab === 2) {
        calculateFineFees();
      }
      setActiveTab((prev) => prev + 1);
    } else {
      toast.error('Please fill in all required fields.');
    }
  };

  const handleBack = () => {
    setActiveTab((prev) => prev - 1);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setErrors(prev => ({ ...prev, vaccinationCertificate: '' }));
    }
  };

  const uploadFile = async () => {
    if (!file) {
      toast.error('Please select a file to upload for vaccination certificate.');
      setErrors(prev => ({ ...prev, vaccinationCertificate: 'Please select a file' }));
      return false;
    }
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, or PDF files are allowed for vaccination certificate.');
      setErrors(prev => ({ ...prev, vaccinationCertificate: 'Only JPG, PNG, or PDF files are allowed' }));
      return false;
    }
    if (file.size > 5000000) { // 5MB
      toast.error('Vaccination certificate file size must be less than 5MB.');
      setErrors(prev => ({ ...prev, vaccinationCertificate: 'File size must be less than 5MB' }));
      return false;
    }
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const fd = new FormData(); // Renamed to fd to avoid conflict if formData is in scope
      fd.append('file', file);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${backend}/api/license/upload`, fd, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      setVaccinationProof({
        url: response.data.url,
        publicId: response.data.publicId
      });
      setIsUploading(false);
      toast.success('Vaccination certificate uploaded successfully!');
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Vaccination certificate file upload failed.');
      setErrors(prev => ({ ...prev, vaccinationCertificate: 'File upload failed' }));
      setIsUploading(false);
      return false;
    }
  };

  const handleAvatarChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setAvatarFile(selectedFile);
      setAvatarFileName(selectedFile.name);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast.info('No avatar file selected. Skipping avatar upload.');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(avatarFile.type)) {
      toast.error('Only JPG or PNG files are allowed for avatar.');
      return;
    }
    if (avatarFile.size > 5000000) { // 5MB
      toast.error('Avatar file size must be less than 5MB.');
      return;
    }
    try {
      setIsUploadingAvatar(true);
      setAvatarUploadProgress(0);
      const fd = new FormData(); // Renamed to fd
      fd.append('file', avatarFile);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${backend}/api/license/upload`, fd, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setAvatarUploadProgress(percentCompleted);
        }
      });
      setAvatarUrl(response.data.url);
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setActiveTab(1);
    setErrors({});
    setFile(null);
    setFileName('No file chosen');
    setUploadProgress(0);
    setIsUploading(false);
    setAvatarFile(null);
    setAvatarFileName('');
    setAvatarUrl('');
    setIsUploadingAvatar(false);
    setAvatarUploadProgress(0);
    setVaccinationProof({ url: '', publicId: '' });
    setFineFees(0);
    setTotalFees(200);
    // Reset CAPTCHA fields
    setCaptchaSvg('');
    setCaptchaToken('');
    setCaptchaInput('');
    setCaptchaError('');
  };

  // --- CAPTCHA Functions ---
  const loadCaptcha = useCallback(async () => {
    setCaptchaInput('');
    setCaptchaError('');
    setCaptchaSvg('');
    setCaptchaToken('');
    try {
      const res = await axios.get(`${backend}/api/captcha/get-captcha`);
      if (res.data && res.data.svg && res.data.token) {
        setCaptchaSvg(res.data.svg);
        setCaptchaToken(res.data.token);
      } else {
        throw new Error("Received invalid CAPTCHA data from server.");
      }
    } catch (err) {
      console.error("Failed to load CAPTCHA:", err);
      const errorMessage = err.response?.data?.message || "Failed to load CAPTCHA. Please try refreshing.";
      setCaptchaError(errorMessage);
      toast.error(errorMessage);
    }
  }, [backend]);

  useEffect(() => {
    if (activeTab === 3) {
      loadCaptcha();
    }
  }, [activeTab, loadCaptcha]);

  const renderCaptchaFields = () => (
    activeTab === 3 && (
      <div className="form-group captcha-section" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <label htmlFor="captchaInput" style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>
          CAPTCHA <span className="required">*</span>
        </label>
        {captchaError && !captchaSvg && (
            <>
                <span className="error-text" style={{ display: 'block', marginBottom: '10px', color: 'red' }}>{captchaError}</span>
                <button
                    type="button"
                    onClick={loadCaptcha}
                    title="Refresh CAPTCHA"
                    className="refresh-captcha-btn"
                    style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px', background: '#f0f0f0' }}
                >
                    <RefreshCw size={18} /> Refresh CAPTCHA
                </button>
            </>
        )}
        {captchaSvg && (
          <div className="captcha-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <div className="captcha-svg-container" dangerouslySetInnerHTML={{ __html: captchaSvg }} />
            <button
              type="button"
              onClick={loadCaptcha}
              title="Refresh CAPTCHA"
              className="refresh-captcha-btn"
              style={{ border: '1px solid #ccc', borderRadius: '4px', background: 'none', cursor: 'pointer', padding: '5px', height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RefreshCw size={22} />
            </button>
          </div>
        )}
        {captchaSvg && (
            <input
              type="text"
              id="captchaInput"
              name="captchaInput"
              className="captcha-input-field"
              placeholder="Enter CAPTCHA"
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value);
                if (captchaError) setCaptchaError('');
              }}
              required
              style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box', marginTop: '5px' }}
            />
        )}
         {captchaError && captchaSvg && (
            <span className="error-text" style={{ display: 'block', marginTop: '5px', color: 'red' }}>{captchaError}</span>
        )}
      </div>
    )
  );
  // --- END CAPTCHA ---

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.declaration1 || !formData.declaration2 || !formData.declaration3 || !formData.declaration4) {
      toast.error('Please accept all declarations before submitting.');
      return;
    }

    // --- CAPTCHA VERIFICATION ---
    if (activeTab === 3) { // Ensure CAPTCHA is only for the final step submission
        if (!captchaInput.trim()) {
          toast.error("Please enter the CAPTCHA.");
          setCaptchaError("CAPTCHA is required.");
          return;
        }
        if (!captchaToken) {
          toast.error("CAPTCHA not loaded. Please refresh.");
          setCaptchaError("CAPTCHA not loaded. Please refresh.");
          loadCaptcha();
          return;
        }
        try {
          const captchaRes = await axios.post(`${backend}/api/captcha/verify-captcha`, {
            captchaInput,
            captchaToken,
          });
          if (!captchaRes.data?.success) {
            toast.error("Invalid CAPTCHA. Please try again.");
            setCaptchaError("Invalid CAPTCHA. Please try again.");
            loadCaptcha();
            return;
          }
          setCaptchaError('');
        } catch (captchaErr) {
          console.error("CAPTCHA verification error:", captchaErr);
          const errorMessage = captchaErr.response?.data?.message || "Failed to verify CAPTCHA. An error occurred.";
          toast.error(errorMessage);
          setCaptchaError(errorMessage);
          loadCaptcha();
          return;
        }
    }
    // --- END CAPTCHA VERIFICATION ---

    if (formData.isVaccinated === 'Yes' && file && !vaccinationProof.url) {
      const uploadSuccess = await uploadFile();
      if (!uploadSuccess) return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to submit the form.');
        return;
      }
      const submissionData = {
        animalType: formData.animalType,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        streetName: formData.streetName,
        pinCode: formData.pinCode,
        city: formData.city,
        state: formData.state,
        totalHouseArea: formData.totalHouseArea,
        numberOfAnimals: formData.numberOfDogs, // Corrected key
        pet: {
          name: formData.petName,
          category: formData.petCategory,
          breed: formData.petBreed,
          color: formData.petColor,
          age: formData.petAge,
          sex: formData.petSex,
          isVaccinated: formData.isVaccinated,
          ...(formData.isVaccinated === 'Yes' && {
            dateOfVaccination: formData.dateOfVaccination,
            dueVaccination: formData.dueVaccination,
            vaccinationProofUrl: vaccinationProof.url,
            vaccinationProofPublicId: vaccinationProof.publicId,
          }),
          avatarUrl: avatarUrl
        },
        fees: {
          total: totalFees,
          fine: fineFees
        }
      };
      const res = await axios.post(`${backend}/api/license/apply`, submissionData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Form submitted successfully!');
      console.log('Server response:', res.data);
      resetForm();
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
      if (activeTab === 3) loadCaptcha(); // Reload CAPTCHA on submission error if on final step
    }
  };

  const renderError = (field) =>
    errors[field] && <span className="error-text">{errors[field]}</span>;

  const isPetBreedRequired = !(formData.animalType === 'Dog' && formData.petCategory === 'Indian/Desi');

  return (
    <div className="pet-registration-container">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="tabs-container">
        {/* Tabs */}
        <div className={`tab ${activeTab === 1 ? 'active' : ''}`}>
          <div className="tab-number">1</div>
          <div className="tab-content">
            <div className="tab-title">Registration</div>
            <div className="tab-subtitle">Pet Owner Information</div>
          </div>
        </div>
        <div className={`tab ${activeTab === 2 ? 'active' : ''}`}>
          <div className="tab-number">2</div>
          <div className="tab-content">
            <div className="tab-title">Pet Info</div>
            <div className="tab-subtitle">Setup Pet Info</div>
          </div>
        </div>
        <div className={`tab ${activeTab === 3 ? 'active' : ''}`}>
          <div className="tab-number">3</div>
          <div className="tab-content">
            <div className="tab-title">Preview</div>
            <div className="tab-subtitle">Confirm Details</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 1 && (
          <div className="form-step">
            <h2 className="section-title">Pet Owner Information</h2>
            {/* Step 1 Fields (Owner Info) */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="animalType">Animal Type<span className="required">*</span></label>
                <select id="animalType" name="animalType" value={formData.animalType} onChange={handleChange} required>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Rabbit">Rabbit</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="fullName">Full Name<span className="required">*</span></label>
                <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
                {renderError('fullName')}
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number<span className="required">*</span></label>
                <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                {renderError('phoneNumber')}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender">Gender<span className="required">*</span></label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
                {renderError('gender')}
              </div>
              <div className="form-group">
                <label htmlFor="streetName">Street Name<span className="required">*</span></label>
                <input type="text" id="streetName" name="streetName" value={formData.streetName} onChange={handleChange} />
                {renderError('streetName')}
              </div>
              <div className="form-group">
                <label htmlFor="pinCode">Pin Code<span className="required">*</span></label>
                <input type="text" id="pinCode" name="pinCode" value={formData.pinCode} onChange={handleChange} />
                {renderError('pinCode')}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City<span className="required">*</span></label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} />
                {renderError('city')}
              </div>
              <div className="form-group">
                <label htmlFor="state">State<span className="required">*</span></label>
                <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} />
                {renderError('state')}
              </div>
              <div className="form-group">
                <label htmlFor="totalHouseArea">Total House Area<span className="required">*</span></label>
                <select id="totalHouseArea" name="totalHouseArea" value={formData.totalHouseArea} onChange={handleChange}>
                  <option value="">Select House Area</option>
                  <option value="Less then Or Equal To 200 sq meter">Less then Or Equal To 200 sq meter</option>
                  <option value="200-500 sq meter">200-500 sq meter</option>
                  <option value="More than 500 sq meter">More than 500 sq meter</option>
                </select>
                {renderError('totalHouseArea')}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="numberOfDogs">Number of Animals<span className="required">*</span></label>
                <input type="number" id="numberOfDogs" name="numberOfDogs" min="1" value={formData.numberOfDogs} onChange={handleChange} />
                {renderError('numberOfDogs')}
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="form-step">
            {/* Step 2 Fields (Pet Info) */}
            <div className="pet-info-section">
              <h2 className="section-title">{formData.animalType} 1</h2>
              <p className="section-subtitle">Enter {formData.animalType} 1</p>
              <div className="upload-section">
                <div className="pet-avatar">
                  <div className="pet-icon">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={`${formData.animalType} Avatar`} className="avatar-preview" />
                    ) : (
                      <img
                        src={formData.animalType === 'Dog' ? '/dog-icon.png' :
                          formData.animalType === 'Cat' ? '/cat-icon.png' : '/rabbit-icon.png'}
                        alt={`${formData.animalType} Icon`}
                      />
                    )}
                  </div>
                  <input type="file" id="avatarUpload" accept=".jpg,.jpeg,.png" onChange={handleAvatarChange} style={{ display: 'none' }} />
                  <label htmlFor="avatarUpload" className="upload-btn">Choose Image</label>
                  <button type="button" className="upload-btn" onClick={handleAvatarUpload} disabled={isUploadingAvatar}>
                    {isUploadingAvatar ? 'Uploading...' : 'Upload'}
                  </button>
                  {isUploadingAvatar && (
                    <div className="upload-progress">
                      <progress value={avatarUploadProgress} max="100"></progress>
                      <span>{avatarUploadProgress}%</span>
                    </div>
                  )}
                  <p className="upload-note">* Upload the image of your {formData.animalType}</p>
                  <p className="upload-format">* Only jpeg, jpg and png format allowed with the maximum size of 5MB.</p>
                  {avatarFileName && <p className="file-chosen">{avatarFileName}</p>}
                </div>
                <div className="pet-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="petName">{formData.animalType} Name<span className="required">*</span></label>
                      <input type="text" id="petName" name="petName" placeholder={`Enter ${formData.animalType} Name`} value={formData.petName} onChange={handleChange} required />
                      {renderError('petName')}
                    </div>
                    <div className="form-group">
                      <label htmlFor="petCategory">Category of {formData.animalType}<span className="required">*</span></label>
                      <select id="petCategory" name="petCategory" value={formData.petCategory} onChange={handleChange} required>
                        <option value="">Select Category</option>
                        {animalCategories[formData.animalType].map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      {renderError('petCategory')}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="petBreed">
                        {formData.animalType} Breed
                        {isPetBreedRequired && <span className="required">*</span>}
                      </label>
                      <select id="petBreed" name="petBreed" value={formData.petBreed} onChange={handleChange} required={isPetBreedRequired} disabled={!isPetBreedRequired}>
                        <option value="">Select Breed</option>
                        {animalBreeds[formData.animalType]
                          .filter(breed => !(formData.animalType === 'Dog' && formData.petCategory === 'Indian/Desi' && breed !== 'Any'))
                          .map(breed => (
                            <option key={breed} value={breed}>{breed}</option>
                          ))}
                      </select>
                      {renderError('petBreed')}
                    </div>
                    <div className="form-group">
                      <label htmlFor="petColor">{formData.animalType} Colour<span className="required">*</span></label>
                      <input type="text" id="petColor" name="petColor" placeholder={`Enter ${formData.animalType} Colour`} value={formData.petColor} onChange={handleChange} required />
                      {renderError('petColor')}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="petAge">Age of {formData.animalType}<span className="required">*</span></label>
                      <select id="petAge" name="petAge" value={formData.petAge} onChange={handleChange} required>
                        <option value="">Select Age</option>
                        <option value="< 6 months">Less than 6 months</option>
                        <option value="6 months - 1 year">6 months - 1 year</option>
                        <option value="1 year">1 year</option>
                        <option value="2-5 years">2-5 years</option>
                        <option value="> 5 years">More than 5 years</option>
                      </select>
                      {renderError('petAge')}
                    </div>
                    <div className="form-group">
                      <label htmlFor="petSex">Sex of {formData.animalType}<span className="required">*</span></label>
                      <select id="petSex" name="petSex" value={formData.petSex} onChange={handleChange} required>
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      {renderError('petSex')}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="isVaccinated">Vaccinated?<span className="required">*</span></label>
                      <select id="isVaccinated" name="isVaccinated" value={formData.isVaccinated} onChange={handleChange} required>
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {renderError('isVaccinated')}
                    </div>
                    {formData.isVaccinated === 'Yes' && (
                      <>
                        <div className="form-group">
                          <label htmlFor="dateOfVaccination">Date of Vaccination<span className="required">*</span></label>
                          <input type="date" id="dateOfVaccination" name="dateOfVaccination" value={formData.dateOfVaccination} onChange={handleChange} required />
                          {renderError('dateOfVaccination')}
                        </div>
                        <div className="form-group">
                          <label htmlFor="dueVaccination">Due date of Vaccination<span className="required">*</span></label>
                          <input type="date" id="dueVaccination" name="dueVaccination" value={formData.dueVaccination} onChange={handleChange} required />
                          {renderError('dueVaccination')}
                        </div>
                      </>
                    )}
                  </div>
                  {formData.isVaccinated === 'Yes' && (
                    <div className="form-group full-width">
                      <label htmlFor="vaccinationCertificate">
                        Upload {formData.animalType === 'Dog' ? 'Rabies' : 'Vaccination'} Certificate<span className="required">*</span>
                      </label>
                      <div className="file-input-container">
                        <input type="file" id="vaccinationCertificate" name="vaccinationCertificate" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} style={{ display: 'none' }} required={formData.isVaccinated === 'Yes' && !vaccinationProof.url} />
                        <label htmlFor="vaccinationCertificate" className="file-choose-btn">Choose File</label>
                        <button type="button" className="upload-btn" onClick={uploadFile} disabled={isUploading || !file}>
                          {isUploading ? 'Uploading...' : 'Upload Certificate'}
                        </button>
                        <span className="file-chosen">{fileName}</span>
                      </div>
                      {renderError('vaccinationCertificate')}
                      {isUploading && (
                        <div className="upload-progress">
                          <progress value={uploadProgress} max="100"></progress>
                          <span>{uploadProgress}%</span>
                        </div>
                      )}
                       {vaccinationProof.url && <p className="file-format success-text">Certificate uploaded: <a href={vaccinationProof.url} target="_blank" rel="noopener noreferrer">View</a></p>}
                      <p className="file-format">JPG, PNG and PDF Allowed, Maximum Size 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="form-step">
            {/* Step 3 Preview */}
            <h2 className="section-title">Pet Owner's Details</h2>
            <div className="preview-section">
              {/* Preview Rows for Owner */}
              <div className="preview-row">
                <div className="preview-item"><span className="preview-label">Owner Name :</span><span className="preview-value">{formData.fullName || 'Not provided'}</span></div>
                <div className="preview-item"><span className="preview-label">Phone Number :</span><span className="preview-value">{formData.phoneNumber || 'Not provided'}</span></div>
              </div>
              <div className="preview-row">
                <div className="preview-item"><span className="preview-label">Gender :</span><span className="preview-value">{formData.gender || 'Not provided'}</span></div>
                <div className="preview-item"><span className="preview-label">Street name :</span><span className="preview-value">{formData.streetName || 'Not provided'}</span></div>
              </div>
              <div className="preview-row">
                <div className="preview-item"><span className="preview-label">City :</span><span className="preview-value">{formData.city || 'Not provided'}</span></div>
                <div className="preview-item"><span className="preview-label">State :</span><span className="preview-value">{formData.state || 'Not provided'}</span></div>
                <div className="preview-item"><span className="preview-label">Pin code :</span><span className="preview-value">{formData.pinCode || 'Not provided'}</span></div>
              </div>
              <div className="preview-row">
                <div className="preview-item"><span className="preview-label">Total House Area :</span><span className="preview-value">{formData.totalHouseArea || 'Not provided'}</span></div>
                <div className="preview-item"><span className="preview-label">Number of Animals :</span><span className="preview-value">{formData.numberOfDogs || '1'}</span></div>
              </div>
            </div>

            <h2 className="section-title">{formData.animalType} Details 1</h2>
            <div className="preview-section">
              {/* Preview Rows for Pet */}
              <div className="preview-row">
                <div className="preview-item"><span className="preview-label">{formData.animalType} Name:</span><span className="preview-value">{formData.petName || 'Not provided'}</span></div>
                <div className="preview-item"><span className="preview-label">{formData.animalType} Category:</span><span className="preview-value">{formData.petCategory || 'Not provided'}</span></div>
              </div>
              <div className="preview-row">
                <div className="preview-item"><span className="preview-label">{formData.animalType} Breed:</span><span className="preview-value">{formData.petBreed || 'Not provided'}</span></div>
                <div className="preview-item"><span className="preview-label">{formData.animalType} Colour:</span><span className="preview-value">{formData.petColor || 'Not provided'}</span></div>
              </div>
              <div className="preview-row">
                <div className="preview-item"><span className="preview-label">Age of {formData.animalType}:</span><span className="preview-value">{formData.petAge || 'Not provided'}</span></div>
                <div className="preview-item"><span className="preview-label">Sex of {formData.animalType}:</span><span className="preview-value">{formData.petSex || 'Not provided'}</span></div>
              </div>
              <div className="preview-row">
                <div className="preview-item"><span className="preview-label">Vaccinated:</span><span className="preview-value">{formData.isVaccinated || 'Not provided'}</span></div>
                {formData.isVaccinated === 'Yes' && (
                  <>
                    <div className="preview-item"><span className="preview-label">Date of Vaccination:</span><span className="preview-value">{formData.dateOfVaccination ? new Date(formData.dateOfVaccination).toLocaleDateString() : 'Not provided'}</span></div>
                    <div className="preview-item"><span className="preview-label">Vaccine Due Date:</span><span className="preview-value">{formData.dueVaccination ? new Date(formData.dueVaccination).toLocaleDateString() : 'Not provided'}</span></div>
                  </>
                )}
              </div>
              {formData.isVaccinated === 'Yes' && (
                <div className="preview-row">
                  <div className="preview-item"><span className="preview-label">Vaccination Certificate:</span><span className="preview-value">{vaccinationProof.url ? (<a href={vaccinationProof.url} target="_blank" rel="noopener noreferrer">View Certificate</a>) : ('No file uploaded')}</span></div>
                </div>
              )}
               {avatarUrl && (
                <div className="preview-row">
                    <div className="preview-item">
                        <span className="preview-label">{formData.animalType} Avatar:</span>
                        <span className="preview-value">
                            <img src={avatarUrl} alt="Pet Avatar" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
                        </span>
                    </div>
                </div>
            )}
            </div>

            <h2 className="section-title">Fees Summary</h2>
            <div className="fees-summary-section">
              <div className="preview-row"><div className="preview-item"><span className="preview-label">Registration Fees:</span><span className="preview-value">Rs. 200</span></div></div>
              <div className="preview-row"><div className="preview-item"><span className="preview-label">Fine Fees:</span><span className="preview-value">Rs. {fineFees}</span></div></div>
              <div className="preview-row total-fees-row"><div className="preview-item"><span className="preview-label">Total Fees:</span><span className="preview-value">Rs. {totalFees}</span></div></div>
            </div>

            {formData.isVaccinated === 'No' && (
              <div className="vet-info-section">
                <h3 className="section-subtitle">Approved Veterinary Clinic Information</h3>
                {/* Vet Details */}
                <div className="preview-row">
                    <div className="preview-item"><span className="preview-label">Clinic Name:</span><span className="preview-value">{VET_DETAILS.clinic}</span></div>
                    <div className="preview-item"><span className="preview-label">Veterinarian:</span><span className="preview-value">{VET_DETAILS.name}</span></div>
                </div>
                <div className="preview-row">
                    <div className="preview-item"><span className="preview-label">Contact Number:</span><span className="preview-value">{VET_DETAILS.phone}</span></div>
                    <div className="preview-item"><span className="preview-label">Address:</span><span className="preview-value">{VET_DETAILS.address}</span></div>
                </div>
                <div className="info-note"><p><strong>Important:</strong> {VET_DETAILS.instructions}</p></div>
              </div>
            )}

            <h2 className="section-title">Declaration</h2>
            <div className="declaration-section">
              {/* Declaration Checkboxes */}
              <div className="declaration-item"><input type="checkbox" id="declaration1" name="declaration1" checked={formData.declaration1} onChange={handleChange} required /><label htmlFor="declaration1">I hereby declare that the entries made by me in the Application Form are complete and true to the best of my knowledge, belief and information.</label></div>
              <div className="declaration-item"><input type="checkbox" id="declaration2" name="declaration2" checked={formData.declaration2} onChange={handleChange} required /><label htmlFor="declaration2">I hereby undertake to present the original documents for verification immediately upon demand by the concerned authorities.</label></div>
              <div className="declaration-item"><input type="checkbox" id="declaration3" name="declaration3" checked={formData.declaration3} onChange={handleChange} required /><label htmlFor="declaration3">If in any case, concerned authorities encountered any fault then they would take action against me and anytime like cancellation of the license by the authorized authority.</label></div>
              <div className="declaration-item"><input type="checkbox" id="declaration4" name="declaration4" checked={formData.declaration4} onChange={handleChange} required /><label htmlFor="declaration4">I hereby assure the Municipal Corporation, Gorakhpur that, I am not using my pet for any breeding purpose and will follow all the rules and regulation (<a href="./Rules.pdf" target='_blank' className="link">View PDF</a>) issued by Municipal Corporation, Gorakhpur from time to time.</label></div>
            </div>
          </div>
        )}

            {/* --- CAPTCHA SECTION --- */}
            {renderCaptchaFields()}
            {/* --- END CAPTCHA SECTION --- */}

        <div className="form-buttons">
          {activeTab > 1 && <button type="button" className="back-btn" onClick={handleBack}>Back</button>}
          {activeTab < 3 ? (
            <button type="button" className="next-btn" onClick={handleNext}>Next</button>
          ) : (
            <button
              type="submit"
              className="submit-btn"
              disabled={
                !formData.declaration1 ||
                !formData.declaration2 ||
                !formData.declaration3 ||
                !formData.declaration4 ||
                (formData.isVaccinated === 'Yes' && file && !vaccinationProof.url && isUploading) ||
                isUploadingAvatar ||
                (activeTab === 3 && !captchaToken && !!captchaError) || // CAPTCHA load failed
                (activeTab === 3 && !captchaToken && !captchaError)     // CAPTCHA loading
              }
            >
              {isUploading ? 'Uploading Certificate...' :
               isUploadingAvatar ? 'Uploading Avatar...' :
               (activeTab === 3 && !captchaToken && !captchaError && !captchaSvg) ? 'Loading CAPTCHA...' : // Added !captchaSvg here for clarity
               'Submit'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PetRegistrationForm;