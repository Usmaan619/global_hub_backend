const express = require("express");
const bodyParser = require("body-parser");
const globalRoutes = require("./routes/global_hub/globalRoutes");
const authRoutes = require("./routes/global_hub/authRoutes");
const { errorHandler } = require("./middlewares/errorHandler");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;

const { connectToDatabase } = require("./config/dbConnection");

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Allow specific origins or all origins
app.use(
  cors({
    origin: "*", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true, // If you need to allow credentials (e.g., cookies)
  })
);

// Routes
app.use("/api/global_hub", globalRoutes);
// Auth Routes
app.use("/api/global_hub/auth", authRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}
startServer();
