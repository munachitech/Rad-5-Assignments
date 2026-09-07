const fs = require("fs");
const path = require("path");

/**
 * Parse a single log line into { timestamp, level, message }.
 * Format: <ISO timestamp> [LEVEL] message
 * Returns null if the line doesn't match.
 */
function parseLogLine(line) {
  const match = line.match(/^(\S+)\s+\[(\w+)\]\s+(.+)$/);

  if (!match) return null;

  const timestamp = new Date(match[1]);
  if (isNaN(timestamp.getTime())) return null;

  return {
    timestamp,
    level: match[2].toUpperCase(),
    message: match[3]
  };
}

/**
 * Parse a single log file into an array of entries.
 */
function parseLogFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n").filter(line => line.trim());

  return lines
    .map(parseLogLine)
    .filter(entry => entry !== null);
}

/**
 * Given a path that may be a single .log file or a directory of .log files,
 * return the list of log file paths to parse.
 */
function resolveLogFiles(targetPath) {
  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    return fs
      .readdirSync(targetPath)
      .filter(name => path.extname(name) === ".log")
      .sort()
      .map(name => path.join(targetPath, name));
  }

  return [targetPath];
}

/**
 * Parse a path (file or directory) into a combined, chronologically
 * sorted array of entries.
 */
function parseLogPath(targetPath) {
  const files = resolveLogFiles(targetPath);

  const entries = files.flatMap(file => parseLogFile(file));
  entries.sort((a, b) => a.timestamp - b.timestamp);

  return { entries, files };
}

module.exports = { parseLogLine, parseLogFile, resolveLogFiles, parseLogPath };
