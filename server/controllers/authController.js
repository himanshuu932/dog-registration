const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

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
    res.status(500).json({ message: "Failed to send email OTP" });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  const { email, otp, username, password, phone } = req.body;
  if (emailOtpStore[email] === parseInt(otp)) {
    delete emailOtpStore[email];
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ username, password: hashedPassword, email, phone }).save();
    res.json({ message: "Signup successful" });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
};

exports.sendPhoneOtp = async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  try {
    await twilioClient.messages.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: `Your OTP is: ${otp}`,
    });
    phoneOtpStore[phone] = otp;
    setTimeout(() => delete phoneOtpStore[phone], 600000);
    res.json({ message: "OTP sent to phone" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send phone OTP" });
  }
};

exports.verifyPhoneOtp = async (req, res) => {
  const { phone, otp, username, password } = req.body;
  if (phoneOtpStore[phone] === parseInt(otp)) {
    delete phoneOtpStore[phone];
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ username, password: hashedPassword, phone }).save();
    res.json({ message: "Signup successful" });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
};

exports.login = async (req, res) => {
 console.log(req.body);

  const { username, password } = req.body;
  console.log(username, password);
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ message: "Login successful", user: { username: user.username, email: user.email, phone: user.phone, role: user.role,  },token });
};

exports.getProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: { username: user.username, email: user.email, phone: user.phone } });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
