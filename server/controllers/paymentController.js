// controllers/paymentController.js
const crypto = require('crypto');
const DogLicense = require("../models/dogLicense"); // Import the DogLicense model
const { request } = require('http');

const refNoStore = new Map(); 

const ERROR_CODE_MAP = {
    E000: 'Transaction successful',
    E001: 'Unauthorized Payment Mode',
    E002: 'Unauthorized Key',
    E003: 'Unauthorized Packet',
    E004: 'Unauthorized Merchant',
    E005: 'Unauthorized Return URL',
    E006: 'Transaction is already paid',
    E007: 'Transaction Failed',
    E008: 'Failure from Third Party',
    E009: 'Bill Already Expired',
};

const AES_KEY = Buffer.from(process.env.PG_TEST_KEY, 'ascii'); // 16 bytes

function encryptParamRaw(plain) {
    const cipher = crypto.createCipheriv('aes-128-ecb', AES_KEY, null);
    cipher.setAutoPadding(true);
    let encrypted = cipher.update(plain, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

// Export generatePaymentURL so it can be used by licenseController
function generateRSHash(body) {
    const parts = [
        body.ID, body['Response Code'], body['Unique Ref Number'],
        body['Service Tax Amount'], body['Processing Fee Amount'],
        body['Total Amount'], body['Transaction Amount'], body['Transaction Date'],
        body['Interchange Value'] || '', body.TDR || '', body['Payment Mode'],
        body.SubMerchantId, body.ReferenceNo, body.TPS, process.env.PG_TEST_KEY
    ];
    const concatenated = parts.join('|');
    const hash = crypto.createHash('sha512').update(concatenated, 'utf8').digest('hex');
    return { concatenated, hash };
}

exports.generatePaymentURL = (params) => {
    const BASE = 'https://eazypayuat.icicibank.com/EazyPG';
    let parts = [`merchantid=${params.merchantid}`];
    const encryptedKeys = [
        'mandatory fields', 'optional fields', 'returnurl',
        'Reference No', 'submerchantid', 'transaction amount', 'paymode'
    ];

    for (const [key, val] of Object.entries(params)) {
        if (key === 'merchantid') continue;
        if (encryptedKeys.includes(key)) {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(encryptParamRaw(val))}`);
        } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
        }
    }
    return `${BASE}?${parts.join('&')}`;
};

// --- Modified eazypayReturn to handle both New and Renewal payments ---
exports.eazypayReturn = async (req, res) => {
    console.log('\n📥 Payment callback received:');
    const { concatenated, hash } = generateRSHash(req.body);
    console.log( req.body);
    const receivedRS = (req.body.RS || '').toLowerCase();
    const signatureMatches = hash === receivedRS;
    const code = req.body['Response Code'];
    const message = ERROR_CODE_MAP[code] || 'Unknown response code';

    console.log(`Signature Match: ${signatureMatches}, Response Code: ${code} (${message})`);

    const respondToUser = (status) => {
        const title = status === 'success' ? 'Payment Complete' : 'Payment Failed';	
        const bodyText = status === 'success' 
            ? 'Payment successful. You can close this window.' 
            : 'Payment failed. Please try again. You may close this window.';
        
        res.send(`
            <!DOCTYPE html><html><head><title>${title}</title></head>
            <body>
                <p>${bodyText}</p>
                <script>
                    setTimeout(() => { window.close(); }, 3000);
                    setTimeout(() => { if (!window.closed) { window.location.href = '/'; } }, 3500);
                </script>
            </body></html>
        `);
    };

    if (!signatureMatches) {
        console.warn('❌ Signature Mismatch. Transaction ignored.');
        return respondToUser('failure');
    }

    const license = await DogLicense.findOne({ paymentReferenceNo: req.body.ReferenceNo });
    if (!license) {
        console.warn(`License not found for reference: ${req.body.ReferenceNo}`);
        return respondToUser('failure');
    }

    if (code === 'E000') { 
        console.log('🎉 SUCCESS:', message);
        try {
            license.fees.paid = true;
            license.fees.paymentDate = new Date();
            license.eazypayUniqueRefNo = req.body['Unique Ref Number'];
            license.eazypayPaymentMode = req.body['Payment Mode'];
            license.eazypayTransactionDate = req.body['Transaction Date'];
            license.eazypayTransactionAmount = req.body['Transaction Amount'];
            license.eazypayTransactionId = req.body['Unique Ref Number'];

            if (license.status === 'payment_processing') {
                license.status = 'pending'; // New application moves to pending review
                console.log(`New License ${license.license_Id} updated to 'pending'.`);
            } else if (license.status === 'renewal_payment_processing') {
                license.status = 'renewal_pending'; // Renewal moves to pending approval
            }
            
            await license.save();
            respondToUser('success');
        } catch (updateError) {
            console.error("Error updating license after successful payment:", updateError);
            respondToUser('failure');
        }
    } else { // Failed Payment
        console.warn('❌ FAILURE:', message);
        try {
            if (license.status === 'payment_processing') {
                license.status = 'rejected';
                license.rejectionReason = `Payment failed: ${message}`;
                license.rejectionDate = new Date();
                console.log(`New License ${license.license_Id} marked as 'rejected'.`);
            } else if (license.status === 'renewal_payment_processing') {
                license.status = 'approved'; // Revert to approved status on renewal failure
                license.rejectionReason = `Renewal payment failed: ${message}`; // Can be shown to user later
                console.log(`Renewing License ${license.license_Id} reverted to 'approved'.`);
            }

            await license.save();
            respondToUser('failure');
        } catch (failUpdateError) {
            console.error("Error updating license after failed payment:", failUpdateError);
            respondToUser('failure');
        }
    }
};

exports.verifyEazypayPayment = async (req, res) => {
    const { pgreferenceno } = req.query;

    if (!pgreferenceno) {
        return res.status(400).json({ error: 'Invalid or unknown reference number' });
    }

    const VERIFY_BASE_URL = 'https://eazypayuat.icicibank.com/EazyPGVerify';
    const query = new URLSearchParams({
        merchantid: process.env.EAZYPAY_MERCHANT_ID, // Use env var
        pgreferenceno,
        dstatus: 'Y'
    });

    const verifyUrl = `${VERIFY_BASE_URL}?${query.toString()}`;

    try {
        res.send(verifyUrl);
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).send('Verification failed');
    }
};
exports.generateEazypayUrl = (req, res) => {
    try {
        const uniqueRefNo = `REF${Date.now()}`;
        const params = {
            merchantid: process.env.EAZYPAY_MERCHANT_ID, // Use env var
            'mandatory fields': `${uniqueRefNo}|45|0.01|xyz|xyz|xyz`,
            'optional fields': '',
            returnurl: process.env.EAZYPAY_RETURN_URL, // Use env var
            'Reference No': uniqueRefNo,
            submerchantid: '45',
            'transaction amount': '0.01',
            paymode: '9'
        };

        refNoStore.set(uniqueRefNo, true); // Save for validation (consider database for production)

        const eazypayUrl = exports.generatePaymentURL(params); // Use the exported function
        console.log('Generated Eazypay URL:', eazypayUrl);
        res.json({ url: eazypayUrl, reference: uniqueRefNo });
    } catch (error) {
        console.error('Error generating URL:', error);
        res.status(500).send('Failed to generate Eazypay URL.');
    }
};