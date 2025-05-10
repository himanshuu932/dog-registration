const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/send-email-otp", authController.sendEmailOtp);
router.post("/verify-email-otp", authController.verifyEmailOtp);
router.post("/send-phone-otp", authController.sendPhoneOtp);
router.post("/verify-phone-otp", authController.verifyPhoneOtp);
router.post("/login", authController.login);
router.get("/profile", authController.getProfile);

module.exports = router;
