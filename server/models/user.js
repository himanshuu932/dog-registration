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
  type: Number,
  default: 0
}

});

module.exports = mongoose.model("User", userSchema);
