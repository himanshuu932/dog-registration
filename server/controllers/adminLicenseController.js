// controllers/adminLicenseController.js
const DogLicense = require("../models/dogLicense");
const LicenseID = require("../models/licenseId");
const User = require("../models/user");
exports.getAllLicenses = async (req, res) => {
  try {
    const licenses = await DogLicense.find().populate("owner", "username email");
    res.json(licenses);
  } catch (error) {
    console.error("Get all licenses error:", error);
    res.status(500).json({ message: "Failed to fetch licenses" });
  }
};

// New function to fetch a license by its ID
exports.getLicenseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find by license_Id instead of _id
    const license = await DogLicense.findOne({ license_Id: id }).populate("owner", "username email");

    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }

    res.json(license);
  } catch (error) {
    console.error("Get license by license_Id error:", error);
    res.status(500).json({ message: "Failed to fetch license by license_Id" });
  }
};

exports.approveLicense = async (req, res) => {
  try {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const license = await DogLicense.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        expiryDate: oneYearLater
      },
      { new: true }
    );

    if (!license) return res.status(404).json({ message: "License not found" });

    res.json({ message: "License approved", license });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ message: "Failed to approve license" });
  }
};


exports.rejectLicense = async (req, res) => {
  try {
    const { reason } = req.body; // Get reason from request body
    const license = await DogLicense.findByIdAndUpdate(
      req.params.id, 
      { 
        status: "rejected",
        rejectionReason: reason,
        rejectionDate: new Date()
      }, 
      { new: true }
    );
    if (!license) return res.status(404).json({ message: "License not found" });
    
     const user = await User.findById(license.owner);
    if (user) { 
      user.credits.amt=user.credits.amt+license.fees.total;
      await user.save();
    }

     


    res.json({ message: "License rejected", license });
  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).json({ message: "Failed to reject license" });
  }
};


exports.createLicenseByAdmin = async (req, res) => {
  try {
    const {
      animalType, fullName, phoneNumber, gender,
      address, totalHouseArea, numberOfAnimals, pet
    } = req.body;

    const isVaccinatedStr = String(pet?.isVaccinated || '').toLowerCase();
    const isProvisional = isVaccinatedStr !== 'yes';
    const prefix = isProvisional ? 'PL' : 'FL';

    const counter = await LicenseID.findOneAndUpdate(
      {},
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const license_Id = `${prefix}${counter.seq}`;

    const newLicense = new DogLicense({
      owner: req.user.userId,
      license_Id,
      animalType,
      fullName,
      phoneNumber,
      gender,
      address,
      totalHouseArea,
      numberOfAnimals,
      pet,
      isProvisional,
      provisionalExpiryDate: isProvisional ? new Date(Date.now() + 30 * 86400000) : null,
      expiryDate: isProvisional ? null : new Date(Date.now() + 365 * 86400000),
      status: 'approved', // ✅ Directly approved
      approvedBy: req.user.userId,
      approvalDate: new Date()
    });

    const savedLicense = await newLicense.save();

    res.status(201).json({
      message: "License created and approved successfully",
      licenseId: savedLicense._id,
      generatedLicenseId: savedLicense.license_Id
    });
  } catch (error) {
    console.error("Admin license creation error:", error);
    res.status(500).json({
      message: "Failed to create license",
      error: error.message
    });
  }
};



// Admin approves renewal
exports.approveRenewal = async (req, res) => {
  try {
    const { licenseId } = req.body;
    console.log("reached here: "+ req.user);
    
    if (!licenseId) {
      return res.status(400).json({ message: "License ID is required" });
    }

    // Check if user is admin
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ message: "Not authorized" });
    // }

    const license = await DogLicense.findById(licenseId);

    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }

    if (license.status !== 'renewal_pending') {
      return res.status(400).json({ message: "No pending renewal for this license" });
    }

    // Calculate new expiry date (1 year from now or from current expiry, whichever is later)
    const currentExpiry = new Date(license.expiryDate);
    const newExpiryDate = new Date(Math.max(
      Date.now() + 365 * 24 * 60 * 60 * 1000,
      currentExpiry.getTime() + 365 * 24 * 60 * 60 * 1000
    ));
    
    // Update the license
    const updatedLicense = await DogLicense.findByIdAndUpdate(
      license._id,
      { 
        expiryDate: newExpiryDate,
        status: 'approved',
        renewalApprovalDate: new Date(),
        approvedBy: req.user.userId
      },
      { new: true }
    );

    res.json({ 
      message: "License renewal approved",
      license: updatedLicense
    });
  } catch (error) {
    console.error("License renewal approval error:", error);
    res.status(500).json({ message: "Failed to approve renewal" });
  }
};

// Admin rejects renewal
exports.rejectRenewal = async (req, res) => {
  try {
    const { licenseId, reason } = req.body;
    
    if (!licenseId) {
      return res.status(400).json({ message: "License ID is required" });
    }

    // Check if user is admin
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ message: "Not authorized" });
    // }

    const license = await DogLicense.findById(licenseId);

    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }

    if (license.status !== 'renewal_pending') {
      return res.status(400).json({ message: "No pending renewal for this license" });
    }

    // Update the license status to rejected
    const updatedLicense = await DogLicense.findByIdAndUpdate(
      license._id,
      { 
        status: 'rejected',
        rejectionReason: reason,
        rejectionDate: new Date()
      },
      { new: true }
    );

    res.json({ 
      message: "License renewal rejected",
      license: updatedLicense
    });
  } catch (error) {
    console.error("License renewal rejection error:", error);
    res.status(500).json({ message: "Failed to reject renewal" });
  }
};