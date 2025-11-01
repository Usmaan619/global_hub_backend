const recordModel = require("../../model/global_hub/recordModal");
const moment = require("moment");
const { withConnection } = require("../../utils/helper");
const axios = require("axios");

// exports.createRecord = async (req, res) => {
//   try {
//     const id = await recordModel.createRecord(req?.body);
//     res.status(201).json({ message: " created", id });
//   } catch (error) {
//     console.error("Controller:createRecord Error:", error, moment().format());
//     res.status(500).json({ message: "Server error while creating record" });
//   }
// };

exports.createRecord = async (req, res) => {
  try {
    const { recaptcha_token } = req.body;
    console.log("req.body: ", req.body);
    console.log("recaptchaToken: ", recaptcha_token);

    // Step 1: reCAPTCHA verification
    let score = "";
    if (recaptcha_token) {
      const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
      const params = new URLSearchParams();
      params.append("secret", "6LdLof0rAAAAAD5JnaDbHzl4F6PbA6-tgqoJaJh-"); // Replace with your secret key
      params.append("response", recaptcha_token);

      const { data: result } = await axios.post(verifyUrl, params);
      console.log("result: ", result);
      score = result.score
      if (!result.success || (result.score && result.score < 0.5)) {
        return res.status(403).json({
          success: false,
          message: "reCAPTCHA verification failed",
          verified: false,
          data: result,
        });
      }
    }

    //  Step 2: Record save to DB
    const id = await recordModel.createRecord(req.body);

    return res.status(201).json({
      message: "Record created successfully",
      id,
      verified: recaptcha_token ? true : false, // frontend ko batata hai captcha hua ya nahi
      score,
    });
  } catch (error) {
    console.error("Controller:createRecord Error:", error, moment().format());
    res.status(500).json({ message: "Server error while creating record" });
  }
};

exports.getAllRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const record = await recordModel.getAllRecords(
      req?.query.id,
      req?.query.role,
      page,
      limit,
      search
    );
    res.json({ success: true, record });
  } catch (error) {
    console.error("Controller:getAllRecords Error:", error, moment().format());
    res.status(500).json({ message: "Server error while fetching records" });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const id = req.params.id;
    delete req.body.image;
    const result = await recordModel.updateRecord(id, req.body);
    if (result) res.json({ success: true, message: "Record updated", result });
  } catch (error) {
    console.error("Controller:updateRecord Error:", error, moment().format());
    res
      .status(500)
      .json({ success: false, message: "Server error while updating record" });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await recordModel.deleteRecord(id);
    res.json({ success: true, message: "Record deleted", result });
  } catch (error) {
    console.error("Controller:deleteRecord Error:", error, moment().format());
    res
      .status(500)
      .json({ success: false, message: "Server error while deleting record" });
  }
};

exports.deleteRecordsByUserId = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await recordModel.deleteRecordsByUserId(id);
    res.json({ success: true, message: "Record deleted", result });
  } catch (error) {
    console.error("Controller:deleteRecord Error:", error, moment().format());
    res
      .status(500)
      .json({ success: false, message: "Server error while deleting record" });
  }
};

exports.deleteCurrentMonthRecords = async (req, res) => {
  try {
    return await withConnection(async (conn) => {
      const user = req.user;

      //  Only superadmin can delete
      if (user.role !== "superadmin") {
        return res
          .status(403)
          .json({ message: "Access denied: Superadmin only." });
      }

      //  Get current month's start and end in SQL datetime format
      const startDate = moment().startOf("month").format("YYYY-MM-DD HH:mm:ss");
      const endDate = moment().endOf("month").format("YYYY-MM-DD HH:mm:ss");

      //  Delete records between those dates

      const result = await conn.query(
        "DELETE FROM records WHERE created_at >= ? AND created_at <= ?",
        [startDate, endDate]
      );
      return res.status(200).json({
        message: ` ${
          result.affectedRows
        } record(s) deleted for ${moment().format("MMMM YYYY")}.`,
      });
    });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: " Server error." });
  }
};

//  const payload = {
//       user_id: req?.body?.id,
//       admin_id: req?.body?.id,
//       record_no: req?.body?.recordNo,
//       lead_no: req?.body?.leadNo,
//       applicant_first_name: req?.body?.applicantFirstName,
//       applicant_last_name: req?.body?.applicantLastName,
//       street_address: req?.body?.streetAddress,
//       city: req?.body?.city,
//       zip_code: req?.body?.zipCode,
//       applicant_dob: req?.body?.applicantDOB,
//       co_applicant_first_name: req?.body?.coApplicantFirstName,
//       co_applicant_last_name: req?.body?.coApplicantLastName,
//       best_time_to_call: req?.body?.bestTimeToCall,
//       personal_remark: req?.body?.personalRemark,
//       type_of_property: req?.body?.typeOfProperty,
//       property_value: req?.body?.propertyValue,
//       mortgage_type: req?.body?.mortgageType,
//       loan_amount: req?.body?.loanAmount,
//       loan_term: req?.body?.loanTerm,
//       interest_type: req?.body?.interestType,
//       monthly_installment: req?.body?.monthlyInstallment,
//       existing_loan: req?.body?.existingLoan,
//       annual_income: req?.body?.annualIncome,
//       down_payment: req?.body?.downPayment,
//       asset_remark: req?.body?.assetRemark,
//       lender_name: req?.body?.lenderName,
//       loan_officer_first_name: req?.body?.loanOfficerFirstName,
//       loan_officer_last_name: req?.body?.loanOfficerLastName,
//       tr_number: req?.body?.trNumber,
//       ni_number: req?.body?.niNumber,
//       occupation: req?.body?.occupation,
//       other_income: req?.body?.otherIncome,
//       credit_card_type: req?.body?.creditCardType,
//       credit_score: req?.body?.creditScore,
//       official_remark: req?.body?.officialRemark,
//       created_at: req?.body?.createdAt,
//       updated_at: req?.body?.updatedAt,
//     }
