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
  getLicenseById, // New import
  // getPendingRenewals, // Commented out as it's not used in the provided snippet
} = require("../controllers/adminLicenseController");

router.get("/all", verifyToken, isAdmin, getAllLicenses);
router.patch("/approve/:id", verifyToken, isAdmin, approveLicense);
// Change to:
router.post("/reject/:id", verifyToken, isAdmin, rejectLicense); // This line was already present in the previous snippet, ensuring it's a POST for reject.
// router.get('/renewals/pending', verifyToken, isAdmin, getPendingRenewals);
router.post('/renew-registration/approve', verifyToken, isAdmin, approveRenewal);
router.post('/renew-registration/reject', verifyToken, isAdmin, rejectRenewal);

// New route to fetch a license by ID
router.get("/:id", verifyToken, isAdmin, getLicenseById);

module.exports = router;