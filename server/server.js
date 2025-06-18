const express = require("express");
const mongoose =require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const crypto = require('crypto'); // Import crypto for encryption

const authRoutes = require("./routes/authRoutes.js");
const licenseRoutes = require("./routes/licenseRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const captchaRoutes = require('./routes/captchaRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const app = express();

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// --- Middleware ---
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// --- Application Routes ---
app.use('/api/captcha', captchaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/license", licenseRoutes);
app.use("/api/admin", adminRoutes);
app.use('/', paymentRoutes);

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/health-check-polling', (req, res) => {
  res.status(200).send('OK');
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)
    setInterval(() => {
  fetch('https://dog-registration-yl8x.onrender.com/ping')
    .then(() => console.log('Pinged self!'))
    .catch(() => console.log('Self ping failed.'));
}, 1000 * 60 * 10);});