function formatNumber(num) {
  return num.toLocaleString();
}

function formatPercent(part, total) {
  if (total === 0) return "0%";
  return ((part / total) * 100).toFixed(0) + "%";
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDateTime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
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
  console.log(`${"Total".padEnd(8)} ${formatNumber(total).padStart(8)} entries`);
}

function printErrors(errors) {
  console.log("=== Errors Found ===\n");
  errors.forEach((entry, i) => {
    console.log(`${i + 1}. [${formatDateTime(entry.timestamp)}] ${entry.message}`);
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
    console.log(`${i + 1}. ${item.message.padEnd(45)} (${item.count} times)`);
  });
}

function printTimeline(timeline, label = "Errors by Hour") {
  console.log(`=== ${label} ===`);

  const values = Object.values(timeline);
  if (values.length === 0) {
    console.log("No data.");
    return;
  }
  const maxCount = Math.max(...values);

  const sortedHours = Object.entries(timeline).sort((a, b) => a[0].localeCompare(b[0]));

  sortedHours.forEach(([hour, count]) => {
    const bar = "█".repeat(Math.max(1, Math.ceil((count / maxCount) * 20)));
    console.log(`${hour}  ${bar.padEnd(20)}  ${count}`);
  });

  const peak = sortedHours.sort((a, b) => b[1] - a[1])[0];
  console.log(`\nPeak error time: ${peak[0]} (${peak[1]} errors)`);
}

function printReport(summary, targetPath) {
  console.log("====================================");
  console.log("      LOG ANALYSIS REPORT");
  console.log("====================================\n");

  console.log(`File: ${targetPath}`);
  if (summary.period) {
    console.log(`Period: ${formatDate(summary.period.from)} to ${formatDate(summary.period.to)}`);
  }
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
      console.log(`  ${i + 1}. ${item.message.slice(0, 40)} (${item.count}x)`);
    });
  }

  if (summary.peakHour) {
    console.log(`\nPeak Error Hour: ${summary.peakHour.hour} (${summary.peakHour.count} errors)`);
  }

  const errorRate = parseFloat(summary.errorRate);
  const status =
    errorRate > 10 ? "🔴 HIGH ERROR RATE" : errorRate > 5 ? "🟡 MODERATE" : "🟢 NORMAL";
  console.log(`\nStatus: ${status} (${summary.errorRate}%)`);
  console.log("====================================");
}

module.exports = {
  formatNumber,
  formatPercent,
  formatDate,
  formatDateTime,
  printCountReport,
  printErrors,
  printTopErrors,
  printTimeline,
  printReport
};
