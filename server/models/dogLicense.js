const mongoose = require("mongoose");

const dogLicenseSchema = new mongoose.Schema(
  {
     
    license_Id: { 
      type: String,
      unique: true,
      required: true
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fullName: String,
    phoneNumber: String,
    gender: String,
    address: {
      streetName: String,
      pinCode: String,
      city: String,
      state: String,
    },
    totalHouseArea: String,
    numberOfDogs: Number,
    dog: {
      name: String,
      category: String,
      breed: String,
      color: String,
      age: String,
      sex: String,
      dateOfVaccination: Date,
      dueVaccination: Date,
      vaccinationProofUrl: String,
      avatarUrl: String,
    },
    expiryDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true 
  }
);


// Enhanced error handling for duplicate licenseIds


module.exports = mongoose.model("DogLicense", dogLicenseSchema);
