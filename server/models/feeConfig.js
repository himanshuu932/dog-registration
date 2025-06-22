// models/feeConfig.js
const mongoose = require("mongoose");

const feeConfigSchema = new mongoose.Schema({
  // Using a singleton pattern with a fixed identifier
  identifier: {
    type: String,
    default: 'master-fees',
    unique: true,
  },
  newRegistrationFee: {
    type: Number,
    required: [true, "New registration fee is required."],
    default: 200,
  },
  renewalFee: {
    type: Number,
    required: [true, "Renewal fee is required."],
    default: 100,
  },
}, {
  timestamps: true // To know when the fees were last updated
});

// Helper to get the current fees, creating them if they don't exist
feeConfigSchema.statics.getFees = async function() {
  let fees = await this.findOne({ identifier: 'master-fees' });
  if (!fees) {
    // If no config exists, create one with default values
    fees = await this.create({ identifier: 'master-fees' });
  }
  return fees;
};


module.exports = mongoose.model("FeeConfig", feeConfigSchema);
