const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  phone: String,
  email: String,
});

module.exports = mongoose.model("User", userSchema);
