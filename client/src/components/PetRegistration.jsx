import React, { useState } from 'react';
import './styles/Petform.css'; // Ensure this path is correct
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false); // New state for avatar upload
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0); // New state for avatar upload progress
  const [vaccinationProof, setVaccinationProof] = useState({
    url: '',
    publicId: ''
  });
  // New state for fees
  const [fineFees, setFineFees] = useState(0);
  const [totalFees, setTotalFees] = useState(200); // Initial registration fee

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

  const backend = "http://localhost:5000";

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

  // Function to calculate fine fees
  const calculateFineFees = () => {
    const registrationDate = new Date(); // Current date of registration
    const financialYearEnd = new Date(registrationDate.getFullYear(), 2, 31); // March 31st of the current year

    let fees = 0;

    if (registrationDate > financialYearEnd) {
      const currentMonth = registrationDate.getMonth(); // 0-indexed (April is 3)
      const currentDay = registrationDate.getDate();

      // If registration is in April, no late fees
      if (currentMonth === 3) { // April
        fees = 0;
      } else if (currentMonth === 4) { // May
        fees = 100; // Flat 100 for May
      } else if (currentMonth > 4) { // After May (June onwards)
        fees = 100; // May's flat fee
        // Calculate daily fine for subsequent months
        let daysForDailyFine = 0;
        // Add days for full months between May and current month
        for (let i = 5; i < currentMonth; i++) { // Iterate from June (month 5) up to the month before current
          const year = registrationDate.getFullYear();
          daysForDailyFine += new Date(year, i + 1, 0).getDate(); // Get days in month (i+1 because month index is 0-based)
        }
        daysForDailyFine += currentDay; // Add days in current month

        fees += daysForDailyFine * 50; // 50 Rs per day
      }
    }
    setFineFees(fees);
    setTotalFees(200 + fees); // Update total fees
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

      // Only require petBreed if animalType is not Dog OR petCategory is not Indian/Desi
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
        if (!file) newErrors.vaccinationCertificate = 'Vaccination Certificate is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeTab === 2) { // If moving from step 2 to step 3 (preview)
        calculateFineFees();
      }
      setActiveTab((prev) => prev + 1);
    } else {
      toast.error('Please fill in all required fields.'); // Toast for validation failure
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
      toast.error('Please select a file to upload for vaccination certificate.'); // Toast for no file
      setErrors(prev => ({ ...prev, vaccinationCertificate: 'Please select a file' }));
      return false;
    }

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, or PDF files are allowed for vaccination certificate.'); // Toast for invalid type
      setErrors(prev => ({ ...prev, vaccinationCertificate: 'Only JPG, PNG, or PDF files are allowed' }));
      return false;
    }

    if (file.size > 5000000) { // 5MB
      toast.error('Vaccination certificate file size must be less than 5MB.'); // Toast for large file
      setErrors(prev => ({ ...prev, vaccinationCertificate: 'File size must be less than 5MB' }));
      return false;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(`${backend}/api/license/upload`, formData, {
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
      toast.success('Vaccination certificate uploaded successfully!'); // Success toast
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Vaccination certificate file upload failed.'); // Error toast
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
      toast.info('No avatar file selected. Skipping avatar upload.'); // Info toast
      return;
    }

    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(avatarFile.type)) {
      toast.error('Only JPG or PNG files are allowed for avatar.'); // Error toast
      return;
    }

    if (avatarFile.size > 5000000) { // 5MB
      toast.error('Avatar file size must be less than 5MB.'); // Error toast
      return;
    }

    try {
      setIsUploadingAvatar(true); // Start avatar upload loader
      setAvatarUploadProgress(0);

      const formData = new FormData();
      formData.append('file', avatarFile);

      const token = localStorage.getItem('token');
      const response = await axios.post(`${backend}/api/license/upload`, formData, {
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
      toast.success('Avatar uploaded successfully!'); // Success toast
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar.'); // Error toast
    } finally {
      setIsUploadingAvatar(false); // End avatar upload loader
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
    setIsUploadingAvatar(false); // Reset avatar upload state
    setAvatarUploadProgress(0); // Reset avatar upload progress
    setVaccinationProof({ url: '', publicId: '' });
    setFineFees(0); // Reset fees
    setTotalFees(200); // Reset fees
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.declaration1 || !formData.declaration2 || !formData.declaration3 || !formData.declaration4) {
      toast.error('Please accept all declarations before submitting.'); // Toast for declarations
      return;
    }

    if (formData.isVaccinated === 'Yes' && file && !vaccinationProof.url) {
      const uploadSuccess = await uploadFile();
      if (!uploadSuccess) return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to submit the form.'); // Toast for login
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
        numberOfAnimals: formData.numberOfDogs,
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

      toast.success('Form submitted successfully!'); // Success toast
      console.log('Server response:', res.data);
      resetForm();
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.'); // Error toast
    }
  };

  const renderError = (field) =>
    errors[field] && <span className="error-text">{errors[field]}</span>;

  // Determine if petBreed is required based on animalType and petCategory
  const isPetBreedRequired = !(formData.animalType === 'Dog' && formData.petCategory === 'Indian/Desi');

  return (
    <div className="pet-registration-container">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover /> {/* ToastContainer for displaying toasts */}

      <div className="tabs-container">
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
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="animalType">Animal Type<span className="required">*</span></label>
                <select
                  id="animalType"
                  name="animalType"
                  value={formData.animalType}
                  onChange={handleChange}
                  required
                >
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
                  <input
                    type="file"
                    id="avatarUpload"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="avatarUpload" className="upload-btn">Choose Image</label>
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={handleAvatarUpload}
                    disabled={isUploadingAvatar} // Disable button during upload
                  >
                    {isUploadingAvatar ? 'Uploading...' : 'Upload'} {/* Show "Uploading..." text */}
                  </button>
                  {isUploadingAvatar && ( // Show progress bar for avatar upload
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
                      <input
                        type="text"
                        id="petName"
                        name="petName"
                        placeholder={`Enter ${formData.animalType} Name`}
                        value={formData.petName}
                        onChange={handleChange}
                        required
                      />
                      {renderError('petName')}
                    </div>
                    <div className="form-group">
                      <label htmlFor="petCategory">Category of {formData.animalType}<span className="required">*</span></label>
                      <select
                        id="petCategory"
                        name="petCategory"
                        value={formData.petCategory}
                        onChange={handleChange}
                        required
                      >
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
                      <select
                        id="petBreed"
                        name="petBreed"
                        value={formData.petBreed}
                        onChange={handleChange}
                        required={isPetBreedRequired}
                        disabled={!isPetBreedRequired}
                      >
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
                      <input
                        type="text"
                        id="petColor"
                        name="petColor"
                        placeholder={`Enter ${formData.animalType} Colour`}
                        value={formData.petColor}
                        onChange={handleChange}
                        required
                      />
                      {renderError('petColor')}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="petAge">Age of {formData.animalType}<span className="required">*</span></label>
                      <select
                        id="petAge"
                        name="petAge"
                        value={formData.petAge}
                        onChange={handleChange}
                        required
                      >
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
                      <select
                        id="petSex"
                        name="petSex"
                        value={formData.petSex}
                        onChange={handleChange}
                        required
                      >
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
                      <select
                        id="isVaccinated"
                        name="isVaccinated"
                        value={formData.isVaccinated}
                        onChange={handleChange}
                        required
                      >
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
                          <input
                            type="date"
                            id="dateOfVaccination"
                            name="dateOfVaccination"
                            value={formData.dateOfVaccination}
                            onChange={handleChange}
                            required
                          />
                          {renderError('dateOfVaccination')}
                        </div>
                        <div className="form-group">
                          <label htmlFor="dueVaccination">Due date of Vaccination<span className="required">*</span></label>
                          <input
                            type="date"
                            id="dueVaccination"
                            name="dueVaccination"
                            value={formData.dueVaccination}
                            onChange={handleChange}
                            required
                          />
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
                        <input
                          type="file"
                          id="vaccinationCertificate"
                          name="vaccinationCertificate"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                          required={formData.isVaccinated === 'Yes'}
                        />
                        <label htmlFor="vaccinationCertificate" className="file-choose-btn">
                          Choose File
                        </label>
                        <button
                          type="button"
                          className="upload-btn"
                          onClick={uploadFile}
                        >
                          Upload Certificate
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
            <h2 className="section-title">Pet Owner's Details</h2>

            <div className="preview-section">
              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">Owner Name :</span>
                  <span className="preview-value">{formData.fullName || 'Not provided'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Phone Number :</span>
                  <span className="preview-value">{formData.phoneNumber || 'Not provided'}</span>
                </div>
              </div>

              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">Gender :</span>
                  <span className="preview-value">{formData.gender || 'Not provided'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Street name :</span>
                  <span className="preview-value">{formData.streetName || 'Not provided'}</span>
                </div>
              </div>

              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">City :</span>
                  <span className="preview-value">{formData.city || 'Not provided'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">State :</span>
                  <span className="preview-value">{formData.state || 'Not provided'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Pin code :</span>
                  <span className="preview-value">{formData.pinCode || 'Not provided'}</span>
                </div>
              </div>

              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">Total House Area :</span>
                  <span className="preview-value">{formData.totalHouseArea || 'Not provided'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Number of Animals :</span>
                  <span className="preview-value">{formData.numberOfDogs || '1'}</span>
                </div>
              </div>
            </div>

            <h2 className="section-title">{formData.animalType} Details 1</h2>
            <div className="preview-section">
              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">{formData.animalType} Name:</span>
                  <span className="preview-value">{formData.petName || 'Not provided'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">{formData.animalType} Category:</span>
                  <span className="preview-value">{formData.petCategory || 'Not provided'}</span>
                </div>
              </div>

              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">{formData.animalType} Breed:</span>
                  <span className="preview-value">{formData.petBreed || 'Not provided'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">{formData.animalType} Colour:</span>
                  <span className="preview-value">{formData.petColor || 'Not provided'}</span>
                </div>
              </div>

              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">Age of {formData.animalType}:</span>
                  <span className="preview-value">{formData.petAge || 'Not provided'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Sex of {formData.animalType}:</span>
                  <span className="preview-value">{formData.petSex || 'Not provided'}</span>
                </div>
              </div>

              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">Vaccinated:</span>
                  <span className="preview-value">{formData.isVaccinated || 'Not provided'}</span>
                </div>
                {formData.isVaccinated === 'Yes' && (
                  <>
                    <div className="preview-item">
                      <span className="preview-label">Date of Vaccination:</span>
                      <span className="preview-value">
                        {formData.dateOfVaccination ? new Date(formData.dateOfVaccination).toLocaleDateString() : 'Not provided'}
                      </span>
                    </div>
                    <div className="preview-item">
                      <span className="preview-label">Vaccine Due Date:</span>
                      <span className="preview-value">
                        {formData.dueVaccination ? new Date(formData.dueVaccination).toLocaleDateString() : 'Not provided'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {formData.isVaccinated === 'Yes' && (
                <div className="preview-row">
                  <div className="preview-item">
                    <span className="preview-label">Vaccination Certificate:</span>
                    <span className="preview-value">
                      {vaccinationProof.url ? (
                        <a href={vaccinationProof.url} target="_blank" rel="noopener noreferrer">
                          View Certificate
                        </a>
                      ) : (
                        'No file uploaded'
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* --- NEW FEES SUMMARY SECTION --- */}
            <h2 className="section-title">Fees Summary</h2>
            <div className="fees-summary-section"> {/* New class for styling */}
                <div className="preview-row">
                    <div className="preview-item">
                        <span className="preview-label">Registration Fees:</span>
                        <span className="preview-value">Rs. 200</span>
                    </div>
                </div>
                <div className="preview-row">
                    <div className="preview-item">
                        <span className="preview-label">Fine Fees:</span>
                        <span className="preview-value">Rs. {fineFees}</span>
                    </div>
                </div>
                <div className="preview-row total-fees-row"> {/* Add a class for total row if needed */}
                    <div className="preview-item">
                        <span className="preview-label">Total Fees:</span>
                        <span className="preview-value">Rs. {totalFees}</span>
                    </div>
                </div>
            </div>
            {/* --- END NEW FEES SUMMARY SECTION --- */}


            {formData.isVaccinated === 'No' && (
              <div className="vet-info-section">
                <h3 className="section-subtitle">Approved Veterinary Clinic Information</h3>
                <div className="preview-row">
                  <div className="preview-item">
                    <span className="preview-label">Clinic Name:</span>
                    <span className="preview-value">{VET_DETAILS.clinic}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Veterinarian:</span>
                    <span className="preview-value">{VET_DETAILS.name}</span>
                  </div>
                </div>
                <div className="preview-row">
                  <div className="preview-item">
                    <span className="preview-label">Contact Number:</span>
                    <span className="preview-value">{VET_DETAILS.phone}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Address:</span>
                    <span className="preview-value">{VET_DETAILS.address}</span>
                  </div>
                </div>
                <div className="info-note">
                  <p><strong>Important:</strong> {VET_DETAILS.instructions}</p>
                </div>
              </div>
            )}

            <h2 className="section-title">Declaration</h2>
            <div className="declaration-section">
              <div className="declaration-item">
                <input
                  type="checkbox"
                  id="declaration1"
                  name="declaration1"
                  checked={formData.declaration1}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="declaration1">
                  I hereby declare that the entries made by me in the Application Form are complete and true to the best of my knowledge, belief and information.
                </label>
              </div>

              <div className="declaration-item">
                <input
                  type="checkbox"
                  id="declaration2"
                  name="declaration2"
                  checked={formData.declaration2}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="declaration2">
                  I hereby undertake to present the original documents for verification immediately upon demand by the concerned authorities.
                </label>
              </div>

              <div className="declaration-item">
                <input
                  type="checkbox"
                  id="declaration3"
                  name="declaration3"
                  checked={formData.declaration3}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="declaration3">
                  If in any case, concerned authorities encountered any fault then they would take action against me and anytime like cancellation of the license by the authorized authority.
                </label>
              </div>

              <div className="declaration-item">
                <input
                  type="checkbox"
                  id="declaration4"
                  name="declaration4"
                  checked={formData.declaration4}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="declaration4">
                  I hereby assure the Municipal Corporation, Gorakhpur that, I am not using my pet for any breeding purpose and will follow all the rules and regulation (
                  <a href="./Rules.pdf" target='_blank' className="link">View PDF</a>
                  ) issued by Municipal Corporation, Gorakhpur from time to time.
                </label>
              </div>
            </div>
          </div>
        )}

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
                isUploadingAvatar // Disable submit button during avatar upload
              }
            >
              {(isUploading || isUploadingAvatar) ? 'Uploading...' : 'Submit'} {/* Show "Uploading..." text for both */}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PetRegistrationForm;