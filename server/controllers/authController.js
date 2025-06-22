const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user"); // Your User model
const nodemailer = require("nodemailer");
const twilio = require("twilio");

// Initialize emailOtpStore, phoneOtpStore, transporter, twilioClient as before...
const emailOtpStore = {};
const phoneOtpStore = {};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendEmailOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Code",
      text: `Your OTP is: ${otp}`,
    });
    emailOtpStore[email] = otp;
    setTimeout(() => delete emailOtpStore[email], 600000);
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Send Email OTP error:", err);
    res.status(500).json({ message: "Failed to send email OTP" });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  const { email, otp, username, password, phone } = req.body;
  if (emailOtpStore[email] === parseInt(otp)) {
    delete emailOtpStore[email];
    try {
      let existingUser = await User.findOne({ username }); //
      if (existingUser) return res.status(400).json({ message: "Username already exists" });
      existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "Email already exists" });

      const hashedPassword = await bcrypt.hash(password, 10); //
      await new User({ username, password: hashedPassword, email, phone }).save(); //
      res.json({ message: "Signup successful" }); //
    } catch (error) {
      console.error("Verify Email OTP error:", error);
      res.status(500).json({ message: "Error during signup process."});
    }
  } else {
    res.status(400).json({ message: "Invalid OTP" }); //
  }
};

exports.sendPhoneOtp = async (req, res) => {
  const { phone } = req.body; //
  const otp = Math.floor(100000 + Math.random() * 900000); //
  try {
    await twilioClient.messages.create({ //
      to: phone, //
      from: process.env.TWILIO_PHONE_NUMBER, //
      body: `Your OTP is: ${otp}`, //
    });
    phoneOtpStore[phone] = otp; //
    setTimeout(() => delete phoneOtpStore[phone], 600000); //
    res.json({ message: "OTP sent to phone" }); //
  } catch (err) {
    console.error("Send Phone OTP error:", err);
    res.status(500).json({ message: "Failed to send phone OTP" }); //
  }
};

exports.verifyPhoneOtp = async (req, res) => {
  const { phone, otp, username, password, email } = req.body; //
  if (phoneOtpStore[phone] === parseInt(otp)) { //
    delete phoneOtpStore[phone]; //
    try {
      let existingUser = await User.findOne({ username }); //
      if (existingUser) return res.status(400).json({ message: "Username already exists" });
      existingUser = await User.findOne({ phone }); //
      if (existingUser) return res.status(400).json({ message: "Phone number already exists" });
      
      const hashedPassword = await bcrypt.hash(password, 10); //
      await new User({ username, password: hashedPassword, phone, email }).save(); //
      res.json({ message: "Signup successful" }); //
    } catch (error) {
      console.error("Verify Phone OTP error:", error);
      res.status(500).json({ message: "Error during signup process."});
    }
  } else {
    res.status(400).json({ message: "Invalid OTP" }); //
  }
};

exports.login = async (req, res) => {
 const { username, password } = req.body; //
  try {
    const user = await User.findOne({ username }); //
    if (!user || !(await bcrypt.compare(password, user.password))) { //
      return res.status(400).json({ message: "Invalid credentials" }); //
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" }); //
    res.json({ //
      message: "Login successful", //
      user: { //
        _id: user._id, 
        username: user.username, //
        // 'name' alias removed
        email: user.email, //
        phone: user.phone, //
        role: user.role, //
      },
      token //
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login."});
  }
};

exports.getProfile = async (req, res) => {
  const authHeader = req.headers.authorization; //
  if (!authHeader?.startsWith("Bearer ")) { //
    return res.status(401).json({ message: "No token provided" }); //
  }
  const token = authHeader.split(" ")[1]; //
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //
    const user = await User.findById(decoded.userId); //
    if (!user) return res.status(404).json({ message: "User not found" }); //
    console.log("User profile fetched successfully:", user.credits.amt); //
    res.json({ //
      user: { //
        _id: user._id,
        username: user.username, //
        // 'name' alias removed
        email: user.email, //
        phone: user.phone, //
        role: user.role, //
        credits: user.credits.amt,
        ref: user.credits.paymentReferenceNo, // Include payment reference number
         //
      }
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") { //
        return res.status(401).json({ message: "Invalid token" }); //
    } else if (err.name === "TokenExpiredError") { //
        return res.status(401).json({ message: "Token expired" }); //
    }
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" }); //
  }
};

exports.updateProfile = async (req, res) => {
  const authHeader = req.headers.authorization; //
  if (!authHeader?.startsWith("Bearer ")) { //
    return res.status(401).json({ message: "No token provided" }); //
  }
  const token = authHeader.split(" ")[1]; //
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //
    const userId = decoded.userId; //
    
    // Expect 'username' directly from frontend request body
    const { username: newUsername } = req.body; //

    if (!newUsername || typeof newUsername !== 'string' || newUsername.trim() === '') { //
        return res.status(400).json({ message: "Username is required and cannot be empty." }); //
    }

    const trimmedNewUsername = newUsername.trim();

    const existingUserWithNewUsername = await User.findOne({ username: trimmedNewUsername }); //
    if (existingUserWithNewUsername && existingUserWithNewUsername._id.toString() !== userId) { //
        return res.status(400).json({ message: "This username is already taken. Please choose a different one." }); //
    }

    const userToUpdate = await User.findById(userId); //
    if (!userToUpdate) { //
      return res.status(404).json({ message: "User not found" }); //
    }

    userToUpdate.username = trimmedNewUsername; //
    await userToUpdate.save(); //

    res.json({ //
      message: "Profile updated successfully!", //
      user: { //
        _id: userToUpdate._id,
        username: userToUpdate.username, //
         email: userToUpdate.email, //
        phone: userToUpdate.phone, //
        role: userToUpdate.role, //
      }
    });
  } catch (err) {
     if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") { //
        return res.status(401).json({ message: "Invalid or expired token." }); //
    }
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile. Please try again." }); //
  }
};