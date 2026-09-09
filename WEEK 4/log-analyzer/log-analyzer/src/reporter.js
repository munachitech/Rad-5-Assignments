const fs = require("fs");

function formatNumber(num) {
  return num.toLocaleString();
}

function formatPercent(part, total) {
  if (total === 0) return "0%";

  return ((part / total) * 100).toFixed(0) + "%";
}

function printCountReport(counts, total) {
  console.log("=== Log Level Counts ===");

  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([level, count]) => {
      console.log(
        `${level.padEnd(8)} ${formatNumber(count).padStart(8)} (${formatPercent(count, total)})`
      );
    });

  console.log(
    `${"Total".padEnd(8)} ${formatNumber(total).padStart(8)}`
  );
}

function printErrors(errors) {
  console.log("=== Errors Found ===\n");

  if (errors.length === 0) {
    console.log("No errors found.");
    return;
  }

  errors.forEach((entry, i) => {
    console.log(
      `${i + 1}. [${entry.timestamp.toISOString().slice(0, 19)}] ${entry.message}`
    );
  });

  console.log(`\nTotal: ${errors.length} errors found`);
}

function printTopErrors(topErrors) {
  console.log("=== Most Common Errors ===");

  if (topErrors.length === 0) {
    console.log("No errors found.");
    return;
  }

  topErrors.forEach((item, i) => {
    console.log(
      `${i + 1}. ${item.message.padEnd(40)} (${item.count} times)`
    );
  });
}

function printTimeline(timeline) {
  console.log("=== Errors by Hour ===");

  if (Object.keys(timeline).length === 0) {
    console.log("No errors found.");
    return;
  }

  const maxCount = Math.max(...Object.values(timeline));

  Object.entries(timeline)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([hour, count]) => {
      const bar = "█".repeat(
        Math.ceil((count / maxCount) * 20)
      );

      console.log(`${hour}  ${bar}  ${count}`);
    });
}

function printReport(summary, filePath) {
  console.log("====================================");
  console.log("      LOG ANALYSIS REPORT");
  console.log("====================================\n");

  console.log(`File: ${filePath}`);
  console.log(`Total entries: ${formatNumber(summary.total)}\n`);

  console.log("Level Breakdown:");

  Object.entries(summary.levels)
    .sort((a, b) => b[1] - a[1])
    .forEach(([level, count]) => {
      console.log(
        `  ${level.padEnd(8)} ${formatNumber(count).padStart(8)} (${formatPercent(count, summary.total)})`
      );
    });

  if (summary.topErrors.length > 0) {
    console.log("\nTop Errors:");

    summary.topErrors.slice(0, 3).forEach((item, i) => {
      console.log(
        `  ${i + 1}. ${item.message.slice(0, 40)} (${item.count}x)`
      );
    });
  }

  if (summary.peakHour) {
    console.log(
      `\nPeak Error Hour: ${summary.peakHour.hour} (${summary.peakHour.count} errors)`
    );
  }

  const errorRate = parseFloat(summary.errorRate);

  const status =
    errorRate > 10
      ? "🔴 HIGH ERROR RATE"
      : errorRate > 5
      ? "🟡 MODERATE"
      : "🟢 NORMAL";

  console.log(`\nStatus: ${status} (${summary.errorRate}%)`);
  console.log("====================================");
}

function printJsonReport(summary, outputPath) {
  fs.writeFileSync(
    outputPath,
    JSON.stringify(summary, null, 2)
  );

  console.log(`Report exported to ${outputPath}`);
}

module.exports = {
  printCountReport,
  printErrors,
  printTopErrors,
  printTimeline,
  printReport,
  printJsonReport
};