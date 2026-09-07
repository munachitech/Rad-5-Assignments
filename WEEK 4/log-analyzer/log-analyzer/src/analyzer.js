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
    // Normalize error message (strip the variable part after the last colon)
    const key = entry.message.replace(/:\s*\S+.*$/, ": ...");
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([message, count]) => ({ message, count }));
}

function getTimeline(entries) {
  const timeline = {};

  entries.forEach(entry => {
    const hour = entry.timestamp.getHours().toString().padStart(2, "0") + ":00";
    timeline[hour] = (timeline[hour] || 0) + 1;
  });

  return timeline;
}

/**
 * Timeline restricted to ERROR-level entries, used for "peak error time".
 */
function getErrorTimeline(entries) {
  return getTimeline(getErrors(entries));
}

function getPeriod(entries) {
  if (entries.length === 0) return null;
  const timestamps = entries.map(e => e.timestamp.getTime());
  return {
    from: new Date(Math.min(...timestamps)),
    to: new Date(Math.max(...timestamps))
  };
}

function getSummary(entries) {
  const levels = countByLevel(entries);
  const topErrors = getTopErrors(entries);
  const errorTimeline = getErrorTimeline(entries);
  const period = getPeriod(entries);

  const peakHour = Object.entries(errorTimeline).sort((a, b) => b[1] - a[1])[0];

  return {
    total: entries.length,
    levels,
    topErrors,
    period,
    peakHour: peakHour ? { hour: peakHour[0], count: peakHour[1] } : null,
    errorRate: levels.ERROR ? ((levels.ERROR / entries.length) * 100).toFixed(1) : "0.0"
  };
}

module.exports = {
  countByLevel,
  getErrors,
  getTopErrors,
  getTimeline,
  getErrorTimeline,
  getPeriod,
  getSummary
};
