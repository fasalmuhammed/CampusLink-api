// Load environment variables from a .env file
require("dotenv").config();

// Import necessary modules and libraries
const express = require("express");
const path = require("path");
const app = express();
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");

// Set the port for the server to run on, defaulting to 3500 if not provided in environment variables
const PORT = process.env.PORT || 3500;

// Connect to the MongoDB database
connectDB();

// Use a custom logger middleware for logging requests
app.use(logger);

// Enable Cross-Origin Resource Sharing (CORS) with specified options
app.use(cors(corsOptions));

// Parse incoming JSON requests
app.use(express.json());

// Parse cookies attached to incoming requests
app.use(cookieParser());

// Serve static files from the "public" directory for requests to the root ("/")
app.use("/", express.static("public"));

// Define routes for different parts of the application
app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/department", require("./routes/departmentRoutes"));
app.use("/semester", require("./routes/semesterRoutes"));
app.use("/student", require("./routes/studentRoutes"));
app.use("/teacher", require("./routes/teacherRoutes"));
app.use("/paper", require("./routes/paperRoutes"));
app.use("/time_schedule", require("./routes/timeScheduleRoutes"));
app.use("/attendance", require("./routes/attendanceRoutes"));
app.use("/internal", require("./routes/internalRoutes"));
app.use("/notes", require("./routes/notesRoutes"));
app.use("/announce", require("./routes/announceRoutes"));

// Handle 404 errors for all other routes
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Use the custom error handling middleware
app.use(errorHandler);

// Listen for the MongoDB connection to open
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  // Start the server and listen on the specified port
  app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
});

// Listen for MongoDB connection errors
mongoose.connection.on("error", (err) => {
  console.log(err);
  // Log MongoDB connection errors to a file
  logEvents(
    `${err.no}:${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});

// Listen for uncaught exceptions (errors not handled by try-catch blocks)
mongoose.connection.on("uncaughtException", function (err) {
  console.log(err);
});
