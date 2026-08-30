import readline from "node:readline";
import { fetchUsers } from "./sources/users.js";
import { fetchProducts } from "./sources/products.js";
import { fetchOrders } from "./sources/orders.js";
import { fetchReviews } from "./sources/reviews.js";
import { fetchAllSources } from "./pipeline/fetcher.js";
import { pipeline, runPipeline } from "./pipeline/transforms.js";
import { generateReport } from "./pipeline/reporter.js";

const sources = [
  { name: "users", fetch: fetchUsers, failureRate: 0.2 },
  { name: "products", fetch: fetchProducts, failureRate: 0.1 },
  { name: "orders", fetch: fetchOrders, failureRate: 0.3 },
  { name: "reviews", fetch: fetchReviews, failureRate: 0.15 }
];

const options = {
  retries: 3,
  timeout: 5000,
  backoff: 2
};

let currentData = {};
let lastReport = "No report has been generated yet.";
let lastFetchResults = {
  total: 0,
  successful: 0,
  failed: 0,
  successfulNames: [],
  failedNames: [],
  totalTime: 0
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    if (rl.closed) {
      resolve("5");
      return;
    }

    rl.question(question, answer => resolve(answer.trim()));
  });
}

function showMenu() {
  console.log(`
=== Async Data Pipeline Manager ===

1. Run full pipeline
2. Fetch data only
3. Process existing data
4. View last report
5. Exit
`);
}

async function runFullPipeline() {
  console.log("\nStarting full pipeline...\n");

  const fetchResults = await fetchAllSources(sources, options);
  lastFetchResults = fetchResults;
  currentData = fetchResults.data;

  console.log(`
=== Fetch Results ===
Total: ${fetchResults.total} sources
Successful: ${fetchResults.successful} (${fetchResults.successfulNames.join(", ") || "none"})
Failed: ${fetchResults.failed} (${fetchResults.failedNames.join(", ") || "none"})
Total time: ${fetchResults.totalTime}ms
`);

  const startProcessing = Date.now();

  currentData = await runPipeline(
    currentData,
    pipeline,
    "sequential"
  );

  const processingTime = Date.now() - startProcessing;

  lastReport = generateReport(
    currentData,
    lastFetchResults,
    processingTime
  );

  console.log(lastReport);
}

async function fetchDataOnly() {
  console.log("\nFetching all data sources...\n");

  const fetchResults = await fetchAllSources(sources, options);
  lastFetchResults = fetchResults;
  currentData = fetchResults.data;

  console.log(`
=== Fetch Results ===
Total: ${fetchResults.total} sources
Successful: ${fetchResults.successful} (${fetchResults.successfulNames.join(", ") || "none"})
Failed: ${fetchResults.failed} (${fetchResults.failedNames.join(", ") || "none"})
Total time: ${fetchResults.totalTime}ms
`);
}

async function processExistingData() {
  if (Object.keys(currentData).length === 0) {
    console.log("\nNo existing data. Please fetch data first.\n");
    return;
  }

  const mode = await ask(
    "Choose processing mode (1 = sequential, 2 = parallel): "
  );

  const selectedMode = mode === "2" ? "parallel" : "sequential";
  const startProcessing = Date.now();

  try {
    currentData = await runPipeline(
      currentData,
      pipeline,
      selectedMode
    );

    const processingTime = Date.now() - startProcessing;

    lastReport = generateReport(
      currentData,
      lastFetchResults,
      processingTime
    );

    console.log(lastReport);
  } catch (error) {
    console.error(`\nProcessing failed: ${error.message}\n`);
  }
}

async function startApp() {
  console.log("=== Async Data Pipeline Manager ===");

  while (true) {
    showMenu();

    const choice = await ask("Choose an option: ");

    try {
      if (choice === "1") {
        await runFullPipeline();
      } else if (choice === "2") {
        await fetchDataOnly();
      } else if (choice === "3") {
        await processExistingData();
      } else if (choice === "4") {
        console.log(lastReport);
      } else if (choice === "5") {
        console.log("\nGoodbye!");
        rl.close();
        break;
      } else {
        console.log("\nInvalid option. Please choose 1-5.\n");
      }
    } catch (error) {
      console.error(`\nPipeline error: ${error.message}\n`);
    }
  }
}

export { startApp };
