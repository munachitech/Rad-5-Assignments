
// Calculate the delay before the next retry
function calculateDelay(attempt, baseDelay, backoffMultiplier) {
  const exponentialDelay =
    baseDelay * Math.pow(backoffMultiplier, attempt);

  // Add random jitter between 0% and 10%
  const jitter = exponentialDelay * 0.1 * Math.random();

  return Math.round(exponentialDelay + jitter);
}


// RetryableOperation class
class RetryableOperation {
  constructor(options = {}) {
    this.maxRetries = options.retries || 3;
    this.baseDelay = options.delay || 1000;
    this.backoff = options.backoff || 2;
    this.onRetry = options.onRetry || null;
  }

  async execute(fn) {
    let lastError;

    // Try the function, plus the allowed retries
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Try running the function
        const result = await fn();

        // If it succeeds, return the result
        return result;
      } catch (error) {
        lastError = error;

        // If this was the final attempt, stop retrying
        if (attempt === this.maxRetries) {
          break;
        }

        // Calculate the delay before the next retry
        const delay = calculateDelay(
          attempt,
          this.baseDelay,
          this.backoff
        );

        // Run the retry callback if one was provided
        if (this.onRetry) {
          this.onRetry(attempt + 1, error, delay);
        }

        // Wait before trying again
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // If every attempt failed, throw the final error
    throw new Error(
      `All ${this.maxRetries} retries failed: ${lastError.message}`
    );
  }
}


// Fetch a URL with retry
async function fetchWithRetry(url) {
  const retryable = new RetryableOperation({
    retries: 3,
    delay: 1000,
    backoff: 2,

    onRetry: (attempt, error, delay) => {
      console.log(`Attempt ${attempt} failed: ${error.message}`);
      console.log(`Retrying in ${delay}ms...`);
    }
  });

  return retryable.execute(async () => {
    console.log("Trying request...");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  });
}


// Test the retry utility
async function main() {
  try {
    const result = await fetchWithRetry(
      "https://jsonplaceholder.typicode.com/invalid"
    );

    console.log("Success:", result);
  } catch (error) {
    console.error("Final error:", error.message);
  }
}

main();