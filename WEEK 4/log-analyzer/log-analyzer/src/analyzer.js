function countByLevel(entries) {
  const counts = {};

  entries.forEach(entry => {
    counts[entry.level] = (counts[entry.level] || 0) + 1;
  });

  return counts;
}

function getErrors(entries) {
  return entries.filter(entry => entry.level === "ERROR");
}

function getTopErrors(entries, limit = 5) {
  const errors = getErrors(entries);
  const counts = {};

  errors.forEach(entry => {
    // Normalize error message by removing variable parts
    const key = entry.message.replace(/:\s*\S+/, ": ...");

    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([message, count]) => ({
      message,
      count
    }));
}

function getTimeline(entries) {
  const timeline = {};

  const errors = getErrors(entries);

  errors.forEach(entry => {
    const hour =
      entry.timestamp
        .getUTCHours()
        .toString()
        .padStart(2, "0") + ":00";

    timeline[hour] = (timeline[hour] || 0) + 1;
  });

  return timeline;
}

function getSummary(entries) {
  const levels = countByLevel(entries);
  const topErrors = getTopErrors(entries);
  const timeline = getTimeline(entries);

  const peakHour = Object.entries(timeline)
    .sort((a, b) => b[1] - a[1])[0];

  return {
    total: entries.length,
    levels,
    topErrors,
    timeline,
    peakHour: peakHour
      ? {
          hour: peakHour[0],
          count: peakHour[1]
        }
      : null,
    errorRate:
      entries.length > 0 && levels.ERROR
        ? ((levels.ERROR / entries.length) * 100).toFixed(1)
        : "0.0"
  };
}

module.exports = {
  countByLevel,
  getErrors,
  getTopErrors,
  getTimeline,
  getSummary
};