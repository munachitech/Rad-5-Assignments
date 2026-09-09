const fs = require("fs");
const path = require("path");

const { parseLogFile } = require("./parser");

const {
  countByLevel,
  getErrors,
  getTopErrors,
  getTimeline,
  getSummary
} = require("./analyzer");

const {
  printCountReport,
  printErrors,
  printTopErrors,
  printTimeline,
  printReport,
  printJsonReport
} = require("./reporter");

function getLogFiles(inputPath) {
  const fullPath = path.resolve(inputPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`Error: File or directory not found: ${inputPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(fullPath);

  if (stats.isFile()) {
    return [fullPath];
  }

  if (stats.isDirectory()) {
    return fs
      .readdirSync(fullPath)
      .filter(file => file.endsWith(".log"))
      .map(file => path.join(fullPath, file));
  }

  return [];
}

function loadEntries(inputPath) {
  const files = getLogFiles(inputPath);

  if (files.length === 0) {
    console.error("Error: No .log files found.");
    process.exit(1);
  }

  let entries = [];

  files.forEach(file => {
    entries = entries.concat(parseLogFile(file));
  });

  return entries;
}

function parseOptions(args) {
  const options = {};

  args.forEach(arg => {
    if (arg.startsWith("--level=")) {
      options.level = arg.split("=")[1].toUpperCase();
    }

    if (arg.startsWith("--from=")) {
      options.from = arg.split("=")[1];
    }

    if (arg.startsWith("--to=")) {
      options.to = arg.split("=")[1];
    }

    if (arg.startsWith("--output=")) {
      options.output = arg.split("=")[1];
    }
  });

  return options;
}

function filterEntries(entries, options) {
  return entries.filter(entry => {
    if (options.level && entry.level !== options.level) {
      return false;
    }

    if (options.from) {
      const fromDate = new Date(options.from);

      if (entry.timestamp < fromDate) {
        return false;
      }
    }

    if (options.to) {
      const toDate = new Date(options.to);

      toDate.setUTCDate(toDate.getUTCDate() + 1);

      if (entry.timestamp >= toDate) {
        return false;
      }
    }

    return true;
  });
}

function run(command, inputPath, args) {
  const options = parseOptions(args);

  let entries = loadEntries(inputPath);

  entries = filterEntries(entries, options);

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
      const timeline = getTimeline(entries);
      printTimeline(timeline);
      break;
    }

    case "report": {
      const summary = getSummary(entries);

      printReport(summary, inputPath);

      if (options.output) {
        printJsonReport(summary, options.output);
      }

      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

function watchFile(filePath) {
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`Watching ${filePath} for new log entries...`);
  console.log("Press Ctrl+C to stop.\n");

  let lastSize = fs.statSync(fullPath).size;

  fs.watch(fullPath, () => {
    const currentSize = fs.statSync(fullPath).size;

    if (currentSize > lastSize) {
      const stream = fs.createReadStream(fullPath, {
        start: lastSize,
        end: currentSize
      });

      let newData = "";

      stream.on("data", chunk => {
        newData += chunk.toString();
      });

      stream.on("end", () => {
        const lines = newData.split(/\r?\n/);

        lines
          .map(line => require("./parser").parseLogLine(line))
          .filter(entry => entry !== null)
          .forEach(entry => {
            console.log(
              `[${entry.timestamp.toISOString()}] [${entry.level}] ${entry.message}`
            );
          });

        lastSize = currentSize;
      });
    }
  });
}

module.exports = {
  run,
  watchFile
};