// controllers/adminLicenseController.js
const DogLicense = require("../models/dogLicense");
const LicenseID = require("../models/licenseId");
const User = require("../models/user");
const FeeConfig = require("../models/feeConfig"); // Import the new model

// --- Fee Management ---
exports.getFeeConfig = async (req, res) => {
  try {
    const fees = await FeeConfig.getFees();
    res.json(fees);
  } catch (error) {
    console.error("Get Fee Config Error:", error);
    res.status(500).json({ message: "Failed to fetch fee configuration." });
  }
};

exports.updateFeeConfig = async (req, res) => {
  try {
    const { newRegistrationFee, renewalFee } = req.body;

    if (newRegistrationFee === undefined || renewalFee === undefined) {
      return res.status(400).json({ message: "Both new registration and renewal fees are required." });
    }

    const updatedFees = await FeeConfig.findOneAndUpdate(
      { identifier: 'master-fees' },
      { newRegistrationFee, renewalFee },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: "Fees updated successfully!", fees: updatedFees });
  } catch (error) {
    console.error("Update Fee Config Error:", error);
    res.status(500).json({ message: "Failed to update fees.", error: error.message });
  }
};


// --- License Management ---
exports.getAllLicenses = async (req, res) => {
  try {
    const licenses = await DogLicense.find().populate("owner", "username email");
    res.json(licenses);
  } catch (error) {
    console.error("Get all licenses error:", error);
    res.status(500).json({ message: "Failed to fetch licenses" });
  }
};

exports.getLicenseById = async (req, res) => {
  try {
    const { id } = req.params;
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
      { status: "approved", expiryDate: oneYearLater },
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
    const { reason } = req.body;
    const license = await DogLicense.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectionReason: reason, rejectionDate: new Date() },
      { new: true }
    );
    if (!license) return res.status(404).json({ message: "License not found" });
    const user = await User.findById(license.owner);
    if (user) {
      user.credits.amt = user.credits.amt + license.fees.total;
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
    const counter = await LicenseID.findOneAndUpdate({}, { $inc: { seq: 1 } }, { new: true, upsert: true });
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
      status: 'approved',
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
    res.status(500).json({ message: "Failed to create license", error: error.message });
  }
};

exports.updateProvisionalToFull = async (req, res) => {
  try {
    const { licenseId } = req.body;
    if (!licenseId) {
      return res.status(400).json({ message: "License ID is required" });
    }
    const license = await DogLicense.findOne({ license_Id: licenseId });
    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }
    if (!license.isProvisional) {
      return res.status(400).json({ message: "This is not a provisional license." });
    }
    if (license.status !== 'pending' && license.status !== 'approved') {
        return res.status(400).json({ message: `License status is '${license.status}', cannot update.` });
    }
    const newLicenseId = license.license_Id.replace('PL', 'FL');
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    license.isProvisional = false;
    license.license_Id = newLicenseId;
    license.status = 'approved';
    license.expiryDate = oneYearLater;
    license.provisionalExpiryDate = null;
    license.approvalDate = new Date();
    license.approvedBy = req.user.userId;
    const updatedLicense = await license.save();
    res.json({
      message: `Provisional license ${licenseId} has been successfully updated to ${newLicenseId}.`,
      license: updatedLicense,
    });
  } catch (error) {
    console.error("Provisional to Full License update error:", error);
    res.status(500).json({ message: "Failed to update provisional license", error: error.message });
  }
};

exports.approveRenewal = async (req, res) => {
  try {
    const { licenseId } = req.body;
    if (!licenseId) {
      return res.status(400).json({ message: "License ID is required" });
    }
    const license = await DogLicense.findById(licenseId);
    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }
    if (license.status !== 'renewal_pending') {
      return res.status(400).json({ message: "No pending renewal for this license" });
    }
    const currentExpiry = new Date(license.expiryDate);
    const newExpiryDate = new Date(Math.max(
      Date.now() + 365 * 24 * 60 * 60 * 1000,
      currentExpiry.getTime() + 365 * 24 * 60 * 60 * 1000
    ));
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
    res.json({ message: "License renewal approved", license: updatedLicense });
  } catch (error) {
    console.error("License renewal approval error:", error);
    res.status(500).json({ message: "Failed to approve renewal" });
  }
};

exports.rejectRenewal = async (req, res) => {
  try {
    const { licenseId, reason } = req.body;
    if (!licenseId) {
      return res.status(400).json({ message: "License ID is required" });
    }
    const license = await DogLicense.findById(licenseId);
    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }
    if (license.status !== 'renewal_pending') {
      return res.status(400).json({ message: "No pending renewal for this license" });
    }
    const user = await User.findById(license.owner);
    if (user && license.fees.total > 0) {
      user.credits.amt = user.credits.amt + license.fees.total;
      await user.save();
      console.log(`Refunded ${license.fees.total} credits to user ${user.username} for rejected renewal.`);
    }
    const updatedLicense = await DogLicense.findByIdAndUpdate(
      license._id,
      {
        status: 'approved',
        rejectionReason: reason,
        paymentReferenceNo: license.lastpaymentReferenceNo,
        rejectionDate: new Date()
      },
      { new: true }
    );
    res.json({
      message: "License renewal rejected and fees refunded as credits. The license has been reverted to its previous approved state.",
      license: updatedLicense
    });
  } catch (error) {
    console.error("License renewal rejection error:", error);
    res.status(500).json({ message: "Failed to reject renewal" });
  }
};
