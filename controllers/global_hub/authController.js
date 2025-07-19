const bcrypt = require("bcrypt");
const authModel = require("../../model/global_hub/authModel");
const moment = require("moment");
const { generateToken, withConnection } = require("../../utils/helper");
const jwt = require("jsonwebtoken");

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
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      role: detectedRole,
      user: matchedUser,
      token,
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

exports.registerAutoDetect = async (req, res) => {
  const { role, name, username, password, admin_id, user_limit, created_by } =
    req.body;

  // Check required fields
  if (!role || !name || !username || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Define valid roles and their table info
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
    // Check if username already exists
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

    // Hash password if required
    // const finalPassword = config.hash
    //   ? await bcrypt.hash(password, 10)
    //   : password;

    // Insert into correct table
    const result = await withConnection(async (conn) => {
      const fields = ["name", "username", "password"];
      const values = [name, username, password];

      if (role === "user") {
        fields.push("admin_id");
        fields.push("created_by");

        values.push(admin_id);
        values.push(created_by);
      } else if (role === "admin") {
        fields.push("user_limit");
        fields.push("created_by");

        values.push(user_limit || 6); // Default user_limit to 100 if not provided
        values.push(created_by);
      }

      const query = `INSERT INTO ${config.table} (${fields.join(
        ", "
      )}) VALUES (${fields.map(() => "?").join(", ")})`;
      const [res] = await conn.execute(query, values);
      return res.insertId;
    });

    res.status(201).json({
      message: `${role} registered successfully`,
      success: true,
      id: result,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
