const mongoose = require("mongoose");

const dogLicenseSchema = new mongoose.Schema(
  {
        isProvisional: {
      type: Boolean,
      default: false
    },
      provisionalExpiryDate: Date,
    animalType: {
      type: String,
      enum: ['Dog', 'Cat', 'Rabbit'],
      required: true,
    },
     
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
    numberOfAnimals: Number,
    pet: {
      name: String,
      category: String,
      breed: String,
      color: String,
      age: String,
      sex: String,
       isVaccinated: String,
      dateOfVaccination: Date,
      dueVaccination: Date,
      vaccinationProofUrl: String,
      avatarUrl: String,
    },
    expiryDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected','renewal_pending'],
      default: 'pending',
    },
     rejectionReason: String,  
    rejectionDate: Date,     
  },
  {
    timestamps: true 
  }
);




module.exports = mongoose.model("DogLicense", dogLicenseSchema);
