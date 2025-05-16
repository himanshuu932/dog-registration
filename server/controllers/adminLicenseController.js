// controllers/adminLicenseController.js
const DogLicense = require("../models/dogLicense");

exports.getAllLicenses = async (req, res) => {
  try {
    const licenses = await DogLicense.find().populate("owner", "username email");
    res.json(licenses);
  } catch (error) {
    console.error("Get all licenses error:", error);
    res.status(500).json({ message: "Failed to fetch licenses" });
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
    const license = await DogLicense.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    if (!license) return res.status(404).json({ message: "License not found" });
    res.json({ message: "License rejected", license });
  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).json({ message: "Failed to reject license" });
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

exports.getPendingRenewals = async (req, res) => {
  try {
    console.log("Entering getPendingRenewals function"); // Add this line
    const pendingRenewals = await DogLicense.find({ status: "renewal_pending" }).sort({ renewalRequestDate: -1 });
    console.log("Found renewals:", pendingRenewals.length); // Add this line
    res.json({ pendingRenewals });
  } catch (error) {
    console.error("Fetch pending renewals error:", error);
    res.status(500).json({ message: "Failed to fetch pending renewals" });
  }
};