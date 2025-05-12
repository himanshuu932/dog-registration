const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/licenseController');
const upload = require('../middleWare/uploadMiddleware');
const { verifyToken } = require("../middleWare/authMiddleware");

// Make sure these are properly imported functions
router.post('/upload', upload, licenseController.uploadVaccinationProof);
router.post('/apply', verifyToken, licenseController.applyLicense);
router.get('/user', verifyToken, licenseController.getUserLicenses);
router.delete('/:id', licenseController.deleteLicense);
  
module.exports = router;