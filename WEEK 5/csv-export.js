function exportToCSV(data) {
  return data.map(row => row.join(",")).join("\n");
}

function addCSVHeader(header) {
  return header.join(",");
}

module.exports = {
  exportToCSV,
  addCSVHeader
};