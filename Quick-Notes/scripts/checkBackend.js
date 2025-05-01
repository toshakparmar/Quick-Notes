const http = require("http");

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

console.log(
  `${colors.blue}=== Quick Notes Backend Connection Check ===${colors.reset}`
);
console.log(`${colors.yellow}Checking if backend is running...${colors.reset}`);

// Check commonly used ports
const ports = [8080, 3001, 5000, 8000];

for (const port of ports) {
  checkPort(port);
}

function checkPort(port) {
  const options = {
    host: "localhost",
    port: port,
    path: "/",
    method: "GET",
    timeout: 2000,
  };

  const req = http.request(options, (res) => {
    console.log(
      `${colors.green}✓ Server found at http://localhost:${port}${colors.reset}`
    );

    if (port !== 8080) {
      console.log(
        `${colors.yellow}However, your frontend is configured to use port 8080.${colors.reset}`
      );
      console.log(
        `${colors.yellow}Consider updating API_BASE_URL in apiService.js to use http://localhost:${port}${colors.reset}`
      );
    }
  });

  req.on("error", (e) => {
    console.log(
      `${colors.red}✗ No server found at http://localhost:${port}${colors.reset}`
    );
  });

  req.on("timeout", () => {
    console.log(
      `${colors.yellow}⚠ Timeout checking http://localhost:${port}${colors.reset}`
    );
    req.abort();
  });

  req.end();
}

// Display helpful info
setTimeout(() => {
  console.log("\n");
  console.log(`${colors.blue}=== Troubleshooting Tips ===${colors.reset}`);
  console.log(
    `${colors.yellow}1. Make sure your backend server is running${colors.reset}`
  );
  console.log(
    `   To start the backend server, navigate to the Backend directory and run:`
  );
  console.log(
    `   ${colors.green}npm start${colors.reset} or ${colors.green}node server.js${colors.reset}`
  );
  console.log(`${colors.yellow}2. Check for port conflicts${colors.reset}`);
  console.log(`   Your backend might be running on a different port.`);
  console.log(
    `${colors.yellow}3. Verify your API URL configuration${colors.reset}`
  );
  console.log(`   Current API URL is set to: http://localhost:8080`);
  console.log(`   Update this in src/services/apiService.js if needed`);
}, 3000);
