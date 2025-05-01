require("dotenv").config();
const mongoose = require("mongoose");

// ANSI color codes for output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
};

console.log(`${colors.blue}=== MongoDB Connection Test ====${colors.reset}\n`);

// Get the MongoDB URI from env
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error(
    `${colors.red}Error: MONGO_URI environment variable is not set.${colors.reset}`
  );
  console.log(
    `${colors.yellow}Make sure you have a .env file with MONGO_URI defined.${colors.reset}`
  );
  process.exit(1);
}

// Print connection string (with password redacted)
let redactedUri = mongoUri;
if (mongoUri.includes("@") && mongoUri.includes("://")) {
  const parts = mongoUri.split("@");
  const credentials = parts[0].split("://")[1];
  if (credentials.includes(":")) {
    const username = credentials.split(":")[0];
    redactedUri = mongoUri.replace(credentials, `${username}:****`);
  }
}

console.log(`${colors.cyan}Connection URI:${colors.reset} ${redactedUri}`);

// Test connection
console.log(
  `${colors.yellow}Attempting to connect to MongoDB...${colors.reset}`
);

// Configuration options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds
  connectTimeoutMS: 10000,
};

mongoose
  .connect(mongoUri, options)
  .then(() => {
    console.log(`${colors.green}Connection successful!${colors.reset}`);
    console.log(
      `${colors.blue}Connected to database:${colors.reset} ${mongoose.connection.name}`
    );

    // Test a simple query
    console.log(`${colors.yellow}Testing database query...${colors.reset}`);
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log(`${colors.green}Database query successful!${colors.reset}`);
    console.log(
      `${colors.green}✓ Your MongoDB connection is working correctly.${colors.reset}`
    );
    process.exit(0);
  })
  .catch((err) => {
    console.error(`${colors.red}Connection error:${colors.reset}`, err);

    // Provide helpful troubleshooting advice based on error
    console.log(`\n${colors.magenta}Troubleshooting tips:${colors.reset}`);

    if (err.name === "MongoNetworkError") {
      console.log(
        `${colors.yellow}- Check your network connection and firewall settings${colors.reset}`
      );
      console.log(
        `${colors.yellow}- Make sure your IP address is whitelisted in MongoDB Atlas${colors.reset}`
      );
    } else if (err.name === "MongoServerSelectionError") {
      console.log(
        `${colors.yellow}- Server selection timed out - check if cluster is running${colors.reset}`
      );
      console.log(
        `${colors.yellow}- Verify that your MongoDB Atlas cluster is active${colors.reset}`
      );
    } else if (err.message && err.message.includes("Authentication failed")) {
      console.log(
        `${colors.yellow}- Check your username and password${colors.reset}`
      );
      console.log(
        `${colors.yellow}- Make sure the database user has appropriate permissions${colors.reset}`
      );
    } else if (err.message && err.message.includes("ENOTFOUND")) {
      console.log(
        `${colors.yellow}- The hostname could not be found - check your connection string${colors.reset}`
      );
    }

    console.log(
      `${colors.yellow}- Verify your connection string format:${colors.reset} mongodb+srv://<username>:<password>@<cluster-address>/<database-name>`
    );
    console.log(
      `${colors.yellow}- Check if you're using the correct MongoDB Atlas cluster${colors.reset}`
    );

    process.exit(1);
  });
