const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db.config");
const notesRoutes = require("./routes/notes.routes");
const assistantRoutes = require("./routes/assistant.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/quick-notes", notesRoutes);
app.use("/quick-notes/assistant", assistantRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
