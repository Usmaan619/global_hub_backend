const { withConnection } = require("../../utils/helper");
const moment = require("moment");

exports.getDashboardStats = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");
    const currentMonth = moment().format("YYYY-MM");

    const result = await withConnection(async (conn) => {
      const queries = [
        // Total Records
        "SELECT COUNT(*) AS total_entries FROM records",

        // Daily Records (today)
        "SELECT COUNT(*) AS daily_entries FROM records WHERE DATE(created_at) = ?",

        // Monthly Records
        "SELECT COUNT(*) AS monthly_entries FROM records WHERE DATE_FORMAT(created_at, '%Y-%m') = ?",

        // Total Users
        "SELECT COUNT(*) AS total_users FROM users",

        // Active Data Entry Users
        "SELECT COUNT(DISTINCT user_id) AS active_data_entry_users FROM records",

        // Total Admins
        "SELECT COUNT(*) AS total_admins FROM admins",
      ];

      const [
        [totalEntries],
        [dailyEntries],
        [monthlyEntries],
        [totalUsers],
        [activeUsers],
        [totalAdmins],
      ] = await Promise.all([
        conn.execute(queries[0]),
        conn.execute(queries[1], [today]),
        conn.execute(queries[2], [currentMonth]),
        conn.execute(queries[3]),
        conn.execute(queries[4]),
        conn.execute(queries[5]),
      ]).then((results) => results.map(([rows]) => rows[0]));

      return {
        totalEntries: totalEntries.total_entries,
        dailyEntries: dailyEntries.daily_entries,
        monthlyEntries: monthlyEntries.monthly_entries,
        totalUsers: totalUsers.total_users,
        activeDataEntryUsers: activeUsers.active_data_entry_users,
        totalAdmins: totalAdmins.total_admins,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// exports.getSuperAdminAndAdminDetailsCount = async (req, res) => {
//   const { admin_id } = req.query;

//   try {
//     return await withConnection(async (connection) => {
//       // ===== SUPERADMIN SUMMARY =====
//       const [admins] = await connection.query(
//         "SELECT id, name FROM admins WHERE created_by = 'superadmin'"
//       );

//       const superadminSummary = [];

//       for (const admin of admins) {
//         const [userCountRows] = await connection.query(
//           "SELECT COUNT(*) as user_count FROM users WHERE admin_id = ?",
//           [admin.id]
//         );
//         const user_count = userCountRows[0].user_count;

//         const [recordCountRows] = await connection.query(
//           `SELECT COUNT(*) as record_count
//            FROM records
//            WHERE admin_id = ? OR user_id IN (SELECT id FROM users WHERE admin_id = ?)`,
//           [admin.id, admin.id]
//         );
//         const record_count = recordCountRows[0].record_count;

//         superadminSummary.push({
//           admin_id: admin.id,
//           admin_name: admin.name,
//           user_count,
//           record_count,
//         });
//       }

//       // ===== ADMIN DETAIL IF PROVIDED =====
//       let adminDetail = null;

//       if (admin_id) {
//         const [adminRows] = await connection.query(
//           "SELECT id, name FROM admins WHERE id = ?",
//           [admin_id]
//         );

//         if (adminRows.length > 0) {
//           const admin = adminRows[0];

//           const [userCountRows] = await connection.query(
//             "SELECT COUNT(*) as total_users FROM users WHERE admin_id = ?",
//             [admin_id]
//           );
//           const total_users = userCountRows[0].total_users;

//           const [adminRecordCountRows] = await connection.query(
//             `SELECT COUNT(*) as admin_record_count
//              FROM records
//              WHERE admin_id = ? AND user_id IS NULL`,
//             [admin_id]
//           );
//           const admin_record_count = adminRecordCountRows[0].admin_record_count;

//           const [userRecordCountRows] = await connection.query(
//             `SELECT COUNT(*) as user_record_count
//              FROM records
//              WHERE user_id IN (SELECT id FROM users WHERE admin_id = ?)`,
//             [admin_id]
//           );
//           const user_record_count = userRecordCountRows[0].user_record_count;

//           adminDetail = {
//             admin_id: admin.id,
//             admin_name: admin.name,
//             total_users,
//             admin_record_count,
//             user_record_count,
//             total_record_count: admin_record_count + user_record_count,
//           };
//         }
//       }

//       res.json({
//         superadmin_summary: superadminSummary,
//         admin_detail: adminDetail,
//       });
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// exports.getSuperAdminAndAdminDetailsCount = async (req, res) => {
//   const { admin_id } = req.query;

//   try {
//     return await withConnection(async (connection) => {
//       // ===== TOTAL COUNTS FOR SUPERADMIN DASHBOARD =====
//       const [[{ total_admins }]] = await connection.query(
//         "SELECT COUNT(*) as total_admins FROM admins WHERE created_by = 'superadmin'"
//       );

//       const [[{ total_users }]] = await connection.query(
//         "SELECT COUNT(*) as total_users FROM users"
//       );

//       const [[{ total_records }]] = await connection.query(
//         "SELECT COUNT(*) as total_records FROM records"
//       );

//       // ===== SUPERADMIN SUMMARY =====
//       const [admins] = await connection.query(
//         "SELECT id, name FROM admins WHERE created_by = 'superadmin'"
//       );

//       const superadminSummary = [];

//       for (const admin of admins) {
//         const [userCountRows] = await connection.query(
//           "SELECT COUNT(*) as user_count FROM users WHERE admin_id = ?",
//           [admin.id]
//         );
//         const user_count = userCountRows[0].user_count;

//         const [recordCountRows] = await connection.query(
//           `SELECT COUNT(*) as record_count
//            FROM records
//            WHERE admin_id = ? OR user_id IN (SELECT id FROM users WHERE admin_id = ?)`,
//           [admin.id, admin.id]
//         );
//         const record_count = recordCountRows[0].record_count;

//         superadminSummary.push({
//           admin_id: admin.id,
//           admin_name: admin.name,
//           user_count,
//           record_count,
//         });
//       }

//       // ===== ADMIN DETAIL IF PROVIDED =====
//       let adminDetail = null;

//       if (admin_id) {
//         const [adminRows] = await connection.query(
//           "SELECT id, name FROM admins WHERE id = ?",
//           [admin_id]
//         );

//         if (adminRows.length > 0) {
//           const admin = adminRows[0];

//           const [userCountRows] = await connection.query(
//             "SELECT COUNT(*) as total_users FROM users WHERE admin_id = ?",
//             [admin_id]
//           );
//           const total_users = userCountRows[0].total_users;

//           const [adminRecordCountRows] = await connection.query(
//             `SELECT COUNT(*) as admin_record_count
//              FROM records
//              WHERE admin_id = ? AND user_id IS NULL`,
//             [admin_id]
//           );
//           const admin_record_count = adminRecordCountRows[0].admin_record_count;

//           const [userRecordCountRows] = await connection.query(
//             `SELECT COUNT(*) as user_record_count
//              FROM records
//              WHERE user_id IN (SELECT id FROM users WHERE admin_id = ?)`,
//             [admin_id]
//           );
//           const user_record_count = userRecordCountRows[0].user_record_count;

//           adminDetail = {
//             admin_id: admin.id,
//             admin_name: admin.name,
//             total_users,
//             admin_record_count,
//             user_record_count,
//             total_record_count: admin_record_count + user_record_count,
//           };
//         }
//       }

//       res.json({
//         success: true,
//         total_admins,
//         total_users,
//         total_records,
//         superadmin_summary: superadminSummary,
//         admin_detail: adminDetail,
//       });
//     });
//   } catch (err) {
//     console.error("Error in getSuperAdminAndAdminDetailsCount:", err);
//     res.status(500).json({
//       success: false,
//       error: "Server error",
//     });
//   }
// };

// exports.getSuperAdminAndAdminDetailsCount = async (req, res) => {
//   const { admin_id } = req.query;

//   try {
//     return await withConnection(async (connection) => {
//       // ===== TOTAL COUNTS FOR SUPERADMIN DASHBOARD =====
//       const [[{ total_admins }]] = await connection.query(
//         "SELECT COUNT(*) as total_admins FROM admins WHERE created_by = 'superadmin'"
//       );

//       const [[{ total_users }]] = await connection.query(
//         "SELECT COUNT(*) as total_users FROM users"
//       );

//       const [[{ total_records }]] = await connection.query(
//         "SELECT COUNT(*) as total_records FROM records"
//       );

//       const [[{ superadmin_direct_users }]] = await connection.query(
//         "SELECT COUNT(*) as superadmin_direct_users FROM users WHERE created_by = 'superadmin'"
//       );

//       // ===== SUPERADMIN SUMMARY =====
//       const [admins] = await connection.query(
//         "SELECT id, name FROM admins WHERE created_by = 'superadmin'"
//       );

//       const superadminSummary = [];

//       for (const admin of admins) {
//         const [userCountRows] = await connection.query(
//           "SELECT COUNT(*) as user_count FROM users WHERE admin_id = ?",
//           [admin.id]
//         );
//         const user_count = userCountRows[0].user_count;

//         const [recordCountRows] = await connection.query(
//           `SELECT COUNT(*) as record_count
//            FROM records
//            WHERE admin_id = ? OR user_id IN (SELECT id FROM users WHERE admin_id = ?)`,
//           [admin.id, admin.id]
//         );
//         const record_count = recordCountRows[0].record_count;

//         superadminSummary.push({
//           admin_id: admin.id,
//           admin_name: admin.name,
//           user_count,
//           record_count,
//         });
//       }

//       // ===== ADMIN DETAIL IF PROVIDED =====
//       let adminDetail = null;

//       if (admin_id) {
//         const [adminRows] = await connection.query(
//           "SELECT id, name FROM admins WHERE id = ?",
//           [admin_id]
//         );

//         if (adminRows.length > 0) {
//           const admin = adminRows[0];

//           const [userCountRows] = await connection.query(
//             "SELECT COUNT(*) as total_users FROM users WHERE admin_id = ?",
//             [admin_id]
//           );
//           const total_users = userCountRows[0].total_users;

//           const [adminRecordCountRows] = await connection.query(
//             `SELECT COUNT(*) as admin_record_count
//              FROM records
//              WHERE admin_id = ? AND user_id IS NULL`,
//             [admin_id]
//           );
//           const admin_record_count = adminRecordCountRows[0].admin_record_count;

//           const [userRecordCountRows] = await connection.query(
//             `SELECT COUNT(*) as user_record_count
//              FROM records
//              WHERE user_id IN (SELECT id FROM users WHERE admin_id = ?)`,
//             [admin_id]
//           );
//           const user_record_count = userRecordCountRows[0].user_record_count;

//           adminDetail = {
//             admin_id: admin.id,
//             admin_name: admin.name,
//             total_users,
//             admin_record_count,
//             user_record_count,
//             total_record_count: admin_record_count + user_record_count,
//           };
//         }
//       }

//       // ===== FINAL RESPONSE =====
//       res.json({
//         total_admins,
//         total_users,
//         total_records,
//         superadmin_direct_users,
//         superadmin_summary: superadminSummary,
//         admin_detail: adminDetail,
//         success: true,
//       });
//     });
//   } catch (err) {
//     console.error("Error in getSuperAdminAndAdminDetailsCount:", err);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };


exports.getSuperAdminAndAdminDetailsCount = async (req, res) => {
  const { admin_id, year } = req.query;
  const selectedYear = year || moment().year(); // Default to current year if year not provided

  try {
    return await withConnection(async (connection) => {
      // ===== TOTAL COUNTS =====
      const [[{ total_admins }]] = await connection.query(
        "SELECT COUNT(*) as total_admins FROM admins WHERE created_by = 'superadmin'"
      );

      const [[{ total_users }]] = await connection.query(
        "SELECT COUNT(*) as total_users FROM users"
      );

      const [[{ total_records }]] = await connection.query(
        "SELECT COUNT(*) as total_records FROM records"
      );

      const [[{ superadmin_direct_users }]] = await connection.query(
        "SELECT COUNT(*) as superadmin_direct_users FROM users WHERE created_by = 'superadmin'"
      );

      // ===== SUPERADMIN SUMMARY =====
      const [admins] = await connection.query(
        "SELECT id, name FROM admins WHERE created_by = 'superadmin'"
      );

      const superadminSummary = [];

      for (const admin of admins) {
        const [userCountRows] = await connection.query(
          "SELECT COUNT(*) as user_count FROM users WHERE admin_id = ?",
          [admin.id]
        );
        const user_count = userCountRows[0].user_count;

        const [recordCountRows] = await connection.query(
          `SELECT COUNT(*) as record_count
           FROM records
           WHERE admin_id = ? OR user_id IN (SELECT id FROM users WHERE admin_id = ?)`,
          [admin.id, admin.id]
        );
        const record_count = recordCountRows[0].record_count;

        superadminSummary.push({
          admin_id: admin.id,
          admin_name: admin.name,
          user_count,
          record_count,
        });
      }

      // ===== ADMIN DETAIL IF PROVIDED =====
      let adminDetail = null;

      if (admin_id) {
        const [adminRows] = await connection.query(
          "SELECT id, name FROM admins WHERE id = ?",
          [admin_id]
        );

        if (adminRows.length > 0) {
          const admin = adminRows[0];

          const [userCountRows] = await connection.query(
            "SELECT COUNT(*) as total_users FROM users WHERE admin_id = ?",
            [admin_id]
          );
          const total_users = userCountRows[0].total_users;

          const [adminRecordCountRows] = await connection.query(
            `SELECT COUNT(*) as admin_record_count
             FROM records
             WHERE admin_id = ? AND user_id IS NULL`,
            [admin_id]
          );
          const admin_record_count = adminRecordCountRows[0].admin_record_count;

          const [userRecordCountRows] = await connection.query(
            `SELECT COUNT(*) as user_record_count
             FROM records
             WHERE user_id IN (SELECT id FROM users WHERE admin_id = ?)`,
            [admin_id]
          );
          const user_record_count = userRecordCountRows[0].user_record_count;

          adminDetail = {
            admin_id: admin.id,
            admin_name: admin.name,
            total_users,
            admin_record_count,
            user_record_count,
            total_record_count: admin_record_count + user_record_count,
          };
        }
      }

      // ===== MONTHLY USER & ADMIN STATS =====
      const [monthlyUserCounts] = await connection.query(
        `SELECT MONTH(created_at) AS month, COUNT(*) AS count
         FROM users
         WHERE YEAR(created_at) = ?
         GROUP BY MONTH(created_at)`,
        [selectedYear]
      );

      const [monthlyAdminCounts] = await connection.query(
        `SELECT MONTH(created_at) AS month, COUNT(*) AS count
         FROM admins
         WHERE YEAR(created_at) = ?
         GROUP BY MONTH(created_at)`,
        [selectedYear]
      );

      const monthly_creation_stats = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const userEntry = monthlyUserCounts.find((u) => u.month === m);
        const adminEntry = monthlyAdminCounts.find((a) => a.month === m);
        return {
          month: new Date(0, m - 1).toLocaleString("default", {
            month: "short",
          }),
          users: userEntry ? userEntry.count : 0,
          admins: adminEntry ? adminEntry.count : 0,
        };
      });

      // ===== FINAL RESPONSE =====
      res.json({
        success: true,
        total_admins,
        total_users,
        total_records,
        superadmin_direct_users,
        superadmin_summary: superadminSummary,
        admin_detail: adminDetail,
        selected_year: selectedYear, // Helpful for frontend
        monthly_creation_stats,
      });
    });
  } catch (err) {
    console.error("Error in getSuperAdminAndAdminDetailsCount:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
