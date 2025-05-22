import React, { useState } from 'react';
import './styles/Add.css'; // Ensure this path is correct
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dog } from 'lucide-react'; // Assuming Dog icon is still useful for pet avatar placeholder

const AdminAddForm = () => {
  const [adminActiveTab, setAdminActiveTab] = useState(1);
  const [adminErrors, setAdminErrors] = useState({});
  const [adminFile, setAdminFile] = useState(null); // Re-added for vaccination certificate
  const [adminFileName, setAdminFileName] = useState('No file chosen'); // Re-added for vaccination certificate
  const [adminUploadProgress, setAdminUploadProgress] = useState(0); // Re-added for vaccination certificate
  const [isAdminUploading, setIsAdminUploading] = useState(false); // Re-added for vaccination certificate
  const [adminAvatarFile, setAdminAvatarFile] = useState(null);
  const [adminAvatarFileName, setAdminAvatarFileName] = useState('');
  const [adminAvatarUrl, setAdminAvatarUrl] = useState('');
  const [adminVaccinationProof, setAdminVaccinationProof] = useState({ // Re-added for vaccination certificate
    url: '',
    publicId: ''
  });

  // Animal type data (can be moved to a global config if shared across components)
  const adminAnimalBreeds = {
    Dog: ['Any', 'Labrador', 'German Shepherd', 'Golden Retriever', 'Other'],
    Cat: ['Any', 'Persian', 'Siamese', 'Maine Coon', 'Other'],
    Rabbit: ['Any', 'Dutch', 'Lionhead', 'Flemish Giant', 'Other']
  };

  const adminAnimalCategories = {
    Dog: ['Indian/Desi', 'Foreign Breed'],
    Cat: ['Indian', 'Foreign'],
    Rabbit: ['Domestic', 'Foreign']
  };

  const adminInitialFormData = {
    animalType: 'Dog',
    fullName: '',
    phoneNumber: '',
    gender: '',
    streetName: '',
    pinCode: '',
    city: '',
    state: '',
    isVaccinated: '', // Re-added
    totalHouseArea: '',
    numberOfAnimals: '1',
    petName: '',
    petCategory: '',
    petBreed: '',
    petColor: '',
    petAge: '',
    petSex: '',
    dateOfVaccination: '', // Re-added
    dueVaccination: '', // Re-added
    declaration1: false,
    declaration2: false,
    declaration3: false,
    declaration4: false
  };

  const [adminFormData, setAdminFormData] = useState(adminInitialFormData);

  const backend = "https://dog-registration.onrender.com";

  const handleAdminChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdminFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setAdminErrors((prev) => ({
      ...prev,
      [name]: ''
    }));

    if (name === 'animalType' || (name === 'petCategory' && value === 'Indian/Desi' && adminFormData.animalType === 'Dog')) {
      setAdminFormData(prev => ({
        ...prev,
        petBreed: ''
      }));
    }
    // Logic for clearing vaccination fields if "No" is selected
    if (name === 'isVaccinated' && value === 'No') {
      setAdminFormData(prev => ({
        ...prev,
        dateOfVaccination: '',
        dueVaccination: '',
      }));
      setAdminFile(null);
      setAdminFileName('No file chosen');
      setAdminVaccinationProof({ url: '', publicId: '' });
    }
  };

  const validateAdminStep = () => {
    const newErrors = {};
    if (adminActiveTab === 1) {
      if (!adminFormData.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!adminFormData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required';
      if (!adminFormData.gender) newErrors.gender = 'Gender is required';
      if (!adminFormData.streetName.trim()) newErrors.streetName = 'Street name is required';
      if (!adminFormData.pinCode.trim()) newErrors.pinCode = 'Pin code is required';
      if (!adminFormData.city.trim()) newErrors.city = 'City is required';
      if (!adminFormData.state.trim()) newErrors.state = 'State is required';
      if (!adminFormData.totalHouseArea) newErrors.totalHouseArea = 'Total house area is required';
      if (!adminFormData.numberOfAnimals) newErrors.numberOfAnimals = 'Number of animals is required';
    } else if (adminActiveTab === 2) {
      if (!adminFormData.petName.trim()) newErrors.petName = `${adminFormData.animalType} Name is required`;
      if (!adminFormData.petCategory) newErrors.petCategory = `${adminFormData.animalType} Category is required`;

      // Only require petBreed if animalType is not Dog OR petCategory is not Indian/Desi
      if (!(adminFormData.animalType === 'Dog' && adminFormData.petCategory === 'Indian/Desi')) {
        if (!adminFormData.petBreed) {
          newErrors.petBreed = `${adminFormData.animalType} Breed is required`;
        }
      }

      if (!adminFormData.petColor.trim()) newErrors.petColor = `${adminFormData.animalType} Colour is required`;
      if (!adminFormData.petAge) newErrors.petAge = `${adminFormData.animalType} Age is required`;
      if (!adminFormData.petSex) newErrors.petSex = `${adminFormData.animalType} Sex is required`;
      if (!adminFormData.isVaccinated) newErrors.isVaccinated = 'Vaccination status is required'; // Re-added

      // Validation for vaccination fields if 'Yes'
      if (adminFormData.isVaccinated === 'Yes') {
        if (!adminFormData.dateOfVaccination) newErrors.dateOfVaccination = 'Vaccination Date is required';
        if (!adminFormData.dueVaccination) newErrors.dueVaccination = 'Due Date is required';
        if (!adminFile) newErrors.vaccinationCertificate = 'Vaccination Certificate is required';
      }
    }
    setAdminErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdminNext = () => {
    if (validateAdminStep()) {
      setAdminActiveTab((prev) => prev + 1);
    } else {
      toast.error('Please fill in all required fields.');
    }
  };

  const handleAdminBack = () => {
    setAdminActiveTab((prev) => prev - 1);
  };

  // Re-added for vaccination certificate upload
  const handleAdminFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setAdminFile(selectedFile);
      setAdminFileName(selectedFile.name);
      setAdminErrors(prev => ({ ...prev, vaccinationCertificate: '' }));
    }
  };

  // Re-added for vaccination certificate upload
  const uploadAdminFile = async () => {
    if (!adminFile) {
      toast.error('Please select a file to upload for vaccination certificate.');
      setAdminErrors(prev => ({ ...prev, vaccinationCertificate: 'Please select a file' }));
      return false;
    }

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(adminFile.type)) {
      toast.error('Only JPG, PNG, or PDF files are allowed for vaccination certificate.');
      setAdminErrors(prev => ({ ...prev, vaccinationCertificate: 'Only JPG, PNG, or PDF files are allowed' }));
      return false;
    }

    if (adminFile.size > 5000000) { // 5MB
      toast.error('Vaccination certificate file size must be less than 5MB.');
      setAdminErrors(prev => ({ ...prev, vaccinationCertificate: 'File size must be less than 5MB' }));
      return false;
    }

    try {
      setIsAdminUploading(true);
      setAdminUploadProgress(0);

      const formData = new FormData();
      formData.append('file', adminFile);

      const token = localStorage.getItem('token');
      const response = await axios.post(`${backend}/api/license/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setAdminUploadProgress(percentCompleted);
        }
      });

      setAdminVaccinationProof({
        url: response.data.url,
        publicId: response.data.publicId
      });
      setIsAdminUploading(false);
      toast.success('Vaccination certificate uploaded successfully!');
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Vaccination certificate file upload failed.');
      setAdminErrors(prev => ({ ...prev, vaccinationCertificate: 'File upload failed' }));
      setIsAdminUploading(false);
      return false;
    }
  };


  const handleAdminAvatarChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setAdminAvatarFile(selectedFile);
      setAdminAvatarFileName(selectedFile.name);
    }
  };

  const handleAdminAvatarUpload = async () => {
    if (!adminAvatarFile) {
      toast.info('No avatar file selected. Skipping avatar upload.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(adminAvatarFile.type)) {
      toast.error('Only JPG or PNG files are allowed for avatar.');
      return;
    }

    if (adminAvatarFile.size > 5000000) { // 5MB
      toast.error('Avatar file size must be less than 5MB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', adminAvatarFile);

      const token = localStorage.getItem('token');
      const response = await axios.post(`${backend}/api/license/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setAdminAvatarUrl(response.data.url);
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar.');
    }
  };

  const resetAdminForm = () => {
    setAdminFormData(adminInitialFormData);
    setAdminActiveTab(1);
    setAdminErrors({});
    setAdminFile(null); // Reset vaccination file
    setAdminFileName('No file chosen'); // Reset vaccination file name
    setAdminUploadProgress(0); // Reset vaccination upload progress
    setIsAdminUploading(false); // Reset vaccination uploading state
    setAdminAvatarFile(null);
    setAdminAvatarFileName('');
    setAdminAvatarUrl('');
    setAdminVaccinationProof({ url: '', publicId: '' }); // Reset vaccination proof
  };


  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    if (!adminFormData.declaration1 || !adminFormData.declaration2 || !adminFormData.declaration3 || !adminFormData.declaration4) {
      toast.error('Please accept all declarations before submitting.');
      return;
    }

    // Conditional upload of vaccination certificate
    if (adminFormData.isVaccinated === 'Yes' && adminFile && !adminVaccinationProof.url) {
      const uploadSuccess = await uploadAdminFile();
      if (!uploadSuccess) return; // Stop submission if upload fails
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to submit the form.');
        return;
      }

      const submissionData = {
        animalType: adminFormData.animalType,
        fullName: adminFormData.fullName,
        phoneNumber: adminFormData.phoneNumber,
        gender: adminFormData.gender,
        address: { // Grouped address fields as per schema
          streetName: adminFormData.streetName,
          pinCode: adminFormData.pinCode,
          city: adminFormData.city,
          state: adminFormData.state,
        },
        totalHouseArea: adminFormData.totalHouseArea,
        numberOfAnimals: adminFormData.numberOfAnimals,
        pet: {
          name: adminFormData.petName,
          category: adminFormData.petCategory,
          breed: adminFormData.petBreed,
          color: adminFormData.petColor,
          age: adminFormData.petAge,
          sex: adminFormData.petSex,
          isVaccinated: adminFormData.isVaccinated, // Re-added
          ...(adminFormData.isVaccinated === 'Yes' && { // Conditionally include vaccination data
            dateOfVaccination: adminFormData.dateOfVaccination,
            dueVaccination: adminFormData.dueVaccination,
            vaccinationProofUrl: adminVaccinationProof.url,
            vaccinationProofPublicId: adminVaccinationProof.publicId,
          }),
          avatarUrl: adminAvatarUrl
        }
      };

      const res = await axios.post(`${backend}/api/admin/add-license`, submissionData, { // New API endpoint for admin add
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Form submitted successfully!');
      console.log('Server response:', res.data);
      resetAdminForm();
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const renderAdminError = (field) =>
    adminErrors[field] && <span className="admin-error-message">{adminErrors[field]}</span>;

  // Determine if petBreed is required based on animalType and petCategory
  const isAdminPetBreedRequired = !(adminFormData.animalType === 'Dog' && adminFormData.petCategory === 'Indian/Desi');

  return (
    <div className="admin-add-container">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <div className="admin-tabs-nav">
        <div className={`admin-tab-item ${adminActiveTab === 1 ? 'active' : ''}`}>
          <div className="admin-tab-num">1</div>
          <div className="admin-tab-details">
            <div className="admin-tab-heading">Owner Info</div>
            <div className="admin-tab-subheading">Add Owner Details</div>
          </div>
        </div>
        <div className={`admin-tab-item ${adminActiveTab === 2 ? 'active' : ''}`}>
          <div className="admin-tab-num">2</div>
          <div className="admin-tab-details">
            <div className="admin-tab-heading">Pet Info</div>
            <div className="admin-tab-subheading">Add Pet Details</div>
          </div>
        </div>
        <div className={`admin-tab-item ${adminActiveTab === 3 ? 'active' : ''}`}>
          <div className="admin-tab-num">3</div>
          <div className="admin-tab-details">
            <div className="admin-tab-heading">Preview</div>
            <div className="admin-tab-subheading">Confirm Details</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleAdminSubmit}>
        {adminActiveTab === 1 && (
          <div className="admin-form-step">
            <h2 className="admin-section-heading">Owner Information</h2>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="animalType">Animal Type<span className="admin-required">*</span></label>
                <select
                  id="animalType"
                  name="animalType"
                  value={adminFormData.animalType}
                  onChange={handleAdminChange}
                  required
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Rabbit">Rabbit</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label htmlFor="fullName">Full Name<span className="admin-required">*</span></label>
                <input type="text" id="fullName" name="fullName" value={adminFormData.fullName} onChange={handleAdminChange} />
                {renderAdminError('fullName')}
              </div>
              <div className="admin-form-group">
                <label htmlFor="phoneNumber">Phone Number<span className="admin-required">*</span></label>
                <input type="tel" id="phoneNumber" name="phoneNumber" value={adminFormData.phoneNumber} onChange={handleAdminChange} />
                {renderAdminError('phoneNumber')}
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="gender">Gender<span className="admin-required">*</span></label>
                <select id="gender" name="gender" value={adminFormData.gender} onChange={handleAdminChange}>
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
                {renderAdminError('gender')}
              </div>
              <div className="admin-form-group">
                <label htmlFor="streetName">Street Name<span className="admin-required">*</span></label>
                <input type="text" id="streetName" name="streetName" value={adminFormData.streetName} onChange={handleAdminChange} />
                {renderAdminError('streetName')}
              </div>
              <div className="admin-form-group">
                <label htmlFor="pinCode">Pin Code<span className="admin-required">*</span></label>
                <input type="text" id="pinCode" name="pinCode" value={adminFormData.pinCode} onChange={handleAdminChange} />
                {renderAdminError('pinCode')}
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="city">City<span className="admin-required">*</span></label>
                <input type="text" id="city" name="city" value={adminFormData.city} onChange={handleAdminChange} />
                {renderAdminError('city')}
              </div>
              <div className="admin-form-group">
                <label htmlFor="state">State<span className="admin-required">*</span></label>
                <input type="text" id="state" name="state" value={adminFormData.state} onChange={handleAdminChange} />
                {renderAdminError('state')}
              </div>
              <div className="admin-form-group">
                <label htmlFor="totalHouseArea">Total House Area<span className="admin-required">*</span></label>
                <select id="totalHouseArea" name="totalHouseArea" value={adminFormData.totalHouseArea} onChange={handleAdminChange}>
                  <option value="">Select House Area</option>
                  <option value="Less then Or Equal To 200 sq meter">Less then Or Equal To 200 sq meter</option>
                  <option value="200-500 sq meter">200-500 sq meter</option>
                  <option value="More than 500 sq meter">More than 500 sq meter</option>
                </select>
                {renderAdminError('totalHouseArea')}
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="numberOfAnimals">Number of Animals<span className="admin-required">*</span></label>
                <input type="number" id="numberOfAnimals" name="numberOfAnimals" min="1" value={adminFormData.numberOfAnimals} onChange={handleAdminChange} />
                {renderAdminError('numberOfAnimals')}
              </div>
            </div>
          </div>
        )}

        {adminActiveTab === 2 && (
          <div className="admin-form-step">
            <div className="admin-pet-info-area">
              <h2 className="admin-section-heading">{adminFormData.animalType} 1</h2>
              <p className="admin-section-subheading">Enter {adminFormData.animalType} 1</p>

              <div className="admin-upload-area">
                <div className="admin-pet-image">
                  <div className="admin-pet-icon-display">
                    {adminAvatarUrl ? (
                      <img src={adminAvatarUrl} alt={`${adminFormData.animalType} Avatar`} className="admin-avatar-preview" />
                    ) : (
                      <Dog size={70} color="white" />
                    )}
                  </div>
                  <input
                    type="file"
                    id="adminAvatarUpload"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleAdminAvatarChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="adminAvatarUpload" className="admin-upload-button">Choose Image</label>
                  <button
                    type="button"
                    className="admin-upload-button"
                    onClick={handleAdminAvatarUpload}
                  >
                    Upload
                  </button>
                  <p className="admin-upload-note">* Upload the image of your {adminFormData.animalType}</p>
                  <p className="admin-upload-format">* Only jpeg, jpg and png format allowed with the maximum size of 5MB.</p>
                  {adminAvatarFileName && <p className="admin-file-name-display">{adminAvatarFileName}</p>}
                </div>

                <div className="admin-pet-form-fields">
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label htmlFor="petName">{adminFormData.animalType} Name<span className="admin-required">*</span></label>
                      <input
                        type="text"
                        id="petName"
                        name="petName"
                        placeholder={`Enter ${adminFormData.animalType} Name`}
                        value={adminFormData.petName}
                        onChange={handleAdminChange}
                        required
                      />
                      {renderAdminError('petName')}
                    </div>
                    <div className="admin-form-group">
                      <label htmlFor="petCategory">Category of {adminFormData.animalType}<span className="admin-required">*</span></label>
                      <select
                        id="petCategory"
                        name="petCategory"
                        value={adminFormData.petCategory}
                        onChange={handleAdminChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {adminAnimalCategories[adminFormData.animalType].map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      {renderAdminError('petCategory')}
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label htmlFor="petBreed">
                        {adminFormData.animalType} Breed
                        {isAdminPetBreedRequired && <span className="admin-required">*</span>}
                      </label>
                      <select
                        id="petBreed"
                        name="petBreed"
                        value={adminFormData.petBreed}
                        onChange={handleAdminChange}
                        required={isAdminPetBreedRequired}
                        disabled={!isAdminPetBreedRequired}
                      >
                        <option value="">Select Breed</option>
                        {adminAnimalBreeds[adminFormData.animalType]
                          .filter(breed => !(adminFormData.animalType === 'Dog' && adminFormData.petCategory === 'Indian/Desi' && breed !== 'Any'))
                          .map(breed => (
                            <option key={breed} value={breed}>{breed}</option>
                          ))}
                      </select>
                      {renderAdminError('petBreed')}
                    </div>
                    <div className="admin-form-group">
                      <label htmlFor="petColor">{adminFormData.animalType} Colour<span className="admin-required">*</span></label>
                      <input
                        type="text"
                        id="petColor"
                        name="petColor"
                        placeholder={`Enter ${adminFormData.animalType} Colour`}
                        value={adminFormData.petColor}
                        onChange={handleAdminChange}
                        required
                      />
                      {renderAdminError('petColor')}
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label htmlFor="petAge">Age of {adminFormData.animalType}<span className="admin-required">*</span></label>
                      <select
                        id="petAge"
                        name="petAge"
                        value={adminFormData.petAge}
                        onChange={handleAdminChange}
                        required
                      >
                        <option value="">Select Age</option>
                        <option value="< 6 months">Less than 6 months</option>
                        <option value="6 months - 1 year">6 months - 1 year</option>
                        <option value="1 year">1 year</option>
                        <option value="2-5 years">2-5 years</option>
                        <option value="> 5 years">More than 5 years</option>
                      </select>
                      {renderAdminError('petAge')}
                    </div>
                    <div className="admin-form-group">
                      <label htmlFor="petSex">Sex of {adminFormData.animalType}<span className="admin-required">*</span></label>
                      <select
                        id="petSex"
                        name="petSex"
                        value={adminFormData.petSex}
                        onChange={handleAdminChange}
                        required
                      >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      {renderAdminError('petSex')}
                    </div>
                  </div>

                  {/* Re-added Vaccination fields */}
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label htmlFor="isVaccinated">Vaccinated?<span className="admin-required">*</span></label>
                      <select
                        id="isVaccinated"
                        name="isVaccinated"
                        value={adminFormData.isVaccinated}
                        onChange={handleAdminChange}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {renderAdminError('isVaccinated')}
                    </div>

                    {adminFormData.isVaccinated === 'Yes' && (
                      <>
                        <div className="admin-form-group">
                          <label htmlFor="dateOfVaccination">Date of Vaccination<span className="admin-required">*</span></label>
                          <input
                            type="date"
                            id="dateOfVaccination"
                            name="dateOfVaccination"
                            value={adminFormData.dateOfVaccination}
                            onChange={handleAdminChange}
                            required
                          />
                          {renderAdminError('dateOfVaccination')}
                        </div>
                        <div className="admin-form-group">
                          <label htmlFor="dueVaccination">Due date of Vaccination<span className="admin-required">*</span></label>
                          <input
                            type="date"
                            id="dueVaccination"
                            name="dueVaccination"
                            value={adminFormData.dueVaccination}
                            onChange={handleAdminChange}
                            required
                          />
                          {renderAdminError('dueVaccination')}
                        </div>
                      </>
                    )}
                  </div>

                  {adminFormData.isVaccinated === 'Yes' && (
                    <div className="admin-form-group admin-full-width">
                      <label htmlFor="vaccinationCertificate">
                        Upload {adminFormData.animalType === 'Dog' ? 'Rabies' : 'Vaccination'} Certificate<span className="admin-required">*</span>
                      </label>
                      <div className="admin-file-input-wrapper">
                        <input
                          type="file"
                          id="vaccinationCertificate"
                          name="vaccinationCertificate"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleAdminFileChange}
                          style={{ display: 'none' }}
                          required={adminFormData.isVaccinated === 'Yes'}
                        />
                        <label htmlFor="vaccinationCertificate" className="admin-file-select-button">
                          Choose File
                        </label>
                        <button
                          type="button"
                          className="admin-upload-button"
                          onClick={uploadAdminFile}
                        >
                          Upload Certificate
                        </button>
                        <span className="admin-file-name-display">{adminFileName}</span>
                      </div>
                      {renderAdminError('vaccinationCertificate')}
                      {isAdminUploading && (
                        <div className="admin-upload-progress">
                          <progress value={adminUploadProgress} max="100"></progress>
                          <span>{adminUploadProgress}%</span>
                        </div>
                      )}
                      <p className="admin-file-format-info">JPG, PNG and PDF Allowed, Maximum Size 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {adminActiveTab === 3 && (
          <div className="admin-form-step">
            <h2 className="admin-section-heading">Owner's Details</h2>

            <div className="admin-preview-area">
              <div className="admin-preview-row">
                <div className="admin-preview-item">
                  <span className="admin-preview-label">Owner Name :</span>
                  <span className="admin-preview-value">{adminFormData.fullName || 'Not provided'}</span>
                </div>
                <div className="admin-preview-item">
                  <span className="admin-preview-label">Phone Number :</span>
                  <span className="admin-preview-value">{adminFormData.phoneNumber || 'Not provided'}</span>
                </div>
              </div>

              <div className="admin-preview-row">
                <div className="admin-preview-item">
                  <span className="admin-preview-label">Gender :</span>
                  <span className="admin-preview-value">{adminFormData.gender || 'Not provided'}</span>
                </div>
                <div className="admin-preview-item">
                  <span className="admin-preview-label">Street name :</span>
                  <span className="admin-preview-value">{adminFormData.streetName || 'Not provided'}</span>
                </div>
              </div>

              <div className="admin-preview-row">
                <div className="admin-preview-item">
                  <span className="admin-preview-label">City :</span>
                  <span className="admin-preview-value">{adminFormData.city || 'Not provided'}</span>
                </div>
                <div className="admin-preview-item">
                  <span className="admin-preview-label">State :</span>
                  <span className="admin-preview-value">{adminFormData.state || 'Not provided'}</span>
                </div>
                <div className="admin-preview-item">
                  <span className="admin-preview-label">Pin code :</span>
                  <span className="admin-preview-value">{adminFormData.pinCode || 'Not provided'}</span>
                </div>
              </div>

              <div className="admin-preview-row">
                <div className="admin-preview-item">
                  <span className="admin-preview-label">Total House Area :</span>
                  <span className="admin-preview-value">{adminFormData.totalHouseArea || 'Not provided'}</span>
                </div>
                <div className="admin-preview-item">
                  <span className="admin-preview-label">Number of Animals :</span>
                  <span className="admin-preview-value">{adminFormData.numberOfAnimals || '1'}</span>
                </div>
              </div>
            </div>

            <h2 className="admin-section-heading">{adminFormData.animalType} Details 1</h2>
            <div className="admin-preview-area">
              <div className="admin-preview-row">
                <div className="admin-preview-item">
                  <span className="admin-preview-label">{adminFormData.animalType} Name:</span>
                  <span className="admin-preview-value">{adminFormData.petName || 'Not provided'}</span>
                </div>
                <div className="admin-preview-item">
                  <span className="admin-preview-label">{adminFormData.animalType} Category:</span>
                  <span className="admin-preview-value">{adminFormData.petCategory || 'Not provided'}</span>
                </div>
              </div>

              <div className="admin-preview-row">
                <div className="admin-preview-item">
                  <span className="admin-preview-label">{adminFormData.animalType} Breed:</span>
                  <span className="admin-preview-value">{adminFormData.petBreed || 'Not provided'}</span>
                </div>
                <div className="admin-preview-item">
                  <span className="admin-preview-label">{adminFormData.animalType} Colour:</span>
                  <span className="admin-preview-value">{adminFormData.petColor || 'Not provided'}</span>
                </div>
              </div>

              <div className="admin-preview-row">
                <div className="admin-preview-item">
                  <span className="admin-preview-label">Age of {adminFormData.animalType}:</span>
                  <span className="admin-preview-value">{adminFormData.petAge || 'Not provided'}</span>
                </div>
                <div className="admin-preview-item">
                  <span className="admin-preview-label">Sex of {adminFormData.animalType}:</span>
                  <span className="admin-preview-value">{adminFormData.petSex || 'Not provided'}</span>
                </div>
              </div>

              {/* Re-added Vaccination details in preview */}
              <div className="admin-preview-row">
                <div className="admin-preview-item">
                  <span className="admin-preview-label">Vaccinated:</span>
                  <span className="admin-preview-value">{adminFormData.isVaccinated || 'Not provided'}</span>
                </div>
                {adminFormData.isVaccinated === 'Yes' && (
                  <>
                    <div className="admin-preview-item">
                      <span className="admin-preview-label">Date of Vaccination:</span>
                      <span className="admin-preview-value">
                        {adminFormData.dateOfVaccination ? new Date(adminFormData.dateOfVaccination).toLocaleDateString() : 'Not provided'}
                      </span>
                    </div>
                    <div className="admin-preview-item">
                      <span className="admin-preview-label">Vaccine Due Date:</span>
                      <span className="admin-preview-value">
                        {adminFormData.dueVaccination ? new Date(adminFormData.dueVaccination).toLocaleDateString() : 'Not provided'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {adminFormData.isVaccinated === 'Yes' && (
                <div className="admin-preview-row">
                  <div className="admin-preview-item">
                    <span className="admin-preview-label">Vaccination Certificate:</span>
                    <span className="admin-preview-value">
                      {adminVaccinationProof.url ? (
                        <a href={adminVaccinationProof.url} target="_blank" rel="noopener noreferrer">
                          View Certificate
                        </a>
                      ) : (
                        'No file uploaded'
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="admin-preview-row">
                <div className="admin-preview-item">
                  <span className="admin-preview-label">Pet Avatar:</span>
                  <span className="admin-preview-value">
                    {adminAvatarUrl ? (
                      <a href={adminAvatarUrl} target="_blank" rel="noopener noreferrer">
                        View Image
                      </a>
                    ) : (
                      'No image uploaded'
                    )}
                  </span>
                </div>
              </div>
            </div>

            <h2 className="admin-section-heading">Declaration</h2>
            <div className="admin-declaration-area">
              <div className="admin-declaration-entry">
                <input
                  type="checkbox"
                  id="declaration1"
                  name="declaration1"
                  checked={adminFormData.declaration1}
                  onChange={handleAdminChange}
                  required
                />
                <label htmlFor="declaration1">
                  I hereby declare that the entries made by me in the Application Form are complete and true to the best of my knowledge, belief and information.
                </label>
              </div>

              <div className="admin-declaration-entry">
                <input
                  type="checkbox"
                  id="declaration2"
                  name="declaration2"
                  checked={adminFormData.declaration2}
                  onChange={handleAdminChange}
                  required
                />
                <label htmlFor="declaration2">
                  I hereby undertake to present the original documents for verification immediately upon demand by the concerned authorities.
                </label>
              </div>

              <div className="admin-declaration-entry">
                <input
                  type="checkbox"
                  id="declaration3"
                  name="declaration3"
                  checked={adminFormData.declaration3}
                  onChange={handleAdminChange}
                  required
                />
                <label htmlFor="declaration3">
                  If in any case, concerned authorities encountered any fault then they would take action against me and anytime like cancellation of the license by the authorized authority.
                </label>
              </div>

              <div className="admin-declaration-entry">
                <input
                  type="checkbox"
                  id="declaration4"
                  name="declaration4"
                  checked={adminFormData.declaration4}
                  onChange={handleAdminChange}
                  required
                />
                <label htmlFor="declaration4">
                  I hereby assure the Municipal Corporation, Gorakhpur that, I am not using my pet for any breeding purpose and will follow all the rules and regulation (
                  <a href="./Rules.pdf" target='_blank' className="admin-link-style">View PDF</a>
                  ) issued by Municipal Corporation, Gorakhpur from time to time.
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="admin-form-actions">
          {adminActiveTab > 1 && <button type="button" className="admin-back-button" onClick={handleAdminBack}>Back</button>}
          {adminActiveTab < 3 ? (
            <button type="button" className="admin-next-button" onClick={handleAdminNext}>Next</button>
          ) : (
            <button
              type="submit"
              className="admin-submit-button"
              disabled={
                !adminFormData.declaration1 ||
                !adminFormData.declaration2 ||
                !adminFormData.declaration3 ||
                !adminFormData.declaration4 ||
                (adminFormData.isVaccinated === 'Yes' && adminFile && !adminVaccinationProof.url && isAdminUploading) // Added back disable logic for vaccination upload
              }
            >
              {isAdminUploading ? 'Uploading...' : 'Submit'} {/* Added back uploading text */}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminAddForm;
