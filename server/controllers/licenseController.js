const DogLicense = require("../models/dogLicense.js");

exports.applyLicense = async (req, res) => {
  const { dogName, breed, age, vaccinationProofUrl } = req.body;
  const ownerId = req.user.id;

  const newLicense = new DogLicense({
    owner: ownerId,
    dogName,
    breed,
    age,
    vaccinationProofUrl,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  });

  await newLicense.save();
  res.status(201).json({ message: "License application submitted" });
};

exports.getUserLicenses = async (req, res) => {
  const licenses = await DogLicense.find({ owner: req.user.id });
  res.json(licenses);
};
