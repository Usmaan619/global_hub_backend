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
exports.deleteAdminOnly = async (id) => {
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

exports.createUserByAdmin = async ({ name, username, password, admin_id }) => {
  try {
    return await withConnection(async (connection) => {
      // 1. Get current user count for this admin
      const [userCountResult] = await connection.execute(
        `SELECT COUNT(*) AS user_count FROM users WHERE admin_id = ?`,
        [admin_id]
      );
      const userCount = userCountResult[0].user_count;

      // 2. Get user limit for the admin
      const [adminLimitResult] = await connection.execute(
        `SELECT user_limit FROM admins WHERE id = ?`,
        [admin_id]
      );

      if (adminLimitResult.length === 0) {
        throw new Error("Admin not found");
      }

      const userLimit = adminLimitResult[0].user_limit;

      // 3. Check if user can be created
      if (userCount >= userLimit) {
        throw new Error("User limit exceeded for this admin");
      }

      // 4. Create new user
      const [result] = await connection.execute(
        `INSERT INTO users (name, username, password, admin_id) VALUES (?, ?, ?, ?)`,
        [name, username, password, admin_id]
      );

      return result.insertId;
    });
  } catch (error) {
    console.error("Model:createUser Error:", error);
    throw new Error("Database error while creating user");
  }
};

// exports.getUsersByRoleAndId = async (role, id = null) => {
//   try {
//     const result = await withConnection(async (connection) => {
//       let users = {};

//       if (role === "superadmin") {
//         // Superadmin ke direct + indirect users based on created_by field
//         const [allUsers] = await connection.execute(
//           `SELECT id, name, username, admin_id, created_by, created_at
//            FROM users
//            WHERE created_by = ?`,
//           [role]
//         );

//         users = {
//           all_users: allUsers,
//         };
//       } else if (role === "admin") {
//         if (!id) {
//           return {
//             success: false,
//             message: "Admin ID is required for role 'admin'",
//           };
//         }

//         const [adminUsers] = await connection.execute(
//           `SELECT id, name, username, admin_id, created_by, created_at
//            FROM users
//            WHERE admin_id = ?`,
//           [id]
//         );

//         users = {
//           admin_users: adminUsers,
//         };
//       } else {
//         return {
//           success: false,
//           message: "Invalid role",
//         };
//       }

//       return users;
//     });

//     return {
//       success: true,
//       data: result,
//     };
//   } catch (error) {
//     console.error("Error in getUsersByRoleAndId:", error);
//     throw error;
//   }
// };

// exports.getUsersByRoleAndId = async (role, id = null) => {
//   try {
//     const result = await withConnection(async (connection) => {
//       let response = {};

//       if (role === "superadmin") {
//         // 1. Get all admins created by superadmin
//         const [admins] = await connection.execute(
//           `SELECT * FROM admins WHERE created_by = ?`,
//           [role]
//         );

//         // 2. For each admin, get user count
//         const adminsWithUserCount = await Promise.all(
//           admins.map(async (admin) => {
//             const [userCount] = await connection.execute(
//               `SELECT COUNT(*) as count FROM users WHERE admin_id = ?`,
//               [admin.id]
//             );

//             return {
//               admin_id: admin.id,
//               name: admin.name,
//               username: admin.username,
//               admin_created_at: admin.created_at,
//               role_name: admin?.role,
//               admin_password: admin.password,
//               user_count: userCount[0].count,
//             };
//           })
//         );

//         response = {
//           admins: adminsWithUserCount,
//         };
//       } else if (role === "admin") {
//         if (!id) {
//           return {
//             success: false,
//             message: "Admin ID is required for role 'admin'",
//           };
//         }

//         const [adminUsers] = await connection.execute(
//           `SELECT id, * FROM users WHERE admin_id = ?`,
//           [id]
//         );

//         response = {
//           admin_id: id,
//           total_users: adminUsers.length,
//           admin_users: adminUsers,
//           role_name: users?.role,
//         };
//       } else {
//         return {
//           success: false,
//           message: "Invalid role",
//         };
//       }

//       return response;
//     });

//     return {
//       success: true,
//       data: result,
//     };
//   } catch (error) {
//     console.error("Error in getUsersByRoleAndId:", error);
//     throw error;
//   }
// };

// final
// exports.getUsersByRoleAndId = async (role, id = null) => {
//   try {
//     const result = await withConnection(async (connection) => {
//       let response = {};

//       if (role === "superadmin") {
//         // 1. Get all admins created by superadmin
//         const [admins] = await connection.execute(
//           `SELECT * FROM admins WHERE created_by = ?`,
//           [role]
//         );

//         // 2. For each admin, get full user data
//         const adminsWithUsers = await Promise.all(
//           admins.map(async (admin) => {
//             const [users] = await connection.execute(
//               `SELECT * FROM users WHERE admin_id = ?`,
//               [admin.id]
//             );

//             return {
//               admin_id: admin.id,
//               name: admin.name,
//               username: admin.username,
//               admin_created_at: admin.created_at,
//               user_limit: admin?.user_limit,
//               role_name: admin?.role,
//               admin_password: admin.password,
//               user_count: users?.length, // Full user data
//               users: users, // Full user data
//             };
//           })
//         );

//         response = {
//           admins: adminsWithUsers,
//         };
//       } else if (role === "admin") {
//         if (!id) {
//           return {
//             success: false,
//             message: "Admin ID is required for role 'admin'",
//           };
//         }

//         const [adminUsers] = await connection.execute(
//           `SELECT * FROM users WHERE admin_id = ?`,
//           [id]
//         );

//         response = {
//           admin_id: id,
//           total_users: adminUsers.length,
//           admin_users: adminUsers,
//         };
//       } else {
//         return {
//           success: false,
//           message: "Invalid role",
//         };
//       }

//       return response;
//     });

//     return {
//       success: true,
//       data: result,
//     };
//   } catch (error) {
//     console.error("Error in getUsersByRoleAndId:", error);
//     throw error;
//   }
// };

// exports.getUsersByRoleAndId = async (role, id = null) => {
//   try {
//     const result = await withConnection(async (connection) => {
//       let response = {};

//       if (role === "superadmin") {
//         const [admins] = await connection.execute(
//           `SELECT * FROM admins WHERE created_by = ?`,
//           [role]
//         );

//         const adminsWithUsersAndRecords = await Promise.all(
//           admins.map(async (admin) => {
//             // Get users created by this admin
//             const [users] = await connection.execute(
//               `SELECT * FROM users WHERE admin_id = ?`,
//               [admin.id]
//             );

//             // For each user, count how many records they created
//             let totalRecords = 0;
//             const usersWithRecordCount = await Promise.all(
//               users.map(async (user) => {
//                 const [records] = await connection.execute(
//                   `SELECT COUNT(*) as record_count FROM records WHERE user_id = ?`,
//                   [user.id]
//                 );
//                 const recordCount = records[0].record_count;
//                 totalRecords += recordCount;

//                 return {
//                   ...user,
//                   record_count: recordCount,
//                 };
//               })
//             );

//             return {
//               admin_id: admin.id,
//               name: admin.name,
//               username: admin.username,
//               admin_created_at: admin.created_at,
//               user_limit: admin?.user_limit,
//               role_name: admin?.role,
//               admin_password: admin.password,
//               user_count: users.length,
//               total_records_created_by_users: totalRecords,
//               users: usersWithRecordCount,
//             };
//           })
//         );

//         response = {
//           admins: adminsWithUsersAndRecords,
//         };
//       } else if (role === "admin") {
//         if (!id) {
//           return {
//             success: false,
//             message: "Admin ID is required for role 'admin'",
//           };
//         }

//         const [adminUsers] = await connection.execute(
//           `SELECT * FROM users WHERE admin_id = ?`,
//           [id]
//         );

//         let totalRecords = 0;
//         const usersWithRecordCount = await Promise.all(
//           adminUsers.map(async (user) => {
//             const [records] = await connection.execute(
//               `SELECT COUNT(*) as record_count FROM records WHERE user_id = ?`,
//               [user.id]
//             );
//             const recordCount = records[0].record_count;
//             totalRecords += recordCount;

//             return {
//               ...user,
//               record_count: recordCount,
//             };
//           })
//         );

//         response = {
//           admin_id: id,
//           total_users: adminUsers.length,
//           total_records_created_by_users: totalRecords,
//           admin_users: usersWithRecordCount,
//         };
//       } else {
//         return {
//           success: false,
//           message: "Invalid role",
//         };
//       }

//       return response;
//     });

//     return {
//       success: true,
//       data: result,
//     };
//   } catch (error) {
//     console.error("Error in getUsersByRoleAndId:", error);
//     throw error;
//   }
// };

exports.getUsersByRoleAndId = async (role, id = null) => {
  try {
    const result = await withConnection(async (connection) => {
      let response = {};

      if (role === "superadmin") {
        // 1. Get admins created by superadmin
        const [admins] = await connection.execute(
          `SELECT * FROM admins WHERE created_by = ?`,
          [role]
        );

        // 2. For each admin, get their users and records count
        const adminsWithUsersAndRecords = await Promise.all(
          admins.map(async (admin) => {
            const [users] = await connection.execute(
              `SELECT * FROM users WHERE admin_id = ?`,
              [admin.id]
            );

            let totalRecords = 0;
            const usersWithRecordCount = await Promise.all(
              users.map(async (user) => {
                const [records] = await connection.execute(
                  `SELECT COUNT(*) as record_count FROM records WHERE user_id = ?`,
                  [user.id]
                );
                const recordCount = records[0].record_count;
                totalRecords += recordCount;

                return {
                  ...user,
                  record_count: recordCount,
                };
              })
            );

            return {
              admin_id: admin.id,
              name: admin.name,
              username: admin.username,
              admin_created_at: admin.created_at,
              user_limit: admin?.user_limit,
              role_name: admin?.role,
              admin_password: admin.password,
              user_count: users.length,
              total_records_created_by_users: totalRecords,
              users: usersWithRecordCount,
            };
          })
        );

        // 3. Get users created directly by superadmin (not linked to any admin)
        const [directSuperadminUsers] = await connection.execute(
          `SELECT * FROM users WHERE created_by = ?`,
          [role]
        );

        let directUsersTotalRecords = 0;
        const directUsersWithRecordCount = await Promise.all(
          directSuperadminUsers.map(async (user) => {
            const [records] = await connection.execute(
              `SELECT COUNT(*) as record_count FROM records WHERE user_id = ?`,
              [user.id]
            );
            const recordCount = records[0].record_count;
            directUsersTotalRecords += recordCount;

            return {
              ...user,
              record_count: recordCount,
            };
          })
        );

        response = {
          admins: adminsWithUsersAndRecords,
          direct_superadmin_users: {
            user_count: directSuperadminUsers.length,
            total_records_created_by_users: directUsersTotalRecords,
            users: directUsersWithRecordCount,
          },
        };
      } else if (role === "admin") {
        if (!id) {
          return {
            success: false,
            message: "Admin ID is required for role 'admin'",
          };
        }

        const [adminUsers] = await connection.execute(
          `SELECT * FROM users WHERE admin_id = ?`,
          [id]
        );

        let totalRecords = 0;
        const usersWithRecordCount = await Promise.all(
          adminUsers.map(async (user) => {
            const [records] = await connection.execute(
              `SELECT COUNT(*) as record_count FROM records WHERE user_id = ?`,
              [user.id]
            );
            const recordCount = records[0].record_count;
            totalRecords += recordCount;

            return {
              ...user,
              record_count: recordCount,
            };
          })
        );

        response = {
          admin_id: id,
          total_users: adminUsers.length,
          total_records_created_by_users: totalRecords,
          admin_users: usersWithRecordCount,
        };
      } else {
        return {
          success: false,
          message: "Invalid role",
        };
      }

      return response;
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error in getUsersByRoleAndId:", error);
    throw error;
  }
};

exports.deleteAdmin = async (id) => {
  try {
    return await withConnection(async (connection) => {
      await connection.beginTransaction();

      // Step 1: Admin ke saare users ka ID nikalo
      const [userRows] = await connection.execute(
        "SELECT id FROM users WHERE admin_id = ?",
        [id]
      );

      const userIds = userRows.map((user) => user.id);

      // Step 2: Har user ke records hatao (agar koi user hai to)
      if (userIds.length > 0) {
        const placeholders = userIds.map(() => "?").join(",");
        await connection.execute(
          `DELETE FROM records WHERE user_id IN (${placeholders})`,
          userIds
        );
      }

      // Step 3: Users delete karo
      await connection.execute("DELETE FROM users WHERE admin_id = ?", [id]);

      // Step 4: Admin delete karo
      const [result] = await connection.execute(
        "DELETE FROM admins WHERE id = ?",
        [id]
      );

      await connection.commit();

      // Agar admin delete hua to true return karo
      return result.affectedRows > 0;
    });
  } catch (error) {
    console.error("Model:deleteAdmin Error:", error);
    if (connection) await connection.rollback(); // Transaction rollback on error
    throw new Error("Database error while deleting admin");
  }
};

exports.updateAdminThree = async (id, updates) => {
  try {
    const { name, username, password, user_limit } = updates;
    return await withConnection(async (connection) => {
      const query = `
        UPDATE admins SET name = ?, username = ?, password = ?, user_limit = ?
        WHERE id = ?`;
      const [result] = await connection.execute(query, [
        name,
        username,
        password,
        user_limit,
        id,
      ]);
      return result?.affectedRows > 0;
    });
  } catch (error) {
    console.error("Model:updateAdmin Error:", error, moment().format());
    throw new Error("Database error while updating admin");
  }
};
