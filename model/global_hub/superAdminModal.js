const moment = require("moment");
const { withConnection } = require("../../utils/helper");

// Create Super Admin
exports.createSuperAdmin = async ({ name, username, password }) => {
  try {
    return await withConnection(async (connection) => {
      const query = `
        INSERT INTO super_admins (name, username, password)
        VALUES (?, ?, ?)`;
      const [result] = await connection.execute(query, [name, username, password]);
      return result.insertId;
    });
  } catch (error) {
    console.error("Model:createSuperAdmin Error:", error, moment().format());
    throw new Error("Database error while creating super admin");
  }
};

// Get All Super Admins
exports.getAllSuperAdmins = async () => {
  try {
    return await withConnection(async (connection) => {
      const [rows] = await connection.execute("SELECT * FROM super_admins");
      return rows;
    });
  } catch (error) {
    console.error("Model:getAllSuperAdmins Error:", error, moment().format());
    throw new Error("Database error while fetching super admins");
  }
};

// Update Super Admin
exports.updateSuperAdmin = async (id, updates) => {
  try {
    const { name, username, password } = updates;
    return await withConnection(async (connection) => {
      const query = `
        UPDATE super_admins
        SET name = ?, username = ?, password = ?
        WHERE id = ?`;
      const [result] = await connection.execute(query, [name, username, password, id]);
      return result;
    });
  } catch (error) {
    console.error("Model:updateSuperAdmin Error:", error, moment().format());
    throw new Error("Database error while updating super admin");
  }
};

// Delete Super Admin
exports.deleteSuperAdmin = async (id) => {
  try {
    return await withConnection(async (connection) => {
      const [result] = await connection.execute("DELETE FROM super_admins WHERE id = ?", [id]);
      return result;
    });
  } catch (error) {
    console.error("Model:deleteSuperAdmin Error:", error, moment().format());
    throw new Error("Database error while deleting super admin");
  }
};
