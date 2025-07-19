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
