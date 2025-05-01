const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db.config");
const notesRoutes = require("./routes/notes.routes");
const assistantRoutes = require("./routes/assistant.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Configure CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (doesn't require DB)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Connect to MongoDB without blocking server start
let isDbConnected = false;
connectDB()
  .then((connection) => {
    isDbConnected = !!connection;

    if (isDbConnected) {
      console.log("MongoDB connection established - all features enabled");
    } else {
      console.log(
        "Server running in limited mode - database features disabled"
      );
    }
  })
  .catch((err) => {
    console.error("Failed initial MongoDB connection attempt:", err);
    console.log("Server running in limited mode - database features disabled");
  });

// Database connection middleware
const requireDbConnection = (req, res, next) => {
  if (!isDbConnected) {
    return res.status(503).json({
      error: "Database connection unavailable",
      message:
        "The server is currently unable to connect to the database. Please try again later.",
    });
  }
  next();
};

// Routes
app.use("/auth", requireDbConnection, authRoutes);
app.use("/quick-notes", requireDbConnection, notesRoutes);
app.use("/quick-notes/assistant", requireDbConnection, assistantRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...", err);
  // Don't immediately exit in development to see the error
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...", err);
  // Don't immediately exit in development to see the error
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});
