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

const app = express();

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// --- Middleware ---
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

// --- Eazypay Payment Integration Logic ---

// AES-128-ECB setup, key loaded from environment variables
// Ensure PG_TEST_KEY is set in your .env file (e.g., PG_TEST_KEY=1400011323305020)
const AES_KEY = Buffer.from(process.env.PG_TEST_KEY, 'ascii');

/**
 * Encrypts a string using AES-128-ECB with PKCS7 padding and returns as Base64.
 * @param {string} plain The plain text to encrypt.
 * @returns {string} The Base64 encoded encrypted string.
 */
function encryptParamRaw(plain) {
    const cipher = crypto.createCipheriv('aes-128-ecb', AES_KEY, null);
    cipher.setAutoPadding(true); // Enable PKCS#7 padding
    let encrypted = cipher.update(plain, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

/**
 * Generates the full Eazypay payment initiation URL.
 * @param {object} params Payment parameters.
 * @returns {string} The complete payment URL.
 */
function generatePaymentURL(params) {
    const BASE_URL = 'https://eazypayuat.icicibank.com/EazyPG'; // UAT environment
    const parts = [];

    // merchantid is sent in plain text
    parts.push(`merchantid=${params.merchantid}`);

    // Keys for parameters that must be encrypted
    const encryptedKeys = [
        'mandatory fields',
        'optional fields',
        'returnurl',
        'Reference No',
        'submerchantid',
        'transaction amount',
        'paymode'
    ];

    for (const [key, val] of Object.entries(params)) {
        if (key === 'merchantid') continue; // Already handled

        if (encryptedKeys.includes(key)) {
            // Encrypt the value of the parameter before adding it to the URL
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(encryptParamRaw(String(val)))}`);
        } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
        }
    }

    return `${BASE_URL}?${parts.join('&')}`;
}

// --- API Endpoint to Generate Eazypay URL ---
app.post('/api/payment/generate-url', (req, res) => {
    try {
        const { amount, referenceNo } = req.body;

        if (!amount || !referenceNo) {
            return res.status(400).json({ message: 'Amount and reference number are required.' });
        }

        // Construct payment parameters based on the request from the frontend
        const paymentParams = {
            merchantid: '142339',
            'Reference No': String(referenceNo),
            submerchantid: '45',
            'transaction amount': String(amount),
            // As per the requirement: 'Reference No|submerchantid|transaction amount|xyz|xyz|xyz'
            'mandatory fields': `${referenceNo}|45|${amount}|xyz|xyz|xyz`,
            // This is your callback URL where Eazypay will redirect the user after payment
            returnurl: 'https://dog-registration.vercel.app/',
            paymode: '9', // '9' for all available payment modes
            'optional fields': '',
        };

        const eazypayUrl = generatePaymentURL(paymentParams);
        console.log('Generated Eazypay URL:', eazypayUrl);
        // Send the generated URL back to the frontend
        res.json({ url: eazypayUrl });

    } catch (error) {
        console.error('Error generating Eazypay URL:', error);
        res.status(500).json({ message: 'Failed to generate payment URL.' });
    }
});


// --- Application Routes ---
app.use('/api/captcha', captchaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/license", licenseRoutes);
app.use("/api/admin", adminRoutes);
app.get('/health-check-polling', (req, res) => {
  res.status(200).send('OK');
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));