const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // Increase timeout to 15 seconds
      socketTimeoutMS: 45000, // Increase socket timeout
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maximum number of sockets to keep open
      heartbeatFrequencyMS: 30000, // Check server status every 30 seconds
    });

    console.log("✅ Connected to MongoDB Atlas!");

    // Monitor connection
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected! Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected!");
    });

    return mongoose.connection;
  } catch (err) {
    console.error("❌ Error connecting to MongoDB Atlas:", err);
    console.log(
      "Connection string format should be: mongodb+srv://username:password@cluster.mongodb.net/database"
    );
    // Don't exit the process immediately - allow server to run in offline mode
    return null;
  }
};

module.exports = connectDB;
