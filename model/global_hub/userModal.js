const moment = require("moment");
const { withConnection } = require("../../utils/helper");

// Create user
exports.createUser = async ({ name, username, password, admin_id }) => {
  try {
    return await withConnection(async (connection) => {
      const query = `
        INSERT INTO users (name, username, password, admin_id)
        VALUES (?, ?, ?, ?)`;
      const [result] = await connection.execute(query, [
        name,
        username,
        password,
        admin_id,
      ]);
      return result.insertId;
    });
  } catch (error) {
    console.error("Model:createUser Error:", error, moment().format());
    throw new Error("Database error while creating user");
  }
};

// Get all users
exports.getAllUsers = async () => {
  try {
    return await withConnection(async (connection) => {
      const [rows] = await connection.execute("SELECT * FROM users");
      return rows;
    });
  } catch (error) {
    console.error("Model:getAllUsers Error:", error, moment().format());
    throw new Error("Database error while fetching users");
  }
};

// Update user
exports.updateUser = async (id, updates) => {
  try {
    const { name, username, password, admin_id } = updates;
    return await withConnection(async (connection) => {
      const query = `
        UPDATE users
        SET name = ?, username = ?, password = ?, admin_id = ?
        WHERE id = ?`;
      const [result] = await connection.execute(query, [
        name,
        username,
        password,
        admin_id,
        id,
      ]);
      return result;
    });
  } catch (error) {
    console.error("Model:updateUser Error:", error, moment().format());
    throw new Error("Database error while updating user");
  }
};

// Delete user
exports.deleteUser = async (id) => {
  try {
    return await withConnection(async (connection) => {
      const [result] = await connection.execute(
        "DELETE FROM users WHERE id = ?",
        [id]
      );

      await connection.execute(`DELETE FROM records WHERE user_id = ?`, [id]);

      return result.affectedRows > 0;
    });
  } catch (error) {
    console.error("Model:deleteUser Error:", error, moment().format());
    throw new Error("Database error while deleting user");
  }
};

exports.updateUserByAdmin = async (id, updates) => {
  try {
    const { name, username, password } = updates;
    return await withConnection(async (connection) => {
      const query = `
        UPDATE users
        SET name = ?, username = ?, password = ? WHERE id = ?`;
      const [result] = await connection.execute(query, [
        name,
        username,
        password,
        id,
      ]);
      return result;
    });
  } catch (error) {
    console.error("Model:updateUser Error:", error, moment().format());
    throw new Error("Database error while updating user");
  }
};
