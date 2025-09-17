// had to delete authMiddleware
// my blood sweat and tears into it </3... and possibly other bodily fluids

const jwt = require("jsonwebtoken");

exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.requireTeacher = (req, res, next) => {
  if (!req.user || req.user.role !== "teacher") {
    return res.status(403).json({ error: "Teacher access only" });
  }
  next();
};

exports.requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== "student") {
    return res.status(403).json({ error: "Student access only" });
  }
  next();
};
