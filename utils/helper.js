const nodemailer = require("nodemailer");
const { connectToDatabase } = require("../config/dbConnection");
const jwt = require('jsonwebtoken');

const createEmailTransporter = async () => {
  try {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.SMTP_SIW_USER,
        pass: process.env.SMTP_SIW_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });
  } catch (error) {
    console.log("error:createEmailTransporter ", error);
    throw error;
  }
};

const withConnection = async (callback) => {
  const connection = await connectToDatabase(); // Assume this establishes a DB connection
  try {
    return await callback(connection);
  } catch (err) {
    console.error("Error in withConnection:---------------------", err);
    connection.destroy(); // Destroy the connection if an error occurs
    throw err; // Rethrow the error for higher-level handling
  } finally {
    if (connection && connection.state !== "disconnected") {
      connection.end(); // Gracefully end the connection if no errors occurred
    }
  }
};

// Function to calculate profit
const calculateProfit = (sellingPrice, purchase_price, product_quantity) => {
  const purchasingPrice = product_quantity * purchase_price;

  const profitPrice = sellingPrice - purchasingPrice;

  return profitPrice;
};

const shortenUUID = (uuid) => {
  const cleanUuid = uuid.replace(/-/g, "");
  return cleanUuid.substring(0, 5);
};

// const kgArray = ["5KG", "10KG", "15KG", "20KG"];
// const ltrArray = ["5LTR", "10LTR", "15LTR", "20LTR"];
const extractIntegers = (arr) =>
  arr.map((item) => parseInt(item.match(/\d+/)[0]));

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = {
  createEmailTransporter,
  withConnection,
  calculateProfit,
  connectToDatabase,
  shortenUUID,
  extractIntegers,
  generateToken,
};
