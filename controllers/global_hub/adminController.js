const adminModel = require("../../model/global_hub/adminModal");
const moment = require("moment");

const ExcelJS = require("exceljs");
const { withConnection } = require("../../utils/helper");

// Create Admin
exports.createAdmin = async (req, res) => {
  try {
    const id = await adminModel.createAdmin(req.body);
    return res.status(201).json({ message: "Admin created successfully", id });
  } catch (error) {
    console.error("Controller:createAdmin Error:", error, moment().format());
    return res.status(500).json({
      message: "Server error while creating admin",
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
    });
  }
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await adminModel.getAllAdmins();
    return res.json(admins);
  } catch (error) {
    console.error("Controller:getAllAdmins Error:", error, moment().format());
    return res.status(500).json({
      message: "Server error while fetching admins",
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
    });
  }
};

// Update Admin
exports.updateAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await adminModel.updateAdmin(id, req.body);
    return res.json({ message: "Admin updated", result });
  } catch (error) {
    console.error("Controller:updateAdmin Error:", error, moment().format());
    return res.status(500).json({
      message: "Server error while updating admin",
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
    });
  }
};

// Delete Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await adminModel.deleteAdmin(id);
    return res.json({ success: true, message: "Admin deleted", result });
  } catch (error) {
    console.error("Controller:deleteAdmin Error:", error, moment().format());
    return res.status(500).json({
      message: "Server error while deleting admin",
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
      success: false,
    });
  }
};

exports.createUserByAdmin = async (req, res) => {
  try {
    const id = await adminModel.createUserByAdmin(req.body);
    return res.status(201).json({ message: "Admin created successfully", id });
  } catch (error) {
    console.error("Controller:createAdmin Error:", error, moment().format());
    return res.status(500).json({
      message: "Server error while creating admin",
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
    });
  }
};

exports.getUsersByRoleAndId = async (req, res) => {
  try {
    const { role, id } = req.query;

    const user = await adminModel.getUsersByRoleAndId(role, id);
    return res
      .status(201)
      .json({ message: "Admin created successfully", success: true, user });
  } catch (error) {
    console.error("Controller:createAdmin Error:", error, moment().format());
    return res.status(500).json({
      message: "Server error while creating admin",
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
    });
  }
};

exports.updateAdminThree = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await adminModel.updateAdminThree(id, req.body);
    return res.json({ success: true, message: "Admin updated", result });
  } catch (error) {
    console.error("Controller:updateAdmin Error:", error, moment().format());
    return res.status(500).json({
      message: "Server error while updating admin",
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
      success: false,
    });
  }
};

// download CSV

exports.downloadUserRecordsExcel = async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "user_id is required",
    });
  }

  try {
    const records = await withConnection(async (connection) => {
      const [rows] = await connection.execute(
        `SELECT * FROM records WHERE user_id = ?`,
        [userId]
      );
      return rows;
    });

    if (records.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No records found for this user_id" });
    }

    // Create Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`User ${userId} Records`);

    // Define headers
    worksheet.columns = [
      { header: "Index", key: "idx", width: 10 },
      { header: "ID", key: "id", width: 10 },
      { header: "User ID", key: "user_id", width: 10 },
      { header: "Admin ID", key: "admin_id", width: 10 },
      { header: "Record No", key: "record_no", width: 15 },
      { header: "Lead No", key: "lead_no", width: 15 },
      {
        header: "Applicant First Name",
        key: "applicant_first_name",
        width: 20,
      },
      { header: "Applicant Last Name", key: "applicant_last_name", width: 20 },
      { header: "Street Address", key: "street_address", width: 25 },
      { header: "City", key: "city", width: 15 },
      { header: "Zip Code", key: "zip_code", width: 10 },
      { header: "Applicant DOB", key: "applicant_dob", width: 15 },
      {
        header: "Co-Applicant First Name",
        key: "co_applicant_first_name",
        width: 20,
      },
      {
        header: "Co-Applicant Last Name",
        key: "co_applicant_last_name",
        width: 20,
      },
      { header: "Best Time to Call", key: "best_time_to_call", width: 20 },
      { header: "Personal Remark", key: "personal_remark", width: 25 },
      { header: "Type of Property", key: "type_of_property", width: 20 },
      { header: "Property Value", key: "property_value", width: 15 },
      { header: "Mortgage Type", key: "mortgage_type", width: 20 },
      { header: "Loan Amount", key: "loan_amount", width: 15 },
      { header: "Loan Term", key: "loan_term", width: 15 },
      { header: "Interest Type", key: "interest_type", width: 20 },
      { header: "Monthly Installment", key: "monthly_installment", width: 20 },
      { header: "Existing Loan", key: "existing_loan", width: 15 },
      { header: "Annual Income", key: "annual_income", width: 15 },
      { header: "Down Payment", key: "down_payment", width: 15 },
      { header: "Asset Remark", key: "asset_remark", width: 25 },
      { header: "Lender Name", key: "lender_name", width: 20 },
      {
        header: "Loan Officer First Name",
        key: "loan_officer_first_name",
        width: 20,
      },
      {
        header: "Loan Officer Last Name",
        key: "loan_officer_last_name",
        width: 20,
      },
      { header: "TR Number", key: "tr_number", width: 15 },
      { header: "NI Number", key: "ni_number", width: 15 },
      { header: "Occupation", key: "occupation", width: 20 },
      { header: "Other Income", key: "other_income", width: 15 },
      { header: "Credit Card Type", key: "credit_card_type", width: 20 },
      { header: "Credit Score", key: "credit_score", width: 15 },
      { header: "Official Remark", key: "official_remark", width: 25 },
      { header: "Created At", key: "created_at", width: 20 },
      { header: "Updated At", key: "updated_at", width: 20 },
    ];

    records.forEach((record, i) => {
      worksheet.addRow({
        idx: i + 1, // Add custom index
        ...record,
      });
    });
    // Send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=user_${userId}_records.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting user records:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to export records" });
  }
};

exports.deleteAutoDetect = async (req, res) => {
  const { role, id } = req.body;

  // Step 1: Validate input
  if (!role || !id) {
    return res.status(400).json({ message: "Role and ID are required" });
  }

  // Step 2: Map roles to their tables
  const validRoles = {
    superadmin: "super_admins",
    admin: "admins",
    user: "users",
  };

  const table = validRoles[role];
  if (!table) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const deletedRows = await withConnection(async (conn) => {
      // Step 3: Delete related records if role is user or admin
      if (role === "user") {
        await conn.execute(`DELETE FROM records WHERE user_id = ?`, [id]);
      } else if (role === "admin") {
        await conn.execute(`DELETE FROM records WHERE user_id = ?`, [id]);
      }

      // Step 4: Delete from role's own table
      const [res] = await conn.execute(`DELETE FROM ${table} WHERE id = ?`, [
        id,
      ]);
      return res.affectedRows;
    });

    if (deletedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    }

    res.status(200).json({
      success: true,
      message: `${role} with ID ${id} and related records deleted successfully.`,
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
