// controllers/paymentController.js
const crypto = require('crypto');
const DogLicense = require("../models/dogLicense"); // Import the DogLicense model
const { request } = require('http');
const User = require("../models/user"); // Import the User model
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

// Helper function to fetch and populate transaction details from Eazypay Verify API
async function fetchAndPopulateTransactionDetails(pgreferenceno) {
    console.log(`Fetching transaction details for reference: ${pgreferenceno}`);
    const params = new URLSearchParams({
        merchantid: process.env.EAZYPAY_MERCHANT_ID,
        pgreferenceno,
        dstatus: 'Y',
    });
    const VERIFY_BASE_URL = 'https://eazypayuat.icicibank.com/EazyPGVerify';
    const verifyUrl = `${VERIFY_BASE_URL}?${params.toString()}`;

    const response = await fetch(verifyUrl);
    if (!response.ok) {
        throw new Error(`Eazypay verification failed with status ${response.status}`);
    }
    const text = await response.text();
    const result = {};
    new URLSearchParams(text).forEach((value, key) => {
        result[key] = value;
    });
    return result;
}


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

    const isRenewal = !!license.renewalRequestDate; // Determine if it's a renewal

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
            license.lastpaymentReferenceNo = license.paymentReferenceNo; 
            if(license.fees.creditsUsed)
            {
                const user = await User.findById(license.owner);
                if (user) {
                    user.credits.amt -= license.fees.cPaid;
                    await user.save();
                    console.log(`Credits deducted from user ${user.username} for license ${license.license_Id}.`);
                }
            }

            if (license.status === 'payment_processing') {
                license.status = 'pending'; // New application moves to pending review
                console.log(`New License ${license.license_Id} updated to 'pending'.`);
            } else if (license.status === 'renewal_payment_processing') {
                license.status = 'renewal_pending'; // Renewal moves to pending approval
                console.log(`Renewal License ${license.license_Id} updated to 'renewal_pending'.`);
            }

            await license.save();
            respondToUser('success');
        } catch (updateError) {
            console.error("Error updating license after successful payment:", updateError);
            respondToUser('failure');
        }
    } else { 
        console.warn('❌ FAILURE:', message);
        try {
            if (license.status === 'payment_processing') {
                license.status = 'rejected';
                license.rejectionReason = `Payment failed: ${message}`;
                license.rejectionDate = new Date();
                console.log(`New License ${license.license_Id} marked as 'rejected'.`);
            } else if (license.status === 'renewal_payment_processing') {
                license.status = 'approved'; 
                license.rejectionReason = `Renewal payment failed: ${message}`;
                license.lastpaymentReferenceNo = license.paymentReferenceNo; // Copy current ref to last ref
                console.log(`Renewing License ${license.license_Id} reverted to 'approved'.`);

                
                if (license.lastpaymentReferenceNo) {
                    try {
                        const lastTransactionDetails = await fetchAndPopulateTransactionDetails(license.lastpaymentReferenceNo);
                        license.eazypayUniqueRefNo = lastTransactionDetails.ezpaytranid || license.eazypayUniqueRefNo;
                        license.eazypayPaymentMode = lastTransactionDetails.PaymentMode || license.eazypayPaymentMode;
                        license.eazypayTransactionDate = lastTransactionDetails.trandate || license.eazypayTransactionDate;
                        license.eazypayTransactionAmount = lastTransactionDetails.amount || license.eazypayTransactionAmount;
                        license.eazypayTransactionId = lastTransactionDetails.ezpaytranid || license.eazypayTransactionId;
                        console.log(`Fetched and updated last transaction details for ${license.license_Id}.`);
                    } catch (fetchError) {
                        console.error(`Error fetching last transaction details for ${license.license_Id}:`, fetchError);
                    }
                }
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
  try {
    const { pgreferenceno } = req.query;
    if (!pgreferenceno) {
      return res.status(400).json({ error: 'Invalid or missing reference number' });
    }

    // 1) Call ICICI Verify endpoint
    const result = await fetchAndPopulateTransactionDetails(pgreferenceno);
    console.log('Parsed verification result:', result);

    // 2) Determine simple state
    let paymentState;
    if (result.status === 'Success') {
      paymentState = 'success';
    } else if (result.status === 'RIP' || result.status === 'SIP') {
      paymentState = 'processing';
    } else {
      paymentState = 'failed';
    }

    // 3) Fetch the license record
    const license = await DogLicense.findOne({ paymentReferenceNo: pgreferenceno });
    if (!license) {
      return res.status(404).json({ error: 'License not found for that reference' });
    }

    // 4) Are we handling a renewal?
    const isRenewal = !!license.renewalRequestDate;

    switch (paymentState) {
      case 'success':
        license.fees.paid = true;
        license.fees.paymentDate = new Date();
        license.eazypayUniqueRefNo = result.ezpaytranid;
        license.eazypayPaymentMode = result.PaymentMode;
        license.eazypayTransactionDate = result.trandate;
        license.eazypayTransactionAmount = result.amount;
        license.eazypayTransactionId = result.ezpaytranid;
        license.lastpaymentReferenceNo = license.paymentReferenceNo; 
        if (license.fees.creditsUsed) {
          const user = await User.findById(license.owner);
            if (user) {
                user.credits.amt -= license.fees.cPaid;
                await user.save();
                console.log(`Credits deducted from user ${user.username} for license ${license.license_Id
}.`);
            }   
        }
        license.status = isRenewal ? 'renewal_pending' : 'pending';
        console.log(`License ${license.license_Id} updated to '${license.status}' after successful verification.`);
        break;

      case 'processing':
        license.status = isRenewal
          ? 'renewal_payment_processing'
          : 'payment_processing';
        console.log(`License ${license.license_Id} updated to '${license.status}' after processing verification.`);
        break;

      case 'failed':
      default:
        license.status = isRenewal ? 'approved' : 'rejected'; // Revert to approved for failed renewal
        license.rejectionDate = new Date();
        license.rejectionReason = `Payment verification failed: ${result.status}`;
        console.log(`License ${license.license_Id} updated to '${license.status}' after failed verification.`);
        license.paymentReferenceNo = license.lastpaymentReferenceNo; 
        if (isRenewal && license.lastpaymentReferenceNo) {
             try {
                const lastTransactionDetails = await fetchAndPopulateTransactionDetails(license.lastpaymentReferenceNo);
                console.log('Fetched last transaction details:', lastTransactionDetails);
                license.eazypayUniqueRefNo = lastTransactionDetails.ezpaytranid || license.eazypayUniqueRefNo;
                license.eazypayPaymentMode = lastTransactionDetails.PaymentMode || license.eazypayPaymentMode;
                license.eazypayTransactionDate = lastTransactionDetails.trandate || license.eazypayTransactionDate;
                license.eazypayTransactionAmount = lastTransactionDetails.amount || license.eazypayTransactionAmount;
                license.eazypayTransactionId = lastTransactionDetails.ezpaytranid || license.eazypayTransactionId;
                console.log(`Fetched and updated last transaction details for ${license.license_Id} on failed renewal verification.`);
            } catch (fetchError) {
                console.error(`Error fetching last transaction details for ${license.license_Id} on failed renewal verification:`, fetchError);
            }
        }
        break;
    }
     console.log('License status before saving:', license);
    await license.save();
    console.log(isRenewal ? 'Renewal' : 'New', 'License status updated:', license.status);
    console.log(`License ${license.license_Id} updated to '${license.status}' after verification.`);
  
    return res.json({ state: paymentState });
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(500).json({ error: 'Verification failed', details: err.message });
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