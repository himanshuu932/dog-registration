const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  phone: String,
  email: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  credits: {
    amt: Number
   }
});

module.exports = mongoose.model("User", userSchema);
