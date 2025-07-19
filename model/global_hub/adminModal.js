const moment = require("moment");
const { withConnection } = require("../../utils/helper");

// Create Admin
exports.createAdmin = async ({
  name,
  username,
  password,
  user_limit,
  created_by,
}) => {
  try {
    return await withConnection(async (connection) => {
      const query = `
        INSERT INTO admins (name, username, password, user_limit, created_by)
        VALUES (?, ?, ?, ?, ?)`;
      const [result] = await connection.execute(query, [
        name,
        username,
        password,
        user_limit,
        created_by,
      ]);
      return result.insertId;
    });
  } catch (error) {
    console.error("Model:createAdmin Error:", error, moment().format());
    throw new Error("Database error while creating admin");
  }
};

// Get All Admins
exports.getAllAdmins = async () => {
  try {
    return await withConnection(async (connection) => {
      const [rows] = await connection.execute("SELECT * FROM admins");
      return rows;
    });
  } catch (error) {
    console.error("Model:getAllAdmins Error:", error, moment().format());
    throw new Error("Database error while fetching admins");
  }
};

// Update Admin
exports.updateAdmin = async (id, updates) => {
  try {
    const { name, username, password, user_limit, created_by } = updates;
    return await withConnection(async (connection) => {
      const query = `
        UPDATE admins SET name = ?, username = ?, password = ?, user_limit = ?, created_by = ?
        WHERE id = ?`;
      const [result] = await connection.execute(query, [
        name,
        username,
        password,
        user_limit,
        created_by,
        id,
      ]);
      return result;
    });
  } catch (error) {
    console.error("Model:updateAdmin Error:", error, moment().format());
    throw new Error("Database error while updating admin");
  }
};

// Delete Admin
exports.deleteAdmin = async (id) => {
  try {
    return await withConnection(async (connection) => {
      const [result] = await connection.execute(
        "DELETE FROM admins WHERE id = ?",
        [id]
      );
      return result;
    });
  } catch (error) {
    console.error("Model:deleteAdmin Error:", error, moment().format());
    throw new Error("Database error while deleting admin");
  }
};
