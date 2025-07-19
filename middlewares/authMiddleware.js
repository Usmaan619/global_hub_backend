const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

exports.authMiddleware = (req, res, next) => {
  try {
    const token = req.headers["authorization"] || req.headers["Authorization"];

    if (!token) {
      return res.json({ message: "Unauthorized: No token provided" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.json({ message: error });
  }
};

const jwt = require("jsonwebtoken");

exports.protect = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden: Role not allowed" });
      }

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
