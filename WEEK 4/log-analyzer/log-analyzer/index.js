#!/usr/bin/env node

const { run, watchFile } = require("./src/cli");

const [, , command, ...args] = process.argv;

if (!command) {
  console.log("Usage: node index.js <command> <file-or-directory>\n");

  console.log("Commands:");
  console.log("  count       Count entries by log level");
  console.log("  errors      List all errors");
  console.log("  top-errors  Show most common errors");
  console.log("  timeline    Show errors over time");
  console.log("  report      Full analysis report");
  console.log("  watch       Watch a log file for new entries");

  console.log("\nOptions:");
  console.log("  --level=ERROR");
  console.log("  --from=2026-08-17");
  console.log("  --to=2026-08-18");
  console.log("  --output=report.json");

  process.exit(1);
}

if (command === "watch") {
  const filePath = args[0];

  if (!filePath) {
    console.error("Error: Please provide a log file path");
    process.exit(1);
  }

  watchFile(filePath);
} else {
  const inputPath = args[0];

  if (!inputPath) {
    console.error("Error: Please provide a log file or directory path");
    process.exit(1);
  }

  run(command, inputPath, args.slice(1));
}