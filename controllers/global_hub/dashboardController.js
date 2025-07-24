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

// exports.getSuperAdminAndAdminDetailsCount = async (req, res) => {
//   const { admin_id, year } = req.query;
//   const selectedYear = year || moment().year(); // Default to current year if year not provided

//   try {
//     return await withConnection(async (connection) => {
//       // ===== TOTAL COUNTS =====
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
//              WHERE user_id = ? `,
//             [admin_id]
//             // AND admin_id  IS NULL
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

//       // ===== MONTHLY USER & ADMIN STATS =====
//       const [monthlyUserCounts] = await connection.query(
//         `SELECT MONTH(created_at) AS month, COUNT(*) AS count
//          FROM users
//          WHERE YEAR(created_at) = ?
//          GROUP BY MONTH(created_at)`,
//         [selectedYear]
//       );

//       const [monthlyAdminCounts] = await connection.query(
//         `SELECT MONTH(created_at) AS month, COUNT(*) AS count
//          FROM admins
//          WHERE YEAR(created_at) = ?
//          GROUP BY MONTH(created_at)`,
//         [selectedYear]
//       );

//       const monthly_creation_stats = Array.from({ length: 12 }, (_, i) => {
//         const m = i + 1;
//         const userEntry = monthlyUserCounts.find((u) => u.month === m);
//         const adminEntry = monthlyAdminCounts.find((a) => a.month === m);
//         return {
//           month: new Date(0, m - 1).toLocaleString("default", {
//             month: "short",
//           }),
//           users: userEntry ? userEntry.count : 0,
//           admins: adminEntry ? adminEntry.count : 0,
//         };
//       });

//       // ===== FINAL RESPONSE =====
//       res.json({
//         success: true,
//         total_admins,
//         total_users,
//         total_records,
//         superadmin_direct_users,
//         superadmin_summary: superadminSummary,
//         admin_detail: adminDetail,
//         selected_year: selectedYear, // Helpful for frontend
//         monthly_creation_stats,
//       });
//     });
//   } catch (err) {
//     console.error("Error in getSuperAdminAndAdminDetailsCount:", err);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };
// final api 24/7/205
// exports.getSuperAdminAndAdminDetailsCount = async (req, res) => {
//   const { admin_id, year } = req.query;
//   const selectedYear = year || moment().year(); // Default to current year if year not provided

//   try {
//     return await withConnection(async (connection) => {
//       // ===== TOTAL COUNTS =====
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
//              WHERE user_id = ? `,
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

//       // ===== MONTHLY USER & ADMIN CREATION STATS =====
//       const [monthlyUserCounts] = await connection.query(
//         `SELECT MONTH(created_at) AS month, COUNT(*) AS count
//          FROM users
//          WHERE YEAR(created_at) = ?
//          GROUP BY MONTH(created_at)`,
//         [selectedYear]
//       );

//       const [monthlyAdminCounts] = await connection.query(
//         `SELECT MONTH(created_at) AS month, COUNT(*) AS count
//          FROM admins
//          WHERE YEAR(created_at) = ?
//          GROUP BY MONTH(created_at)`,
//         [selectedYear]
//       );

//       const monthly_creation_stats = Array.from({ length: 12 }, (_, i) => {
//         const m = i + 1;
//         const userEntry = monthlyUserCounts.find((u) => u.month === m);
//         const adminEntry = monthlyAdminCounts.find((a) => a.month === m);
//         return {
//           month: new Date(0, m - 1).toLocaleString("default", {
//             month: "short",
//           }),
//           users: userEntry ? userEntry.count : 0,
//           admins: adminEntry ? adminEntry.count : 0,
//         };
//       });

//       // ===== MONTHLY RECORD COUNT PER USER UNDER ADMIN =====
//       let monthly_user_record_stats_admin = [];

//       if (admin_id) {
//         const [monthlyUserRecordStatsRaw] = await connection.query(
//           `SELECT
//              u.name as user_name,
//              MONTH(r.created_at) as month,
//              COUNT(r.id) as record_count
//            FROM users u
//            LEFT JOIN records r ON r.user_id = u.id
//            WHERE u.admin_id = ? AND YEAR(r.created_at) = ?
//            GROUP BY u.name, MONTH(r.created_at)
//            ORDER BY u.name, month`,
//           [admin_id, selectedYear]
//         );

//         const users = [
//           ...new Set(monthlyUserRecordStatsRaw.map((r) => r.user_name)),
//         ];

//         for (const user of users) {
//           for (let i = 1; i <= 12; i++) {
//             const found = monthlyUserRecordStatsRaw.find(
//               (r) => r.user_name === user && r.month === i
//             );
//             monthly_user_record_stats_admin.push({
//               month: new Date(0, i - 1).toLocaleString("default", {
//                 month: "short",
//               }),
//               user_name: user,
//               record_count: found ? found.record_count : 0,
//             });
//           }
//         }
//       }

//       // ===== FINAL RESPONSE =====
//       res.json({
//         success: true,
//         total_admins,
//         total_users,
//         total_records,
//         superadmin_direct_users,
//         superadmin_summary: superadminSummary,
//         admin_detail: adminDetail,
//         selected_year: selectedYear,
//         monthly_creation_stats,
//         monthly_user_record_stats_admin,
//       });
//     });
//   } catch (err) {
//     console.error("Error in getSuperAdminAndAdminDetailsCount:", err);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

//
// exports.getSuperAdminAndAdminDetailsCount = async (req, res) => {
//   const { admin_id, year, user_id } = req.query;
//   const selectedYear = year || moment().year();

//   try {
//     return await withConnection(async (connection) => {
//       // ===== TOTAL COUNTS =====
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
//              WHERE user_id = ? `,
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

//       // ===== MONTHLY USER & ADMIN CREATION STATS =====
//       const [monthlyUserCounts] = await connection.query(
//         `SELECT MONTH(created_at) AS month, COUNT(*) AS count
//          FROM users
//          WHERE YEAR(created_at) = ?
//          GROUP BY MONTH(created_at)`,
//         [selectedYear]
//       );

//       const [monthlyAdminCounts] = await connection.query(
//         `SELECT MONTH(created_at) AS month, COUNT(*) AS count
//          FROM admins
//          WHERE YEAR(created_at) = ?
//          GROUP BY MONTH(created_at)`,
//         [selectedYear]
//       );

//       const monthly_creation_stats = Array.from({ length: 12 }, (_, i) => {
//         const m = i + 1;
//         const userEntry = monthlyUserCounts.find((u) => u.month === m);
//         const adminEntry = monthlyAdminCounts.find((a) => a.month === m);
//         return {
//           month: new Date(0, m - 1).toLocaleString("default", {
//             month: "short",
//           }),
//           users: userEntry ? userEntry.count : 0,
//           admins: adminEntry ? adminEntry.count : 0,
//         };
//       });

//       // ===== MONTHLY RECORD COUNT PER USER UNDER ADMIN =====
//       let monthly_user_record_stats_admin = [];

//       if (admin_id) {
//         const [monthlyUserRecordStatsRaw] = await connection.query(
//           `SELECT
//              u.name as user_name,
//              MONTH(r.created_at) as month,
//              COUNT(r.id) as record_count
//            FROM users u
//            LEFT JOIN records r ON r.user_id = u.id
//            WHERE u.admin_id = ? AND YEAR(r.created_at) = ?
//            GROUP BY u.name, MONTH(r.created_at)
//            ORDER BY u.name, month`,
//           [admin_id, selectedYear]
//         );

//         const users = [
//           ...new Set(monthlyUserRecordStatsRaw.map((r) => r.user_name)),
//         ];

//         for (const user of users) {
//           for (let i = 1; i <= 12; i++) {
//             const found = monthlyUserRecordStatsRaw.find(
//               (r) => r.user_name === user && r.month === i
//             );
//             monthly_user_record_stats_admin.push({
//               month: new Date(0, i - 1).toLocaleString("default", {
//                 month: "short",
//               }),
//               user_name: user,
//               record_count: found ? found.record_count : 0,
//             });
//           }
//         }
//       }

//       // ===== DAILY USER RECORD STATS + TOTAL USER RECORD COUNT =====
//       let daily_user_record_stats = [];
//       let total_user_record_count = 0;

//       if (user_id) {
//         const [dailyUserRecordsRaw] = await connection.query(
//           `SELECT
//              DATE(created_at) as record_date,
//              COUNT(*) as record_count
//            FROM records
//            WHERE user_id = ? AND YEAR(created_at) = ?
//            GROUP BY DATE(created_at)
//            ORDER BY record_date`,
//           [user_id, selectedYear]
//         );

//         const [[{ total_user_record_count: count }]] = await connection.query(
//           `SELECT COUNT(*) as total_user_record_count
//            FROM records
//            WHERE user_id = ?`,
//           [user_id]
//         );

//         total_user_record_count = count;

//         // === Create full year date range ===
//         const startDate = new Date(`${selectedYear}-01-01`);
//         const endDate = new Date(`${selectedYear}-12-31`);

//         const dailyUserRecordsMap = new Map();
//         dailyUserRecordsRaw.forEach((r) => {
//           const dateStr = r.record_date.toISOString().split("T")[0];
//           dailyUserRecordsMap.set(dateStr, r.record_count);
//         });

//         let currentDate = new Date(startDate);
//         while (currentDate <= endDate) {
//           const dateStr = currentDate.toISOString().split("T")[0];
//           daily_user_record_stats.push({
//             date: dateStr,
//             record_count: dailyUserRecordsMap.get(dateStr) || 0,
//           });
//           currentDate.setDate(currentDate.getDate() + 1);
//         }
//       }

//       // ===== FINAL RESPONSE =====
//       res.json({
//         success: true,
//         total_admins,
//         total_users,
//         total_records,
//         superadmin_direct_users,
//         superadmin_summary: superadminSummary,
//         admin_detail: adminDetail,
//         selected_year: selectedYear,
//         monthly_creation_stats,
//         monthly_user_record_stats_admin,
//         daily_user_record_stats,
//         total_user_record_count,
//       });
//     });
//   } catch (err) {
//     console.error("Error in getSuperAdminAndAdminDetailsCount:", err);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// done
exports.getSuperAdminAndAdminDetailsCount = async (req, res) => {
  const { admin_id, year, user_id } = req.query;
  const selectedYear = year || moment().year();

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
             WHERE user_id = ? `,
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

      // ===== MONTHLY USER & ADMIN CREATION STATS =====
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

      // ===== MONTHLY RECORD COUNT PER USER UNDER ADMIN =====
      let monthly_user_record_stats_admin = [];

      if (admin_id) {
        const [monthlyUserRecordStatsRaw] = await connection.query(
          `SELECT
             u.name as user_name,
             MONTH(r.created_at) as month,
             COUNT(r.id) as record_count
           FROM users u
           LEFT JOIN records r ON r.user_id = u.id
           WHERE u.admin_id = ? AND YEAR(r.created_at) = ?
           GROUP BY u.name, MONTH(r.created_at)
           ORDER BY u.name, month`,
          [admin_id, selectedYear]
        );

        const users = [
          ...new Set(monthlyUserRecordStatsRaw.map((r) => r.user_name)),
        ];

        for (const user of users) {
          for (let i = 1; i <= 12; i++) {
            const found = monthlyUserRecordStatsRaw.find(
              (r) => r.user_name === user && r.month === i
            );
            monthly_user_record_stats_admin.push({
              month: new Date(0, i - 1).toLocaleString("default", {
                month: "short",
              }),
              user_name: user,
              record_count: found ? found.record_count : 0,
            });
          }
        }
      }

      // ===== DAILY USER RECORD STATS + TOTAL USER RECORD COUNT =====
      let daily_user_record_stats = [];
      let total_user_record_count = 0;

      if (user_id) {
        const [dailyUserRecordsRaw] = await connection.query(
          `SELECT
             DATE(created_at) as record_date,
             COUNT(*) as record_count
           FROM records
           WHERE user_id = ? AND YEAR(created_at) = ?
           GROUP BY DATE(created_at)
           ORDER BY record_date`,
          [user_id, selectedYear]
        );

        daily_user_record_stats = dailyUserRecordsRaw.map((r) => ({
          date: r.record_date,
          record_count: r.record_count,
        }));

        const [[{ total_user_record_count: count }]] = await connection.query(
          `SELECT COUNT(*) as total_user_record_count
           FROM records
           WHERE user_id = ?`,
          [user_id]
        );

        total_user_record_count = count;
      }

      // ===== FINAL RESPONSE =====
      res.json({
        success: true,
        total_admins,
        total_users,
        total_records,
        superadmin_direct_users,
        superadmin_summary: superadminSummary,
        admin_detail: adminDetail,
        selected_year: selectedYear,
        monthly_creation_stats,
        monthly_user_record_stats_admin,
        daily_user_record_stats,
        total_user_record_count,
      });
    });
  } catch (err) {
    console.error("Error in getSuperAdminAndAdminDetailsCount:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getLockStatus = async (req, res) => {
  try {
    const result = await withConnection(async (connection) => {
      const [rows] = await connection.query(
        "SELECT value FROM global_hub_settings WHERE key_name = 'data_entry_disabled' LIMIT 1"
      );
      return rows;
    });

    if (!result.length) {
      return res.status(404).json({ error: "Setting not found" });
    }

    const disabled = result[0].value === "true";

    res.json({ disabled });
  } catch (error) {
    console.error("Error fetching lock status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getLockStatusToggle = async (req, res) => {
  try {
    const { disabled } = req.body;

    if (typeof disabled !== "boolean") {
      return res.status(400).json({ error: "'disabled' must be a boolean" });
    }

    await withConnection(async (connection) => {
      const [result] = await connection.query(
        "UPDATE global_hub_settings SET value = ? WHERE key_name = 'data_entry_disabled'",
        [disabled ? "true" : "false"]
      );

      // Optionally check affectedRows for update success
      if (result.affectedRows === 0) {
        throw new Error("Setting not found or update failed");
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating lock status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};





// app.post('/api/add-record', async (req, res) => {
//   try {
//     const result = await withConnection(async (connection) => {
//       const [rows] = await connection.query(
//         "SELECT value FROM settings WHERE key_name = 'data_entry_disabled' LIMIT 1"
//       );

//       const disabled = rows.length > 0 && rows[0].value === 'true';

//       if ((req.user.role === 'admin' || req.user.role === 'user') && disabled) {
//         return { blocked: true };
//       }

//       const { data } = req.body;
//       if (!data) {
//         return { error: 'Missing required field: data' };
//       }

//       await connection.query(
//         "INSERT INTO records (data) VALUES (?)",
//         [data]
//       );

//       return { success: true };
//     });

//     if (result.blocked) {
//       return res.status(403).json({ error: 'Data entry is disabled by Superadmin' });
//     }

//     if (result.error) {
//       return res.status(400).json({ error: result.error });
//     }

//     res.json({ success: true });

//   } catch (error) {
//     console.error('Error adding record:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
