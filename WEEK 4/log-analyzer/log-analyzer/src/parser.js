const fs = require("fs");

function parseLogLine(line) {
  const match = line.match(/^(\S+)\s+\[(\w+)\]\s+(.+)$/);

  if (!match) return null;

  const timestamp = new Date(match[1]);

  if (isNaN(timestamp.getTime())) {
    return null;
  }

  return {
    timestamp,
    level: match[2].toUpperCase(),
    message: match[3]
  };
}

function parseLogFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  const lines = content
    .split(/\r?\n/)
    .filter(line => line.trim());

  return lines
    .map(parseLogLine)
    .filter(entry => entry !== null);
}

module.exports = {
  parseLogLine,
  parseLogFile
};