// models/dogLicense.js

const mongoose = require("mongoose");

const dogLicenseSchema = new mongoose.Schema(
  {
    fees: {
      total: { type: Number, default: 0 },
      fine: { type: Number, default: 0 },
      paid: { type: Boolean, default: false },
      paymentDate: { type: Date, default: null },
      creditsUsed: { type: Boolean, default: false },
      cPaid: { type: Number, default: 0 }
    },

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
      vaccinationProofPublicId: String, // Added this field from your original code
      avatarUrl: String,
    },
    expiryDate: Date,
    renewalRequestDate: Date, // To track when a renewal process was started
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'renewal_pending', 'payment_processing', 'renewal_payment_processing'],
      default: 'pending',
    },
    rejectionReason: String,
    rejectionDate: Date,


    paymentReferenceNo: { type: String  },
    lastpaymentReferenceNo: { type: String},
    eazypayUniqueRefNo: String,
    eazypayPaymentMode: String,
    eazypayTransactionDate: String,
    eazypayTransactionAmount: String,
    eazypayTransactionId: String,
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("DogLicense", dogLicenseSchema);