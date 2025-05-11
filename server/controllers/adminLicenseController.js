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
