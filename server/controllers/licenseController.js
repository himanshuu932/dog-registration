const DogLicense = require("../models/dogLicense.js");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mongoose = require('mongoose');


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
        animalType,
      fullName, phoneNumber, gender, streetName, pinCode, city, state, 
      totalHouseArea, numberOfAnimals, dogName, dogCategory, dogBreed, 
      dogColor, dogAge, dogSex, dateOfVaccination, dueVaccination,
      avatarUrl, vaccinationProofUrl, vaccinationProofPublicId,
       pet,
    } = req.body;

    // Generate license ID
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2).padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9000 + 1000).toString();
    const license_Id = `${year}${month}${day}${hours}${minutes}${seconds}${random}`;

    const ownerId = req.user.userId;



// In the applyLicense function, update the newLicense object:
const newLicense = new DogLicense({
  owner: ownerId,
  license_Id: license_Id,
  animalType: animalType, // Make sure this is included
  fullName,
  phoneNumber,
  gender,
  address: { // Keep as object to match schema
    streetName,
    pinCode,
    city,
    state
  },
  totalHouseArea,
  numberOfAnimals, // Changed to match schema
  pet,
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  status: 'pending'
});

   
    const savedLicense = await newLicense.save();
   

    res.status(201).json({ 
      message: "License application submitted",
      licenseId: savedLicense._id,
      generatedLicenseId: savedLicense.license_Id // Return the generated ID for verification
    });
  } catch (error) {
    console.error("License apply error:", error);
    
    // More detailed error logging
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }

    // If license creation fails but file was uploaded, clean up from Cloudinary
    if (req.body.vaccinationProofPublicId) {
      try {
        await cloudinary.uploader.destroy(req.body.vaccinationProofPublicId);
      } catch (cleanupError) {
        console.error("Failed to cleanup Cloudinary file:", cleanupError);
      }
    }
    
    res.status(500).json({ 
      message: "Server error while applying license",
      error: error.message 
    });
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



exports.getLicenseForRenewal = async (req, res) => {
  try {
    const { licenseNumber } = req.query;

    if (!licenseNumber) {
      return res.status(400).json({ message: "License number is required" });
    }

    console.log("Requested licenseNumber:", licenseNumber);
console.log("Authenticated user ID:", req.user.userId);

    const license = await DogLicense.findOne({
      license_Id: licenseNumber,
     

    });

    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }

    res.json({ license });
  } catch (error) {
    console.error("Get license for renewal error:", error);
    res.status(500).json({ message: "Failed to retrieve license" });
  }
};


// User submits renewal request
exports.requestLicenseRenewal = async (req, res) => {
  try {
    const { licenseNumber } = req.body;
    
    if (!licenseNumber) {
      return res.status(400).json({ message: "License number is required" });
    }

    const license = await DogLicense.findOne({ 
      license_Id: licenseNumber,
     
    });

    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }

    // Check if license is already approved for renewal
    if (license.status === 'renewal_pending') {
      return res.status(400).json({ message: "Renewal request already submitted" });
    }

    // Update the license status to 'renewal_pending'
    await DogLicense.findByIdAndUpdate(
      license._id,
      { 
        status: 'renewal_pending',
        renewalRequestDate: new Date() // Track when renewal was requested
      }
    );

    res.json({ 
      message: "Renewal request submitted for admin approval",
      status: 'renewal_pending'
    });
  } catch (error) {
    console.error("License renewal request error:", error);
    res.status(500).json({ message: "Failed to submit renewal request" });
  }
};

