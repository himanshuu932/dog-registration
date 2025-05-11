const DogLicense = require("../models/dogLicense.js");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Promisify file system operations
const unlinkAsync = promisify(fs.unlink);

// Helper function to handle file upload
const uploadToCloudinary = async (filePath, mimetype) => {
  const resourceType = mimetype === 'application/pdf' ? 'raw' : 'auto';

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'pet-licenses',
      resource_type: resourceType,
      type: 'upload'
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};


exports.uploadVaccinationProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, req.file.mimetype);
    console.log("this is mimetype: "+ req.file.mimetype)

    // Clean up the temporary file
    await unlinkAsync(req.file.path);

    res.json({ 
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error("File upload error:", error);
    
    // Attempt to clean up temp file if it exists
    if (req.file?.path) {
      try {
        await unlinkAsync(req.file.path);
      } catch (cleanupError) {
        console.error("Temp file cleanup failed:", cleanupError);
      }
    }
    
    res.status(500).json({ message: error.message || "File upload failed" });
  }
};

exports.applyLicense = async (req, res) => {
  try {
    const {
      fullName, phoneNumber, gender, streetName, pinCode, city, state, 
      totalHouseArea, numberOfDogs, dogName, dogCategory, dogBreed, 
      dogColor, dogAge, dogSex, dateOfVaccination, dueVaccination,
      avatarUrl,vaccinationProofUrl, vaccinationProofPublicId,
    } = req.body;

    const ownerId = req.user.userId;
   // console.log("this is user : "+ownerId);

    const newLicense = new DogLicense({
      owner: ownerId,
      fullName,
      phoneNumber,
      gender,
      address: { streetName, pinCode, city, state },
      totalHouseArea,
      numberOfDogs,
      dog: {
        name: dogName,
        category: dogCategory,
        breed: dogBreed,
        color: dogColor,
        age: dogAge,
        sex: dogSex,
        dateOfVaccination,
        dueVaccination,
        avatarUrl,
        vaccinationProofUrl,
        vaccinationProofPublicId 
      },
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'pending'
    });

    await newLicense.save();
    res.status(201).json({ 
      message: "License application submitted",
      licenseId: newLicense._id
    });
  } catch (error) {
    console.error("License apply error:", error);
    
    // If license creation fails but file was uploaded, clean up from Cloudinary
    if (req.body.vaccinationProofPublicId) {
      try {
        await cloudinary.uploader.destroy(req.body.vaccinationProofPublicId);
      } catch (cleanupError) {
        console.error("Failed to cleanup Cloudinary file:", cleanupError);
      }
    }
    
    res.status(500).json({ message: "Server error while applying license" });
  }
};

exports.getUserLicenses = async (req, res) => {
  try {
    
    const licenses = await DogLicense.find({ owner: req.user.userId })
      .sort({ createdAt: -1 }); // Newest first
    
    res.json(licenses);
    
  } catch (error) {
    console.error("Get user licenses error:", error);
    res.status(500).json({ message: "Failed to fetch licenses" });
  }
};

// Add this for future cleanup if needed
exports.deleteLicense = async (req, res) => {
  try {
    const license = await DogLicense.findById(req.params.id);
    
    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }
    
    // Check ownership
    if (license.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // Delete from Cloudinary if exists
    if (license.dog?.vaccinationProofPublicId) {
      await cloudinary.uploader.destroy(license.dog.vaccinationProofPublicId);
    }
    
    // Delete from database
    await DogLicense.findByIdAndDelete(req.params.id);
    
    res.json({ message: "License deleted successfully" });
  } catch (error) {
    console.error("Delete license error:", error);
    res.status(500).json({ message: "Failed to delete license" });
  }
};