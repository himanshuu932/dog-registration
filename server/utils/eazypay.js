const crypto = require('crypto');

const AES_KEY = Buffer.from(process.env.PG_TEST_KEY, 'ascii'); // 16 bytes

function encryptParamRaw(plain) {
    const cipher = crypto.createCipheriv('aes-128-ecb', AES_KEY, null);
    cipher.setAutoPadding(true);
    let encrypted = cipher.update(plain, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

function generatePaymentURL(params) {
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
}


function generateRSHash(body) {
    // Eazypay’s spec says RS = SHA512 of:
    // ID|Response Code|Unique Ref Number|Service Tax Amount|Processing Fee Amount|
    // Total Amount|Transaction Amount|Transaction Date|Interchange Value|TDR|
    // Payment Mode|SubMerchantId|ReferenceNo|TPS|aes_key

    const parts = [
        body.ID,
        body['Response Code'],
        body['Unique Ref Number'],
        body['Service Tax Amount'],
        body['Processing Fee Amount'],
        body['Total Amount'],
        body['Transaction Amount'],
        body['Transaction Date'],
        body['Interchange Value'] || '',
        body.TDR || '',
        body['Payment Mode'],
        body.SubMerchantId,
        body.ReferenceNo,
        body.TPS,
        process.env.PG_TEST_KEY
    ];

    const concatenated = parts.join('|');
    const hash = crypto.createHash('sha512')
        .update(concatenated, 'utf8')
        .digest('hex');

    return { concatenated, hash };
}

module.exports = {
    encryptParamRaw,
    generatePaymentURL,
    generateRSHash
};
