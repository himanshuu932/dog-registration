const DogLicense = require("../models/dogLicense.js");

// Extend dogLicense model (assumed) and controller:
exports.applyLicense = async (req, res) => {
  try {
    const {
      fullName, phoneNumber, gender, streetName, pinCode, city, state, totalHouseArea, numberOfDogs,
      dogName, dogCategory, dogBreed, dogColor, dogAge, dogSex,
      dateOfVaccination, dueVaccination, vaccinationProofUrl
    } = req.body;

    const ownerId = req.user.id;

    const newLicense = new DogLicense({
      owner: ownerId,
      fullName,
      phoneNumber,
      gender,
      address: { streetName, pinCode, city, state },
      totalHouseArea,
      numberOfDogs,
      dog: {
        name: dogName,
        category: dogCategory,
        breed: dogBreed,
        color: dogColor,
        age: dogAge,
        sex: dogSex,
        dateOfVaccination,
        dueVaccination,
        vaccinationProofUrl
      },
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'pending'
    });

    await newLicense.save();
    res.status(201).json({ message: "License application submitted" });
  } catch (error) {
    console.error("License apply error:", error);
    res.status(500).json({ message: "Server error while applying license" });
  }
};


exports.getUserLicenses = async (req, res) => {
  const licenses = await DogLicense.find({ owner: req.user.id });
  res.json(licenses);
};
