const mongoose = require("mongoose");

const dogLicenseSchema = new mongoose.Schema({
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
    vaccinationProofUrl: String
  },
  expiryDate: Date
});

module.exports = mongoose.model("DogLicense", dogLicenseSchema);
