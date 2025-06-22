const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleWare/authMiddleware");
const { isAdmin } = require("../middleWare/isAdmin");
const {
  getAllLicenses,
  approveLicense,
  rejectLicense,
  approveRenewal,
  rejectRenewal,
  getLicenseById,
  createLicenseByAdmin,
  updateProvisionalToFull,
  getFeeConfig,      // New import
  updateFeeConfig,   // New import
} = require("../controllers/adminLicenseController");

// Fee management routes
router.get("/fees", verifyToken, isAdmin, getFeeConfig);
router.post("/fees", verifyToken, isAdmin, updateFeeConfig);

// License management routes
router.get("/all", verifyToken, isAdmin, getAllLicenses);
router.patch("/approve/:id", verifyToken, isAdmin, approveLicense);
router.patch("/reject/:id", verifyToken, isAdmin, rejectLicense);
router.post('/renew-registration/approve', verifyToken, isAdmin, approveRenewal);
router.post('/renew-registration/reject', verifyToken, isAdmin, rejectRenewal);
router.post("/add-license", verifyToken, isAdmin, createLicenseByAdmin);
router.patch("/update-provisional", verifyToken, isAdmin, updateProvisionalToFull);
router.get("/:id", verifyToken, isAdmin, getLicenseById);

module.exports = router;
