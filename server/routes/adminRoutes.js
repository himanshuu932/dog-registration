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
  getPendingRenewals,
} = require("../controllers/adminLicenseController");

router.get("/all", verifyToken, isAdmin, getAllLicenses);
router.patch("/approve/:id", verifyToken, isAdmin, approveLicense);
router.patch("/reject/:id", verifyToken, isAdmin, rejectLicense);
router.get('/renewals/pending', verifyToken, isAdmin, getPendingRenewals);
router.post('/renew-registration/approve', verifyToken, isAdmin, approveRenewal);
router.post('/renew-registration/reject', verifyToken, isAdmin, rejectRenewal);

module.exports = router;
