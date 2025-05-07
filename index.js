const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ApiError = require("./utils/apiError");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { initWhatsapp } = require("./utils/whatsappClient"); // Import WhatsApp client
dotenv.config({});
const authRoute = require("./routes/auth.route");
const staffRoute = require("./routes/staff.route");
const branchRoute = require("./routes/branch.route");
const patientRoute = require("./routes/patient.route");
const scanRoute = require("./routes/scan.route");
const globalError = require("./middlewares/globalError");

// Connect to MongoDB
connectDB();

// Initialize WhatsApp client
// initWhatsapp()
//   .then(() => console.log("WhatsApp client initialized successfully"))
//   .catch((err) => console.error("Failed to initialize WhatsApp client:", err));

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true); // Accept all origins
  },
  credentials: true, // Allow credentials (cookies)
};

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Apis
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/staff", staffRoute);
app.use("/api/v1/branches", branchRoute);
app.use("/api/v1/patients", patientRoute);
app.use("/api/v1/scans", scanRoute);

app.use(globalError);

app.listen(8080, () => {
  console.log(`Server is running on http://localhost:8080`);
});
