const { withConnection } = require("../utils/helper");

/**
 *  Middleware: Check Portal Lock Status
 * Ensures that:
 * - Admins cannot access routes if locked.
 * - Users cannot access routes if they or their admin are locked.
 * - Uses withConnection() for clean DB handling.
 */
exports.checkPortalLock = async (req, res, next) => {
  try {
    const { role, id } = req.user || {}; // e.g. decoded JWT: { id, role }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "User role  missing in request.",
      });
    }

    if (role === "superadmin") return next();
    if (!role || !id) {
      return res.status(400).json({
        success: false,
        message: "User role or ID missing in request.",
      });
    }

    await withConnection(async (connection) => {
      //  Case 1: Admin
      if (role === "admin") {
        const [adminRows] = await connection.query(
          "SELECT is_locked FROM admins WHERE id = ?",
          [id]
        );

        if (adminRows.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Admin not found." });
        }

        if (adminRows[0].is_locked === 1) {
          return res.status(403).json({
            success: false,
            message: "Admin portal is locked.",
          });
        }

        return next();
      }

      //  Case 2: User
      if (role === "user") {
        const [userRows] = await connection.query(
          "SELECT is_locked, admin_id FROM users WHERE id = ?",
          [id]
        );

        if (userRows.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "User not found." });
        }

        const user = userRows[0];

        // Check if user itself is locked
        if (user.is_locked === 1) {
          return res.status(403).json({
            success: false,
            message: "User account is locked.",
          });
        }

        // Check if user's admin is locked
        if (user.admin_id) {
          const [adminRows] = await connection.query(
            "SELECT is_locked FROM admins WHERE id = ?",
            [user.admin_id]
          );

          if (adminRows.length > 0 && adminRows[0].is_locked === 1) {
            return res.status(403).json({
              success: false,
              message: "Access denied — your admin has locked the portal.",
            });
          }
        }

        return next();
      }

      //  Case 3: Unknown role
      return res
        .status(400)
        .json({ success: false, message: "Invalid user role." });
    });
  } catch (err) {
    console.error(" Lock Check Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.middleware lock check failed.",
    });
  }
};
