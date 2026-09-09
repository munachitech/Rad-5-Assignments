const fs = require("fs");

const levels = ["INFO", "WARN", "ERROR", "DEBUG"];

const messages = {
  INFO: [
    "User logged in",
    "Request processed",
    "Cache hit",
    "Database query executed"
  ],

  WARN: [
    "Slow query detected",
    "Memory usage high",
    "Rate limit approaching",
    "Deprecated API called"
  ],

  ERROR: [
    "Database connection failed: timeout",
    "Authentication failed: invalid credentials",
    "Memory limit exceeded: 512MB",
    "File not found: /uploads/image.jpg"
  ],

  DEBUG: [
    "Entering function",
    "Variable value",
    "API response received",
    "Cache cleared"
  ]
};

function generateLogEntry() {
  const level =
    levels[Math.floor(Math.random() * levels.length)];

  const msgs = messages[level];

  const msg =
    msgs[Math.floor(Math.random() * msgs.length)];

  const timestamp = new Date().toISOString();

  return `${timestamp} [${level}] ${msg}`;
}

if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

const entries = Array.from(
  { length: 100 },
  generateLogEntry
).join("\n");

fs.writeFileSync("logs/sample.log", entries);

console.log("Generated logs/sample.log with 100 entries");