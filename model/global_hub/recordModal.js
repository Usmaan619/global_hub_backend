const { withConnection } = require("../../utils/helper");
const moment = require("moment");

// exports.createRecord = async (recordData) => {
//   try {
//     return await withConnection(async (conn) => {
//       const columns = Object.keys(recordData).join(",");
//       const placeholders = Object.keys(recordData)
//         .map(() => "?")
//         .join(",");
//       const values = Object.values(recordData);

//       const query = `INSERT INTO records (${columns}) VALUES (${placeholders})`;
//       const [result] = await conn.execute(query, values);
//       return result.insertId;
//     });
//   } catch (error) {
//     console.error("Model:createRecord Error:", error, moment().format());
//     throw new Error("Database error while creating record");
//   }
// };

// exports.getAllRecords = async () => {
//   try {
//     return await withConnection(async (conn) => {
//       const [rows] = await conn.execute("SELECT * FROM records");
//       return rows;
//     });
//   } catch (error) {
//     console.error("Model:getAllRecords Error:", error, moment().format());
//     throw new Error("Database error while fetching records");
//   }
// };

// exports.updateRecord = async (id, updateData) => {
//   try {
//     return await withConnection(async (conn) => {
//       const setClause = Object.keys(updateData)
//         .map((key) => `${key} = ?`)
//         .join(", ");
//       const values = [...Object.values(updateData), id];

//       const query = `UPDATE records SET ${setClause} WHERE id = ?`;
//       const [result] = await conn.execute(query, values);
//       return result;
//     });
//   } catch (error) {
//     console.error("Model:updateRecord Error:", error, moment().format());
//     throw new Error("Database error while updating record");
//   }
// };

// exports.deleteRecord = async (id) => {
//   try {
//     return await withConnection(async (conn) => {
//       const [result] = await conn.execute("DELETE FROM records WHERE id = ?", [
//         id,
//       ]);
//       return result;
//     });
//   } catch (error) {
//     console.error("Model:deleteRecord Error:", error, moment().format());
//     throw new Error("Database error while deleting record");
//   }
// };

// CREATE
exports.createRecord = async (data) => {
  try {
    return await withConnection(async (conn) => {
      const query = `
        INSERT INTO records (
          user_id, admin_id, record_no, lead_no, applicant_first_name,
          applicant_last_name, street_address, city, zip_code, applicant_dob,
          co_applicant_first_name, co_applicant_last_name, best_time_to_call,
          personal_remark, type_of_property, property_value, mortgage_type,
          loan_amount, loan_term, interest_type, monthly_installment,
          existing_loan, annual_income, down_payment, asset_remark,
          lender_name, loan_officer_first_name, loan_officer_last_name,
          tr_number, ni_number, occupation, other_income, credit_card_type,
          credit_score, official_remark
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `;

      const values = Object.values({
        user_id: data.user_id,
        admin_id: data.admin_id,
        record_no: data.record_no,
        lead_no: data.lead_no,
        applicant_first_name: data.applicant_first_name,
        applicant_last_name: data.applicant_last_name,
        street_address: data.street_address,
        city: data.city,
        zip_code: data.zip_code,
        applicant_dob: data.applicant_dob,
        co_applicant_first_name: data.co_applicant_first_name,
        co_applicant_last_name: data.co_applicant_last_name,
        best_time_to_call: data.best_time_to_call,
        personal_remark: data.personal_remark,
        type_of_property: data.type_of_property,
        property_value: data.property_value,
        mortgage_type: data.mortgage_type,
        loan_amount: data.loan_amount,
        loan_term: data.loan_term,
        interest_type: data.interest_type,
        monthly_installment: data.monthly_installment,
        existing_loan: data.existing_loan,
        annual_income: data.annual_income,
        down_payment: data.down_payment,
        asset_remark: data.asset_remark,
        lender_name: data.lender_name,
        loan_officer_first_name: data.loan_officer_first_name,
        loan_officer_last_name: data.loan_officer_last_name,
        tr_number: data.tr_number,
        ni_number: data.ni_number,
        occupation: data.occupation,
        other_income: data.other_income,
        credit_card_type: data.credit_card_type,
        credit_score: data.credit_score,
        official_remark: data.official_remark,
      }).map((v) => (v === undefined ? null : v)); // Replace undefined with null

      const [result] = await conn.execute(query, values);
      return result.insertId;
    });
  } catch (error) {
    console.error("Model:createRecord Error:", error, moment().format());
    throw new Error("Database error while creating record");
  }
};

// exports.getAllRecords = async (id) => {
//   try {
//     return await withConnection(async (conn) => {
//       const [rows] = await conn.execute(
//         "SELECT * FROM records WHERE user_id = ? ORDER BY id DESC",
//         [id]
//       );
//       return rows;
//     });
//   } catch (error) {
//     console.error("Model:getAllRecords Error:", error, moment().format());
//     throw new Error("Database error while fetching records");
//   }
// };
exports.getRecordById = async (id) => {
  try {
    return await withConnection(async (conn) => {
      const [rows] = await conn.execute("SELECT * FROM records WHERE id = ?", [
        id,
      ]);
      return rows[0] || null;
    });
  } catch (error) {
    console.error("Model:getRecordById Error:", error, moment().format());
    throw new Error("Database error while fetching record by ID");
  }
};
exports.updateRecord = async (id, updateData) => {
  try {
    return await withConnection(async (conn) => {
      // Add updated_at field
      updateData.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

      const setClause = Object.keys(updateData)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = [...Object.values(updateData), id];

      const query = `UPDATE records SET ${setClause} WHERE id = ?`;
      const [result] = await conn.execute(query, values);
      return result?.affectedRows > 0;
    });
  } catch (error) {
    console.error("Model:updateRecord Error:", error, moment().format());
    throw new Error("Database error while updating record");
  }
};

exports.deleteRecord = async (id) => {
  try {
    return await withConnection(async (conn) => {
      const [result] = await conn.execute("DELETE FROM records WHERE id = ?", [
        id,
      ]);
      return result?.affectedRows > 0;
    });
  } catch (error) {
    console.error("Model:deleteRecord Error:", error, moment().format());
    throw new Error("Database error while deleting record");
  }
};
// exports.getAllRecords = async (userId, role) => {
//   try {
//     return await withConnection(async (conn) => {
//       let query = "";
//       let params = [];

//       if (role === "superadmin") {
//         // Superadmin gets all records
//         query = `SELECT * FROM records ORDER BY id DESC`;
//       } else if (role === "admin") {
//         // Admin gets records of users under them
//         query = `
//           SELECT r.*
//           FROM records r
//           JOIN users u ON r.user_id = u.id
//           WHERE u.admin_id = ?
//           ORDER BY r.id DESC
//         `;
//         params = [userId];
//       } else if (role === "user") {
//         // Normal user gets only their own records
//         query = `
//           SELECT * FROM records
//           WHERE user_id = ?
//           ORDER BY id DESC
//         `;
//         params = [userId];
//       } else {
//         throw new Error("Invalid role");
//       }

//       const [rows] = await conn.execute(query, params);
//       return rows;
//     });
//   } catch (error) {
//     console.error("Model:getAllRecords Error:", error);
//     throw new Error("Database error while fetching records");
//   }
// };

exports.deleteRecordsByUserId = async (userId) => {
  try {
    return await withConnection(async (conn) => {
      const [result] = await conn.execute(
        "DELETE FROM records WHERE user_id = ?",
        [userId]
      );
      return result?.affectedRows > 0;
    });
  } catch (error) {
    console.error(
      "Model:deleteRecordsByUserId Error:",
      error,
      moment().format()
    );
    throw new Error("Database error while deleting user's records");
  }
};

// exports.getAllRecords = async (userId, role, page = 1, limit = 10) => {
//   try {
//     return await withConnection(async (conn) => {
//       let query = "";
//       let params = [];

//       // Calculate offset
//       const offset = (page - 1) * limit;

//       if (role === "superadmin") {
//         // Superadmin gets all records
//         query = `
//           SELECT * FROM records
//           ORDER BY id DESC
//           LIMIT ? OFFSET ?
//         `;
//         params = [limit, offset];
//       } else if (role === "admin") {
//         // Admin gets records of users under them
//         query = `
//           SELECT r.*
//           FROM records r
//           JOIN users u ON r.user_id = u.id
//           WHERE u.admin_id = ?
//           ORDER BY r.id DESC
//           LIMIT ? OFFSET ?
//         `;
//         params = [userId, limit, offset];
//       } else if (role === "user") {
//         // Normal user gets only their own records
//         query = `
//           SELECT * FROM records
//           WHERE user_id = ?
//           ORDER BY id DESC
//           LIMIT ? OFFSET ?
//         `;
//         params = [userId, limit, offset];
//       } else {
//         throw new Error("Invalid role");
//       }

//       const [rows] = await conn.execute(query, params);
//       return rows;
//     });
//   } catch (error) {
//     console.error("Model:getAllRecords Error:", error);
//     throw new Error("Database error while fetching records");
//   }
// };
exports.getAllRecords = async (userId, role, page = 1, limit = 10, search = "") => {
  try {
    return await withConnection(async (conn) => {
      let whereClause = "";
      let joinClause = "";
      let params = [];
      let countParams = [];

      const offset = (page - 1) * limit;

      // Add search filter (optional)
      let searchClause = "";
      if (search) {
        searchClause = ` AND r.record_no LIKE ?`;
        params.push(`%${search}%`);
        countParams.push(`%${search}%`);
      }

      if (role === "superadmin") {
        whereClause = "1";
      } else if (role === "admin") {
        joinClause = "JOIN users u ON r.user_id = u.id";
        whereClause = "u.admin_id = ?";
        params.unshift(userId); // for both SELECT and COUNT
        countParams.unshift(userId);
      } else if (role === "user") {
        whereClause = "r.user_id = ?";
        params.unshift(userId);
        countParams.unshift(userId);
      } else {
        throw new Error("Invalid role");
      }

      const query = `
        SELECT r.*
        FROM records r
        ${joinClause}
        WHERE ${whereClause} ${searchClause}
        ORDER BY r.id DESC
        LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM records r
        ${joinClause}
        WHERE ${whereClause} ${searchClause}
      `;

      const [countRows] = await conn.execute(countQuery, countParams);
      const total = countRows[0].total;

      params.push(limit, offset);
      const [rows] = await conn.execute(query, params);

      return {
        data: rows,
        total,
        page,
        limit,
      };
    });
  } catch (error) {
    console.error("Model:getAllRecords Error:", error);
    throw new Error("Database error while fetching records");
  }
};
