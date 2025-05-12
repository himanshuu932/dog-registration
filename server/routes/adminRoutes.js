const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleWare/authMiddleware");
const { isAdmin } = require("../middleWare/isAdmin");
const {
  getAllLicenses,
  approveLicense,
  rejectLicense,
} = require("../controllers/adminLicenseController");

router.get("/all", verifyToken, isAdmin, getAllLicenses);
router.patch("/approve/:id", verifyToken, isAdmin, approveLicense);
router.patch("/reject/:id", verifyToken, isAdmin, rejectLicense);

module.exports = router;
