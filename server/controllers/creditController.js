// controllers/creditController.js
const User = require('../models/user');
const DogLicense = require('../models/dogLicense');

const getCredits = async (req, res) => {
    
  try {
    const user = await User.findById(req.user.userId);
    res.json({ credits: user?.credits || 0 });
   
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const useCredits = async (req, res) => {
  try {
    const { licenseId, amount } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user || user.credits < amount) {
      return res.status(400).json({ error: 'Not enough credits' });
    }

    user.credits -= amount;
    await user.save();

    const license = await DogLicense.findById(licenseId);
    if (license) {
      license.fees.paid = true;
      license.fees.paymentDate = new Date();
      license.status = 'pending';
      await license.save();
    }

    res.json({ message: 'Credit used successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getCredits,
  useCredits
};