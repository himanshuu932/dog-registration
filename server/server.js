const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes.js");
const licenseRoutes = require("./routes/licenseRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/license", licenseRoutes);
app.use("/api/admin", adminRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
