const fs = require("fs");
const { parseLogPath } = require("./parser");
const {
  countByLevel,
  getErrors,
  getTopErrors,
  getTimeline,
  getErrorTimeline,
  getSummary
} = require("./analyzer");
const {
  printCountReport,
  printErrors,
  printTopErrors,
  printTimeline,
  printReport
} = require("./reporter");

function printUsage() {
  console.log("Usage: node index.js <command> <log-file-or-directory>\n");
  console.log("Commands:");
  console.log("  count       Count entries by log level");
  console.log("  errors      List all errors");
  console.log("  top-errors  Show most common errors");
  console.log("  timeline    Show errors over time");
  console.log("  report      Full analysis report");
}

function run(argv) {
  const [command, ...args] = argv;

  if (!command) {
    printUsage();
    process.exit(1);
  }

  const target = args[0];

  if (!target) {
    console.error("Error: Please provide a log file or directory path");
    process.exit(1);
  }

  if (!fs.existsSync(target)) {
    console.error(`Error: Path not found: ${target}`);
    process.exit(1);
  }

  let entries, files;
  try {
    ({ entries, files } = parseLogPath(target));
  } catch (err) {
    console.error(`Error reading logs: ${err.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`Error: No .log files found in ${target}`);
    process.exit(1);
  }

  switch (command) {
    case "count": {
      const counts = countByLevel(entries);
      printCountReport(counts, entries.length);
      break;
    }

    case "errors": {
      const errors = getErrors(entries);
      printErrors(errors);
      break;
    }

    case "top-errors": {
      const topErrors = getTopErrors(entries);
      printTopErrors(topErrors);
      break;
    }

    case "timeline": {
      const timeline = getErrorTimeline(entries);
      printTimeline(timeline, "Errors by Hour");
      break;
    }

    case "report": {
      const summary = getSummary(entries);
      printReport(summary, target);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

module.exports = { run, printUsage };
