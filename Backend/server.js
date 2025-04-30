const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db.config");
const notesRoutes = require("./routes/notes.routes");
const assistantRoutes = require("./routes/assistant.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/auth", authRoutes); 
app.use("/quick-notes", notesRoutes);
app.use("/quick-notes/assistant", assistantRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 8080; // Changed default port to 8080
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
