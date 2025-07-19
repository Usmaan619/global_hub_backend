const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();
const dbConfig = {
  host: process.env.DB_HOST, // Your MySQL host (usually 'localhost' for local databases)
  user: process.env.DB_USER, // Your MySQL username
  password: process.env.DB_PASSWORD, // Your MySQL password
  database: process.env.DB_DATABASE, // The name of your MySQL database
  port: process.env.DB_PORT,
};

console.log("dbConfig:----------- ", dbConfig);
async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (err) {
    console.error("Error connecting to MySQL:----------", err);
    process.exit(1);
  }
}

module.exports = { connectToDatabase };
