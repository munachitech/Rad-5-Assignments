export function generateReport(data, fetchResults, processingTime) {
  const orderCount = data.orders?.length || 0;
  const totalRevenue = data.stats?.totalRevenue || 0;
  const averageOrder = orderCount > 0
    ? (totalRevenue / orderCount).toFixed(2)
    : "0.00";

  return `
====================================
      DATA PIPELINE REPORT
====================================

Fetch Summary:
  Sources attempted: ${fetchResults.total}
  Successful: ${fetchResults.successful}
  Failed: ${fetchResults.failed}
  Successful sources: ${fetchResults.successfulNames.join(", ") || "None"}
  Failed sources: ${fetchResults.failedNames.join(", ") || "None"}
  Total fetch time: ${fetchResults.totalTime}ms

Data Summary:
  Users: ${data.users?.length || 0}
  Products: ${data.products?.length || 0}
  Orders: ${data.orders?.length || 0}
  Reviews: ${data.reviews?.length || 0}

${data.stats ? `Statistics:
  Total Users: ${data.stats.totalUsers}
  Total Products: ${data.stats.totalProducts}
  Total Revenue: $${data.stats.totalRevenue}
  Average Order: $${averageOrder}
` : ""}

Processing Time: ${processingTime}ms
Status: ${fetchResults.failed === 0 ? "COMPLETE" : "PARTIAL"}
====================================
`;
}
