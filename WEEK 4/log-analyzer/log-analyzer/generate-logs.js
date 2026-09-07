const fs = require("fs");
const path = require("path");

const levels = ["INFO", "WARN", "ERROR", "DEBUG"];
const messages = {
  INFO: [
    "User logged in: ada@example.com",
    "Request processed",
    "Cache hit",
    "Database query executed",
    "Server started on port 3000",
    "Connection restored"
  ],
  WARN: [
    "Slow query detected: 2500ms",
    "Memory usage high: 85%",
    "Rate limit approaching",
    "Deprecated API called"
  ],
  ERROR: [
    "Database connection failed: timeout",
    "Authentication failed for user: john@example.com",
    "Memory limit exceeded: 512MB",
    "File not found: /uploads/report.pdf",
    "Rate limit exceeded"
  ],
  DEBUG: [
    "Entering function processRequest",
    "Variable value: 42",
    "API response received",
    "Cache cleared"
  ]
};

// Weighted so the level distribution roughly matches the sample output in the spec
const weightedLevels = [
  ...Array(70).fill("INFO"),
  ...Array(20).fill("WARN"),
  ...Array(7).fill("ERROR"),
  ...Array(3).fill("DEBUG")
];

function generateLogEntry(baseTime, offsetSeconds) {
  const level = weightedLevels[Math.floor(Math.random() * weightedLevels.length)];
  const msgs = messages[level];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  const timestamp = new Date(baseTime.getTime() + offsetSeconds * 1000).toISOString();

  return `${timestamp} [${level}] ${msg}`;
}

function generateLogs(count, startTime, spacingSeconds) {
  const entries = [];
  for (let i = 0; i < count; i++) {
    entries.push(generateLogEntry(startTime, i * spacingSeconds));
  }
  return entries.join("\n");
}

const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Spread ~1758 entries across a couple of days, every ~5 seconds, to
// exercise the timeline / peak-hour features realistically.
const start = new Date("2026-08-17T10:30:00.000Z");
const content = generateLogs(1758, start, 5);

fs.writeFileSync(path.join(logsDir, "app.log"), content);
console.log(`Generated logs/app.log with 1758 entries`);
