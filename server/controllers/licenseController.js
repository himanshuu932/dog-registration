// controllers/licenseController.js

const DogLicense = require("../models/dogLicense.js");
const LicenseID = require('../models/licenseId');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { promisify } = require('util');
const mongoose = require('mongoose');
const { generatePaymentURL } = require('./paymentController');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const unlinkAsync = promisify(fs.unlink);

// --- 1. Centralized Fine Calculation Function ---
const calculateFine = (referenceDate, type) => {
  const today = new Date();
  // Ensure referenceDate is a Date object
  const refDate = new Date(referenceDate);

  let fine = 0;

  if (type === 'new') {
    // Fine logic for new registration based on financial year (starts April 1)
    const financialYearStart = new Date(today.getFullYear(), 3, 1); // April 1st
    if (today < financialYearStart) {
        // If registering before April 1st for the next FY, no fine.
        return 0;
    }
    
    const currentMonth = today.getMonth(); // 0-indexed (April is 3)
    
    if (currentMonth === 3) { // April
      fine = 0;
    } else if (currentMonth === 4) { // May
      fine = 100;
    } else if (currentMonth > 4) { // June onwards
      fine = 100;
      // Calculate days passed since May 31st for daily fine
      const may31st = new Date(today.getFullYear(), 5, 0);
      const diffTime = Math.abs(today - may31st);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine += diffDays * 50;
    }

  } else if (type === 'renewal') {
    // Fine logic for renewal based on license expiry date
    if (today <= refDate) {
      return 0; // No fine if renewed on or before expiry
    }
    
    const timeDiff = today.getTime() - refDate.getTime();
    const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLate > 0 && daysLate <= 30) {
      fine = 100; // Flat fine for the first 30 days of delay
    } else if (daysLate > 30) {
      fine = 100 + (daysLate - 30) * 10; // Rs 100 + Rs 10 for each day after 30 days
    }
  }

  return fine;
};


// --- 2. New Endpoint for Frontend to Preview Fees ---
exports.calculateNewFees = (req, res) => {
    try {
        const fine = calculateFine(new Date(), 'new');
        const registrationFee = 200;
        const total = registrationFee + fine;
        res.status(200).json({ registrationFee, fine, total });
    } catch (error) {
        res.status(500).json({ message: "Error calculating fees", error: error.message });
    }
};

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
    const result = await uploadToCloudinary(req.file.path, req.file.mimetype);
    await unlinkAsync(req.file.path);
    res.json({
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error("File upload error:", error);
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


// --- 3. Modified applyLicense Endpoint ---
exports.applyLicense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      animalType,
      fullName, phoneNumber, gender, streetName, pinCode, city, state,
      totalHouseArea, numberOfAnimals, pet
    } = req.body;

    // Server-side fee calculation
    const fine = calculateFine(new Date(), 'new');
    const totalFees = 200 + fine;

    const isVaccinatedStr = String(pet?.isVaccinated || '').toLowerCase();
    const isProvisional = isVaccinatedStr !== 'yes';
    const prefix = isProvisional ? 'PL' : 'FL';

    const counter = await LicenseID.findOneAndUpdate({}, { $inc: { seq: 1 } }, { new: true, upsert: true, session });
    const license_Id = `${prefix}${counter.seq}`;

    const uniqueRefNo = `REF${Date.now()}`;

    const newLicense = new DogLicense({
      owner: req.user.userId,
      license_Id,
      animalType,
      fullName,
      phoneNumber,
      gender,
      address: { streetName, pinCode, city, state },
      totalHouseArea,
      numberOfAnimals,
      pet,
      isProvisional,
      provisionalExpiryDate: isProvisional ? new Date(Date.now() + 30 * 86400000) : null,
      expiryDate: isProvisional ? null : new Date(Date.now() + 365 * 86400000),
      status: 'payment_processing',
      fees: {
        total: totalFees,
        fine: fine,
        paid: false,
        paymentDate: null
      },
      paymentReferenceNo: uniqueRefNo,
    });
    const savedLicense = await newLicense.save({ session });

    const paymentParams = {
      merchantid: process.env.EAZYPAY_MERCHANT_ID,
      'mandatory fields': `${uniqueRefNo}|45|${totalFees}|${savedLicense._id}|${fullName}|${phoneNumber}`,
      'optional fields': '',
      returnurl: process.env.EAZYPAY_RETURN_URL,
      'Reference No': uniqueRefNo,
      submerchantid: '45',
      'transaction amount': String(totalFees),
      paymode: '9'
    };
    const eazypayUrl = generatePaymentURL(paymentParams);
    
    await session.commitTransaction();

    res.status(201).json({
      message: "License application initiated, redirecting to payment",
      licenseId: savedLicense._id,
      paymentUrl: eazypayUrl
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("❌ License apply error:", error);
    if (req.body.pet?.vaccinationProofPublicId) { // Check if publicId exists
      try {
        await cloudinary.uploader.destroy(req.body.pet.vaccinationProofPublicId);
      } catch (cleanupError) {
        console.error("🧹 Cleanup failed:", cleanupError);
      }
    }
    res.status(500).json({
      message: "Server error while applying license",
      error: error.message
    });
  } finally {
    session.endSession();
  }
};


// --- 4. New Endpoint to Initiate Renewal with Payment ---
exports.requestLicenseRenewal = async (req, res) => {
    const { licenseNumber } = req.body;
    if (!licenseNumber) {
        return res.status(400).json({ message: "License number is required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const license = await DogLicense.findOne({ license_Id: licenseNumber, owner: req.user.userId }).session(session);

        if (!license) {
            await session.abortTransaction();
            return res.status(404).json({ message: "License not found or you are not the owner." });
        }
        if (license.status !== 'approved') {
            await session.abortTransaction();
            return res.status(400).json({ message: `Renewal not allowed. License status is '${license.status}'.` });
        }
        if (!license.expiryDate) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Cannot renew license without an expiry date."});
        }

        // Server-side fee calculation for renewal
        const fine = calculateFine(license.expiryDate, 'renewal');
        const totalRenewalFee = 100 + fine; // Rs. 100 renewal fee + fine

        const uniqueRefNo = `REN${Date.now()}`;

        // Update license for renewal payment
        license.status = 'renewal_payment_processing';
        license.renewalRequestDate = new Date();
        license.paymentReferenceNo = uniqueRefNo;
        license.fees = {
            total: totalRenewalFee,
            fine: fine,
            paid: false,
            paymentDate: null
        };
        
        await license.save({ session });
        
        const paymentParams = {
            merchantid: process.env.EAZYPAY_MERCHANT_ID,
            'mandatory fields': `${uniqueRefNo}|45|${totalRenewalFee}|${license._id}|${license.fullName}|${license.phoneNumber}`,
             'optional fields': '',
            returnurl: process.env.EAZYPAY_RETURN_URL,
            'Reference No': uniqueRefNo,
            submerchantid: '45',
            'transaction amount': String(totalRenewalFee),
            paymode: '9'
        };
        const eazypayUrl = generatePaymentURL(paymentParams);

        await session.commitTransaction();

        res.status(200).json({
            message: "Renewal process initiated. Redirecting to payment.",
            paymentUrl: eazypayUrl
        }); 
        console.log(`Renewal initiated for license ${licenseNumber}. Payment URL: ${eazypayUrl}`);

    } catch (error) {
        await session.abortTransaction();
        console.error("❌ Renewal initiation error:", error);
        res.status(500).json({ message: "Server error during renewal initiation.", error: error.message });
    } finally {
        session.endSession();
    }
};


// --- 5. Other Helper Endpoints ---
exports.getUserLicenses = async (req, res) => {
  try {
    const licenses = await DogLicense.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.json(licenses);
  } catch (error) {
    console.error("Get user licenses error:", error);
    res.status(500).json({ message: "Failed to fetch licenses" });
  }
};

exports.deleteLicense = async (req, res) => {
  try {
    const license = await DogLicense.findById(req.params.id);
    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }
    if (license.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (license.pet?.vaccinationProofPublicId) { // Corrected path
      await cloudinary.uploader.destroy(license.pet.vaccinationProofPublicId);
    }
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
// exports.requestLicenseRenewal = async (req, res) => {
//   try {
//     const { licenseNumber } = req.body;

//     if (!licenseNumber) {
//       return res.status(400).json({ message: "License number is required" });
//     }

//     const license = await DogLicense.findOne({
//       license_Id: licenseNumber,

//     });

//     if (!license) {
//       return res.status(404).json({ message: "License not found" });
//     }

//     // Check if license is already approved for renewal
//     if (license.status === 'renewal_pending') {
//       return res.status(400).json({ message: "Renewal request already submitted" });
//     }

//     // Update the license status to 'renewal_pending'
//     await DogLicense.findByIdAndUpdate(
//       license._id,
//       {
//         status: 'renewal_pending',
//         renewalRequestDate: new Date() // Track when renewal was requested
//       }
//     );

//     res.json({
//       message: "Renewal request submitted for admin approval",
//       status: 'renewal_pending'
//     });
//   } catch (error) {
//     console.error("License renewal request error:", error);
//     res.status(500).json({ message: "Failed to submit renewal request" });
//   }
// };