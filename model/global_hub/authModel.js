const { withConnection } = require("../../utils/helper");
const bcrypt = require("bcrypt");

/**
 * Register user/admin/super_admin
 * @param {string} table - table name
 * @param {object} data - { name, username, password, admin_id (optional) }
 * @returns {number} insertId
 */
exports.register = async (table, data) => {
  // Hash password only for super_admins
  const hashedPassword =
    table === "super_admins"
      ? await bcrypt.hash(data.password, 10)
      : data.password;

  return await withConnection(async (conn) => {
    const query = `
      INSERT INTO ${table} 
      (name, username, password${data.admin_id ? ", admin_id" : ""}) 
      VALUES (?, ?, ?${data.admin_id ? ", ?" : ""})
    `;
    const values = [data.name, data.username, hashedPassword];
    if (data.admin_id) values.push(data.admin_id);

    const [result] = await conn.execute(query, values);
    return result.insertId;
  });
};

/**
 * Login user by username
 * @param {string} table - table name
 * @param {string} username
 * @returns {object} user record or null
 */
exports.login = async (table, username) => {
  return await withConnection(async (conn) => {
    const query = `SELECT * FROM ${table} WHERE username = ?`;
    const [rows] = await conn.execute(query, [username]);
    return rows.length ? rows[0] : null;
  });
};
