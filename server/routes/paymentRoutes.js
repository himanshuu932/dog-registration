// routes/paymentRoutes.js
const express = require('express'); //
const router = express.Router(); //
const paymentController = require('../controllers/paymentController'); // Import controller

// Define Eazypay related routes
router.get('/generate-eazypay-url', paymentController.generateEazypayUrl); //
router.post('/eazypay-return', paymentController.eazypayReturn); //
router.get('/verify-eazypay-payment', paymentController.verifyEazypayPayment); //

module.exports = router; //