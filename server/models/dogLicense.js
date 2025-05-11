const mongoose = require("mongoose");

const dogLicenseSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dogName: String,
  breed: String,
  age: Number,
  vaccinationProofUrl: String,
  issuedDate: { type: Date, default: Date.now },
  expiryDate: Date,
  status: { type: String, default: "Pending" } // Pending, Approved, Rejected
});

module.exports = mongoose.model("DogLicense", dogLicenseSchema);
