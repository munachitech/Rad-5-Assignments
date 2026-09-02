import { log, logError } from "../utils/logger.js";
import { retry } from "../utils/retry.js";

function withTimeout(promise, timeout) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), timeout);
    })
  ]);
}

export async function fetchWithRetry(source, options = {}) {
  const { retries = 3, timeout = 5000, backoff = 2 } = options;

  try {
    return await retry(
      async attempt => {
        const startTime = Date.now();
        log(`Fetching ${source.name}... (attempt ${attempt})`);

        const data = await withTimeout(source.fetch(), timeout);
        const elapsed = Date.now() - startTime;

        log(`${source.name}: Success (${elapsed}ms)`);

        return {
          name: source.name,
          data,
          success: true,
          attempts: attempt,
          time: elapsed
        };
      },
      retries,
      backoff,
      (error, attempt, waitTime) => {
        const message = error instanceof Error ? error.message : String(error);
        logError(`${source.name}: Failed - ${message}`);
        log(`${source.name}: Retrying in ${waitTime}ms... (attempt ${attempt + 1})`);
      }
    );
  } catch (error) {
    //makes sure we have a a readable error message.
    const message = error instanceof Error ? error.message : String(error);
    logError(`${source.name}: Failed after all retries - ${message}`);

    const finalError = new Error(`${source.name}: ${message}`);
    finalError.sourceName = source.name;
    throw finalError;
  }
}

export async function fetchAllSources(sources, options = {}) {
  const startTime = Date.now();

  const results = await Promise.allSettled(
    sources.map(source => fetchWithRetry(source, options))
  );

  const totalTime = Date.now() - startTime;

  return summarizeResults(results, sources, totalTime);
}

function summarizeResults(results, sources, totalTime) {
  const successfulNames = [];
  const failedNames = [];
  const data = {};

  results.forEach((result, index) => {
    const sourceName = sources[index].name;

    if (result.status === "fulfilled") {
      successfulNames.push(sourceName);
      data[sourceName] = result.value.data;
    } else {
      failedNames.push(sourceName);
    }
  });

  return {
    results,
    total: results.length,
    successful: successfulNames.length,
    failed: failedNames.length,
    successfulNames,
    failedNames,
    totalTime,
    data
  };
}
