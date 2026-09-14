function exportToCSV(data) {
  return data.map(row => row.join(",")).join("\n");
}

module.exports = exportToCSV;