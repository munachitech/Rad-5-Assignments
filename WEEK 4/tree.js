#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function walkDirectory(dir, prefix = "", currentDepth = 0, maxDepth = Infinity, ignore = []) {
  let files = 0;
  let dirs = 0;
  let totalSize = 0;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const filteredEntries = entries.filter((entry) => !ignore.includes(entry.name));

  filteredEntries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;

    return a.name.localeCompare(b.name);
  });

  filteredEntries.forEach((entry, index) => {
    const isLast = index === filteredEntries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const childPrefix = isLast ? "    " : "│   ";

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      console.log(`${prefix}${connector}📁 ${entry.name}/`);

      dirs++;

      if (currentDepth < maxDepth) {
        const result = walkDirectory(
          fullPath,
          prefix + childPrefix,
          currentDepth + 1,
          maxDepth,
          ignore
        );

        files += result.files;
        dirs += result.dirs;
        totalSize += result.totalSize;
      }
    } else {
      const stats = fs.statSync(fullPath);
      const size = formatSize(stats.size);

      console.log(`${prefix}${connector}${entry.name.padEnd(20)} ${size}`);

      files++;
      totalSize += stats.size;
    }
  });

  return { files, dirs, totalSize };
}

// Get command-line arguments
const targetDir = process.argv[2] || ".";

const depthArgument = process.argv.find((arg) => arg.startsWith("--depth="));
const ignoreArgument = process.argv.find((arg) => arg.startsWith("--ignore="));

const maxDepth = depthArgument
  ? Number(depthArgument.split("=")[1])
  : Infinity;

const ignore = ignoreArgument
  ? ignoreArgument.split("=")[1].split(",")
  : [];

// Check that the directory exists
if (!fs.existsSync(targetDir)) {
  console.error(`Directory not found: ${targetDir}`);
  process.exit(1);
}

// Check that the path is actually a directory
if (!fs.statSync(targetDir).isDirectory()) {
  console.error(`Not a directory: ${targetDir}`);
  process.exit(1);
}

// Display the root directory
console.log(`📁 ${path.basename(path.resolve(targetDir))}/`);

// Walk through the directory
const result = walkDirectory(
  targetDir,
  "",
  0,
  maxDepth,
  ignore
);

// Display summary
console.log("");

console.log(
  `Total: ${result.files} files (${formatSize(result.totalSize)})`
);

console.log(`Total: ${result.dirs} directories`);