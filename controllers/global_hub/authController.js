const bcrypt = require("bcrypt");
const authModel = require("../../model/global_hub/authModel");
const moment = require("moment");
const { generateToken, withConnection } = require("../../utils/helper");
const jwt = require("jsonwebtoken");

const { v4: uuidv4 } = require("uuid");

const loginHandler = (role, table) => async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await authModel.login(table, username);

    if (!user) return res.status(401).json({ message: `${role} not found` });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user.id, role);

    return res.json({ message: `${role} logged in`, token });
  } catch (error) {
    console.error(`Login Error [${role}]:`, error, moment().format());
    return res.status(500).json({ message: "Login failed" });
  }
};

const registerHandler = (role, table) => async (req, res) => {
  try {
    const id = await authModel.register(table, req.body);
    return res.status(201).json({ message: `${role} registered`, id });
  } catch (error) {
    console.error(`Register Error [${role}]:`, error, moment().format());
    return res.status(500).json({ message: "Register failed" });
  }
};

exports.superAdminRegister = registerHandler("Super Admin", "super_admins");
exports.superAdminLogin = loginHandler("Super Admin", "super_admins");

exports.adminRegister = registerHandler("Admin", "admins");
exports.adminLogin = loginHandler("Admin", "admins");

exports.userRegister = registerHandler("User", "users");
exports.userLogin = loginHandler("User", "users");

const roles = [
  { role: "superadmin", table: "super_admins", hash: true },
  { role: "admin", table: "admins", hash: false },
  { role: "user", table: "users", hash: false },
];

exports.loginAutoDetect = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  try {
    let matchedUser = null;
    let detectedRole = null;
    const session = uuidv4();

    for (const { role, table, hash } of roles) {
      const user = await withConnection(async (conn) => {
        const query = `SELECT * FROM ${table} WHERE username = ?`;
        const [rows] = await conn.execute(query, [username]);
        return rows[0];
      });

      if (user) {
        const valid = hash
          ? await bcrypt.compare(password, user.password)
          : password === user.password;

        if (valid) {
          matchedUser = user;
          detectedRole = role;

          const update = await withConnection(async (conn) => {
            /**
             * Update session for the user in the database
             * @param {string} table - The table name where the user is stored
             * @param {string} username - The username of the user
             * @returns {Promise<Object>} - The updated user object
             */

            const query = `UPDATE ${table} SET session = ? WHERE username = ?`;
            const [result] = await conn.execute(query, [session, username]);
            return result?.affectedRows > 0 ? { ...user, session } : null;
          });

          break; // stop at first valid match
        }
      }
    }

    if (!matchedUser) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: matchedUser.id, role: detectedRole },
      process.env.JWT_SECRET,
      { expiresIn: "1day" }
    );

    res.json({
      success: true,
      message: "Login successful",
      role: detectedRole,
      user: matchedUser,
      token,
      session,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// exports.registerAutoDetect = async (req, res) => {
//   const { role, name, username, password, admin_id } = req.body;

//   if (!role || !name || !username || !password)
//     return res.status(400).json({ message: "Missing required fields" });

//   const validRoles = {
//     superadmin: { table: "super_admins", hash: true },
//     admin: { table: "admins", hash: false },
//     user: { table: "users", hash: false },
//   };

//   const config = validRoles[role];
//   if (!config) return res.status(400).json({ message: "Invalid role" });

//   try {
//     const existing = await withConnection(async (conn) => {
//       const [rows] = await conn.execute(
//         `SELECT id FROM ${config.table} WHERE username = ?`,
//         [username]
//       );
//       return rows.length > 0;
//     });

//     if (existing)
//       return res.status(409).json({ message: "Username already exists" });

//     const finalPassword = config.hash
//       ? await bcrypt.hash(password, 10)
//       : password;

//     const result = await withConnection(async (conn) => {
//       const fields = ["name", "username", "password"];
//       const values = [name, username, finalPassword];

//       if (role === "user") {
//         fields.push("admin_id");
//         values.push(admin_id);
//       }

//       const query = `INSERT INTO ${config.table} (${fields.join(
//         ", "
//       )}) VALUES (${fields.map(() => "?").join(", ")})`;

//       const [res] = await conn.execute(query, values);
//       return res.insertId;
//     });

//     res.status(201).json({
//       message: `${role} registered successfully`,
//       id: result,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.registerAutoDetect = async (req, res) => {
//   const { role, name, username, password, admin_id, user_limit, created_by } =
//     req.body;

//   // Check required fields
//   if (!role || !name || !username || !password) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   // Define valid roles and their table info
//   const validRoles = {
//     superadmin: { table: "super_admins", hash: true },
//     admin: { table: "admins", hash: false },
//     user: { table: "users", hash: false },
//   };

//   const config = validRoles[role];
//   if (!config) {
//     return res.status(400).json({ message: "Invalid role" });
//   }

//   try {
//     // Check if username already exists
//     const existing = await withConnection(async (conn) => {
//       const [rows] = await conn.execute(
//         `SELECT id FROM ${config.table} WHERE username = ?`,
//         [username]
//       );
//       return rows.length > 0;
//     });

//     if (existing) {
//       return res.status(409).json({ message: "Username already exists" });
//     }

//     // Hash password if required
//     // const finalPassword = config.hash
//     //   ? await bcrypt.hash(password, 10)
//     //   : password;

//     // Insert into correct table
//     const result = await withConnection(async (conn) => {
//       const fields = ["name", "username", "password"];
//       const values = [name, username, password];

//       if (role === "user") {
//         fields.push("admin_id");
//         fields.push("created_by");

//         values.push(admin_id);
//         values.push(created_by);
//       } else if (role === "admin") {
//         fields.push("user_limit");
//         fields.push("created_by");

//         values.push(user_limit); // Default user_limit to 100 if not provided
//         values.push(created_by);
//       }

//       const query = `INSERT INTO ${config.table} (${fields.join(
//         ", "
//       )}) VALUES (${fields.map(() => "?").join(", ")})`;
//       const [res] = await conn.execute(query, values);
//       return res.insertId;
//     });

//     res.status(201).json({
//       message: `${role} registered successfully`,
//       success: true,
//       id: result,
//     });
//   } catch (err) {
//     console.error(err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };

// exports.registerAutoDetect = async (req, res) => {
//   const { role, name, username, password, admin_id, user_limit, created_by } =
//     req.body;

//   if (!role || !name || !username || !password) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   const validRoles = {
//     superadmin: { table: "super_admins", hash: true },
//     admin: { table: "admins", hash: false },
//     user: { table: "users", hash: false },
//   };

//   const config = validRoles[role];
//   if (!config) {
//     return res.status(400).json({ message: "Invalid role" });
//   }

//   try {
//     const existing = await withConnection(async (conn) => {
//       const [rows] = await conn.execute(
//         `SELECT id FROM ${config.table} WHERE username = ?`,
//         [username]
//       );
//       return rows.length > 0;
//     });

//     if (existing) {
//       return res
//         .status(409)
//         .json({ success: false, message: "Username already exists" });
//     }

//     // User limit check for "user" role
//     if (role === "user") {
//       const userLimitCheck = await withConnection(async (conn) => {
//         const [userRows] = await conn.execute(
//           `SELECT COUNT(*) AS total FROM users WHERE admin_id = ?`,
//           [admin_id]
//         );
//         const [adminRows] = await conn.execute(
//           `SELECT user_limit FROM admins WHERE id = ?`,
//           [admin_id]
//         );

//         if (adminRows.length === 0) {
//           throw new Error("Admin not found");
//         }

//         const currentUsers = userRows[0].total;
//         const limit = adminRows[0].user_limit;

//         if (currentUsers >= limit) {
//           return false; // Exceeded
//         }

//         return true;
//       });

//       if (!userLimitCheck) {
//         return res
//           .status(403)
//           .json({ message: "User creation limit exceeded for this admin" });
//       }
//     }

//     // Insert new record
//     const result = await withConnection(async (conn) => {
//       const fields = ["name", "username", "password"];
//       const values = [name, username, password];

//       if (role === "user") {
//         fields.push("admin_id", "created_by");
//         values.push(admin_id, created_by);
//       } else if (role === "admin") {
//         fields.push("user_limit", "created_by");
//         values.push(user_limit, created_by);
//       }

//       const query = `INSERT INTO ${config.table} (${fields.join(
//         ", "
//       )}) VALUES (${fields.map(() => "?").join(", ")})`;
//       const [res] = await conn.execute(query, values);
//       return res.insertId;
//     });

//     res.status(201).json({
//       message: `${role} registered successfully`,
//       success: true,
//       id: result,
//     });
//   } catch (err) {
//     console.error("Error in registerAutoDetect:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// };

exports.registerAutoDetect = async (req, res) => {
  const { role, name, username, password, admin_id, user_limit, created_by } =
    req.body;

  // Step 1: Validate required fields
  if (!role || !name || !username || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Step 2: Map role to table and password hashing config
  const validRoles = {
    superadmin: { table: "super_admins", hash: true },
    admin: { table: "admins", hash: false },
    user: { table: "users", hash: false },
  };

  const config = validRoles[role];
  if (!config) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    // Step 3: Check if username already exists
    const existing = await withConnection(async (conn) => {
      const [rows] = await conn.execute(
        `SELECT id FROM ${config.table} WHERE username = ?`,
        [username]
      );
      return rows.length > 0;
    });

    if (existing) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Step 4: (Optional) Hash password if needed
    // const finalPassword = config.hash
    //   ? await bcrypt.hash(password, 10)
    //   : password;

    const finalPassword = password; // Use this if you're not hashing

    // Step 5: Build insert fields and values
    const fields = ["name", "username", "password"];
    const values = [name, username, finalPassword];

    if (role === "user") {
      // Check user limit only if admin_id is provided
      if (admin_id) {
        if (created_by === "admin") {
          // Created by admin → check user_limit
          const limitReached = await withConnection(async (conn) => {
            const [[adminData]] = await conn.execute(
              `SELECT user_limit FROM admins WHERE id = ?`,
              [admin_id]
            );

            if (!adminData) {
              throw new Error("Admin not found");
            }

            const [[{ user_count }]] = await conn.execute(
              `SELECT COUNT(*) AS user_count FROM users WHERE admin_id = ?`,
              [admin_id]
            );

            return user_count >= adminData.user_limit;
          });

          if (limitReached) {
            return res.status(403).json({
              success: false,
              message: "User limit reached for this admin",
            });
          }
        } else if (created_by === "superadmin") {
          // Created by superadmin → skip limit check, but ensure admin exists
          const adminExists = await withConnection(async (conn) => {
            const [rows] = await conn.execute(
              `SELECT id FROM super_admins WHERE id = ?`,
              [admin_id]
            );
            return rows.length > 0;
          });

          if (!adminExists) {
            return res.status(400).json({
              success: false,
              message: "Assigned admin_id not found",
            });
          }
        }
      }

      // Proceed to add user
      fields.push("admin_id", "created_by");
      values.push(admin_id, created_by);
    } else if (role === "admin") {
      fields.push("user_limit", "created_by");
      values.push(user_limit, created_by); // default to 100
    }

    // Step 6: Insert into appropriate table
    const result = await withConnection(async (conn) => {
      const query = `INSERT INTO ${config.table} (${fields.join(
        ", "
      )}) VALUES (${fields.map(() => "?").join(", ")})`;
      const [res] = await conn.execute(query, values);
      return res.insertId;
    });

    // Step 7: Return success response
    res.status(201).json({
      message: `${role} registered successfully`,
      success: true,
      id: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
