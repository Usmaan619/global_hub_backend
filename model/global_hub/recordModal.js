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

// model/global_hub/recordModal.js
// exports.getAllRecords = async (
//   userId,
//   role,
//   page = 1,
//   limit = 10,
//   search = ""
// ) => {
//   try {
//     return await withConnection(async (conn) => {
//       let whereClause = "";
//       let joinClause = "";
//       let params = [];
//       let countParams = [];

//       // Validate pagination inputs
//       const safePage = Math.max(1, Number(page) || 1);
//       const safeLimit = Math.max(1, Math.min(1000, Number(limit) || 10)); // cap if needed
//       const offset = (safePage - 1) * safeLimit;

//       // Search filter
//       let searchClause = "";
//       if (search && String(search).trim() !== "") {
//         searchClause = ` AND r.record_no LIKE ?`;
//         params.push(`%${search}%`);
//         countParams.push(`%${search}%`);
//       }

//       // Role-based filters
//       // if (role === "superadmin") {
//       //   whereClause = "1";
//       // } else if (role === "admin") {
//       //   joinClause = "JOIN users u ON r.user_id = u.id";
//       //   whereClause = "u.admin_id = ?";
//       //   params.unshift(userId); // first in params
//       //   countParams.unshift(userId);
//       // } else if (role === "user") {
//       //   whereClause = "r.user_id = ?";
//       //   const uid = Number(userId) || userId; // keep compatibility if column is VARCHAR
//       //   params.unshift(uid);
//       //   countParams.unshift(uid);
//       // } else {
//       //   throw new Error("Invalid role");
//       // }

//       // Role-based filters
//       if (role === "superadmin") {
//         whereClause = "1";
//       } else if (role === "admin") {
//         if (userId === "all" || !userId) {
//           // Admin ke saare users (existing logic)
//           joinClause = "JOIN users u ON r.user_id = u.id";
//           whereClause = "u.admin_id = ?";
//           params.unshift(userId); // admin_id
//           countParams.unshift(userId);
//         } else {
//           // Specific user select kiya hai dropdown se
//           whereClause = "r.user_id = ?";
//           params.unshift(userId); // specific user_id
//           countParams.unshift(userId);
//         }
//       } else if (role === "user") {
//         whereClause = "r.user_id = ?";
//         const uid = Number(userId) || userId;
//         params.unshift(uid);
//         countParams.unshift(uid);
//       }

//       const query = `
//         SELECT r.*
//         FROM records r
//         ${joinClause}
//         WHERE ${whereClause} ${searchClause}
//         ORDER BY r.id DESC
//         LIMIT ? OFFSET ?
//       `;

//       const countQuery = `
//         SELECT COUNT(*) as total
//         FROM records r
//         ${joinClause}
//         WHERE ${whereClause} ${searchClause}
//       `;

//       // Count first (execute is fine)
//       console.log("Executing countQuery:", countQuery);
//       console.log("Count Params:", countParams);
//       const [countRows] = await conn.execute(countQuery, countParams);
//       const total = Number(countRows?.[0]?.total || 0);

//       // Data query params
//       params.push(safeLimit, offset);
//       console.log("Executing query:", query);
//       console.log("Query Params:", params);

//       // Robust fix: use query() for data rows to avoid ER_WRONG_ARGUMENTS on LIMIT/OFFSET
//       const [rows] = await conn.query(query, params);

//       // Alternative fix (if you prefer execute): stringify the LIMIT/OFFSET
//       // const fixedParams = [...params];
//       // fixedParams[fixedParams.length - 2] = String(safeLimit);
//       // fixedParams[fixedParams.length - 1] = String(offset);
//       // const [rows] = await conn.execute(query, fixedParams);

//       return {
//         data: rows,
//         total,
//         page: safePage,
//         limit: safeLimit,
//       };
//     });
//   } catch (error) {
//     console.error("Model:getAllRecords Error:", error);
//     throw new Error("Database error while fetching records");
//   }
// };
exports.getAllRecords = async (
  contextId,
  role,
  scope,
  page = 1,
  limit = 10,
  search = ""
) => {
  try {
    return await withConnection(async (conn) => {
      const safePage = Math.max(1, Number(page) || 1);
      const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
      const offset = (safePage - 1) * safeLimit;

      const joins = [];
      const conditions = [];
      const params = [];

      /* ================= SEARCH ================= */
      if (search?.trim()) {
        conditions.push("r.record_no LIKE ?");
        params.push(`%${search}%`);
      }

      /* ================= ROLE LOGIC ================= */
      switch (role) {
        case "superadmin":
          // ❌ 1=1 ki zarurat hi nahi
          break;

        case "admin":
          joins.push("JOIN users u ON u.id = r.user_id");

          if (scope === "all" || !scope) {
            conditions.push("u.admin_id = ?");
            params.push(Number(contextId));
          } else {
            conditions.push("r.user_id = ?");
            params.push(Number(scope));
          }
          break;

        case "user":
          conditions.push("r.user_id = ?");
          params.push(Number(contextId));
          break;

        default:
          throw new Error("Invalid role");
      }

      const whereSQL = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      const joinSQL = joins.join(" ");

      /* ================= COUNT ================= */
      const countQuery = `
        SELECT COUNT(*) as total
        FROM records r
        ${joinSQL}
        ${whereSQL}
      `;

      const [[{ total }]] = await conn.execute(countQuery, params);

      /* ================= DATA ================= */
      const dataQuery = `
        SELECT r.*
        FROM records r
        ${joinSQL}
        ${whereSQL}
        ORDER BY r.id DESC
        LIMIT ? OFFSET ?
      `;

      const dataParams = [...params, safeLimit, offset];
      const [rows] = await conn.execute(dataQuery, dataParams);

      return {
        data: rows,
        total,
        page: safePage,
        limit: safeLimit,
      };
    });
  } catch (err) {
    console.error("Model:getAllRecords", err);
    throw err;
  }
};


