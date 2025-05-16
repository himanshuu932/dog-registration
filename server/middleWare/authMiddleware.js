const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
 // console.log("Reached verifyToken middleware");
  const authHeader = req.headers.authorization;
  // console.log("Authorization Header:", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   // console.log("this is decoded: "+decoded.userId);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
