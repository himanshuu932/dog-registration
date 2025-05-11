const express = require("express");
const router = express.Router();
const {sendEmailOtp, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp, login, getProfile} = require("../controllers/authController.js");

router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/send-phone-otp", sendPhoneOtp);
router.post("/verify-phone-otp", verifyPhoneOtp);
router.post("/login", login);
router.get("/profile", getProfile);

module.exports = router;
