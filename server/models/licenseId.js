const mongoose = require('mongoose');

const licenseIdSchema = new mongoose.Schema({
  seq: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.model('LicenseID', licenseIdSchema);
