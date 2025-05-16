import React, { useState } from 'react';
import './styles/Petform.css';
import axios from 'axios';

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

  const [vaccinationProof, setVaccinationProof] = useState({
    url: '',
    publicId: ''
  });
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    streetName: '',
    pinCode: '',
    city: '',
    state: '',
    totalHouseArea: '',
    numberOfDogs: '1',
    dogName: '',
    dogCategory: '',
    dogBreed: '',
    dogColor: '',
    dogAge: '',
    dogSex: '',
    dateOfVaccination: '',
    dueVaccination: '',
    declaration1: false,
    declaration2: false,
    declaration3: false,
    declaration4: false
  });



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
      if (!formData.numberOfDogs) newErrors.numberOfDogs = 'Number of dogs is required';
    } else if (activeTab === 2) {
      if (!formData.dogName.trim()) newErrors.dogName = 'Dog Name is required';
      if (!formData.dogCategory) newErrors.dogCategory = 'Dog Category is required';
      if (!formData.dogBreed) newErrors.dogBreed = 'Dog Breed is required';
      if (!formData.dogColor.trim()) newErrors.dogColor = 'Dog Colour is required';
      if (!formData.dogAge) newErrors.dogAge = 'Dog Age is required';
      if (!formData.dogSex) newErrors.dogSex = 'Dog Sex is required';
      if (!formData.dateOfVaccination) newErrors.dateOfVaccination = 'Vaccination Date is required';
      if (!formData.dueVaccination) newErrors.dueVaccination = 'Due Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveTab((prev) => prev + 1);
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
      setErrors(prev => ({ ...prev, vaccinationCertificate: 'Please select a file' }));
      return false;
    }

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, vaccinationCertificate: 'Only JPG, PNG, or PDF files are allowed' }));
      return false;
    }

    if (file.size > 5000000) { // 5MB
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
      return true;
    } catch (error) {
      console.error('Upload error:', error);
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
    alert('Please select a file first');
    return;
  }

  const validTypes = ['image/jpeg', 'image/png'];
  if (!validTypes.includes(avatarFile.type)) {
    alert('Only JPG or PNG files are allowed for avatar');
    return;
  }

  if (avatarFile.size > 5000000) { // 5MB
    alert('File size must be less than 5MB');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', avatarFile);

    const token = localStorage.getItem('token');
    const response = await axios.post(`${backend}/api/license/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    setAvatarUrl(response.data.url);
    alert('Avatar uploaded successfully!');
  } catch (error) {
    console.error('Avatar upload error:', error);
    alert('Failed to upload avatar');
  }
};



const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.declaration1 || !formData.declaration2 || !formData.declaration3 || !formData.declaration4) {
      alert('Please accept all declarations before submitting.');
      return;
    }

    // Upload file first if selected
    if (file && !vaccinationProof.url) {
      const uploadSuccess = await uploadFile();
      if (!uploadSuccess) return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to submit the form.');
        return;
      }

      const submissionData = {
        ...formData,
        avatarUrl,
        vaccinationProofUrl: vaccinationProof.url,
        vaccinationProofPublicId: vaccinationProof.publicId
      };

      const res = await axios.post(`${backend}/api/license/apply`, submissionData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert('Form submitted successfully!');
      console.log('Server response:', res.data);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };


  const renderError = (field) =>
    errors[field] && <span className="error-text">{errors[field]}</span>;

return (
    <div className="pet-registration-container">
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
                <label htmlFor="fullName">Full Name<span className="required">*</span></label>
                <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
                {renderError('fullName')}
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number<span className="required">*</span></label>
                <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                {renderError('phoneNumber')}
              </div>
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
            </div>

            <div className="form-row">
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
            </div>

            <div className="form-row">
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
              <div className="form-group">
                <label htmlFor="numberOfDogs">Number of Dogs<span className="required">*</span></label>
                <input type="number" id="numberOfDogs" name="numberOfDogs" min="1" value={formData.numberOfDogs} onChange={handleChange} />
                {renderError('numberOfDogs')}
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="form-step">
            <div className="pet-info-section">
              <h2 className="section-title">Pet 1</h2>
              <p className="section-subtitle">Enter Pet 1</p>

              <div className="upload-section">
              <div className="pet-avatar">
  <div className="pet-icon">
    {avatarUrl ? (
      <img src={avatarUrl} alt="Dog Avatar" className="avatar-preview" />
    ) : (
      <img src="/dog-icon.png" alt="Dog Icon" />
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
>
  Upload
</button>

  <p className="upload-note">* Upload the image of your Pet</p>
  <p className="upload-format">* Only jpeg, jpg and png format allowed with the maximum size of 5MB.</p>
  {avatarFileName && <p className="file-chosen">{avatarFileName}</p>}
</div>

                <div className="pet-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dogName">Dog Name<span className="required">*</span></label>
                      <input
                        type="text"
                        id="dogName"
                        name="dogName"
                        placeholder="Enter Full Name"
                        value={formData.dogName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="dogCategory">Category of Dog<span className="required">*</span></label>
                      <select
                        id="dogCategory"
                        name="dogCategory"
                        value={formData.dogCategory}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Indian/Desi">Indian/Desi</option>
                        <option value="Foreign Breed">Foreign Breed</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dogBreed">Dog Breed<span className="required">*</span></label>
                      <select
                        id="dogBreed"
                        name="dogBreed"
                        value={formData.dogBreed}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Breed</option>
                        <option value="Any">Any</option>
                        <option value="Labrador">Labrador</option>
                        <option value="German Shepherd">German Shepherd</option>
                        <option value="Golden Retriever">Golden Retriever</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="dogColor">Dog Colour<span className="required">*</span></label>
                      <input
                        type="text"
                        id="dogColor"
                        name="dogColor"
                        placeholder="Enter Pet Colour"
                        value={formData.dogColor}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dogAge">Age of Dog<span className="required">*</span></label>
                      <select
                        id="dogAge"
                        name="dogAge"
                        value={formData.dogAge}
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
                    </div>
                    <div className="form-group">
                      <label htmlFor="dogSex">Sex of Dog<span className="required">*</span></label>
                      <select
                        id="dogSex"
                        name="dogSex"
                        value={formData.dogSex}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
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
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="vaccinationCertificate">Upload Rabies Vaccination Certificate<span className="required">*</span></label>
                    <div className="file-input-container">
                      <input
                        type="file"
                        id="vaccinationCertificate"
                        name="vaccinationCertificate"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
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
                  <span className="preview-label">Number of Dogs :</span>
                  <span className="preview-value">{formData.numberOfDogs || '1'}</span>
                </div>
              </div>
            </div>
            
            <h2 className="section-title">Pet Details 1</h2>
            <div className="preview-section">
              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">Dog Name :</span>
                  <span className="preview-value">{formData.dogName || 'Not provided'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Dog Category :</span>
                  <span className="preview-value">{formData.dogCategory || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">Dog Breed :</span>
                  <span className="preview-value">{formData.dogBreed || 'Not provided'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Dog Colour :</span>
                  <span className="preview-value">{formData.dogColor || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">Age of Dog :</span>
                  <span className="preview-value">{formData.dogAge || 'Not provided'}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Sex of Dog :</span>
                  <span className="preview-value">{formData.dogSex || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">Date of Vaccination :</span>
                  <span className="preview-value">
                    {formData.dateOfVaccination ? new Date(formData.dateOfVaccination).toLocaleDateString() : 'Not provided'}
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Rabies Vaccine Due Date :</span>
                  <span className="preview-value">
                    {formData.dueVaccination ? new Date(formData.dueVaccination).toLocaleDateString() : 'Not provided'}
                  </span>
                </div>
              </div>
              
              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">Rabies Vaccination Certificate :</span>
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
            </div>
            
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
                  I hereby assure the Municipal Corporation, Lucknow that, I am not using my pet for any breeding purpose and will follow all the rules and regulation (
                  <a href="#" className="link">View PDF</a>
                  ) issued by Municipal Corporation, Lucknow from time to time.
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
                (file && !vaccinationProof.url && isUploading)
              }
            >
              {isUploading ? 'Uploading...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PetRegistrationForm;
