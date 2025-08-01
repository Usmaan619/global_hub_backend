const jwt = require("jsonwebtoken");
const { withConnection } = require("../utils/helper");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers["authorization"] || req.headers["Authorization"];
    const sessionHeader = req.headers["x-session"] || req.headers["X-Session"];

    if (!token || !sessionHeader) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token or session header missing",
      });
    }

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (err || !decoded?.id || !decoded?.role) {
        return res
          .status(604)
          .json({ success: false, message: "Forbidden: Invalid token" });
      }

      const { id, role } = decoded;

      return await withConnection(async (connection) => {
        let query = "";
        switch (role) {
          case "superadmin":
            query = "SELECT * FROM super_admins WHERE id = ?";
            break;
          case "admin":
            query = "SELECT * FROM admins WHERE id = ?";
            break;
          case "user":
            query = "SELECT * FROM users WHERE id = ?";
            break;
          default:
            return res.status(400).json({ message: "Invalid role in token" });
        }

        const [rows] = await connection.query(query, [id]);

        if (rows.length === 0) {
          return res
            .status(401)
            .json({ success: false, message: "User not found" });
        }

        const user = rows[0];

        if (!user.session || user.session !== sessionHeader) {
          return res.status(603).json({
            success: false,
            message: "Invalid session: session mismatch or expired",
          });
        }

        req.user = user;
        req.user.role = role;
        next();
      });
    });
  } catch (error) {
    console.error("Error in protect middleware:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// new
// exports.protect = (req, res, next) => {
//   try {
//     const token = req.headers["authorization"] || req.headers["Authorization"];
//     const session = req.headers["X-Session"] || req.headers["x-session"];

//     if (!token && !session) {
//       return res.json({
//         message: "Unauthorized: No token or session provided",
//       });
//     }

//     jwt.verify(token, SECRET_KEY, (err, decoded) => {
//       if (err) {
//         return res
//           .status(403)
//           .json({ success: false, message: "Forbidden: Invalid token" });
//       }

//       req.user = decoded;
//       next();
//     });
//   } catch (error) {
//     console.error("Error in authMiddleware:", error);
//     res.json({ success: false, message: error });
//   }
// };

// old
exports.protects = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.Authorization;

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
