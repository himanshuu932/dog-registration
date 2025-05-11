const express = require("express");
const router = express.Router();
const { applyLicense, getUserLicenses } = require("../controllers/licenseController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/apply", verifyToken, applyLicense);
router.get("/my-licenses", verifyToken, getUserLicenses);

module.exports = router;
