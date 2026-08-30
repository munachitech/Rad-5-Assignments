import { delay } from "./delay.js";

export async function retry(operation, retries = 3, backoff = 2, onRetry) {
  let attempt = 1;

  while (true) {
    try {
      return await operation(attempt);
    } catch (error) {
      if (attempt > retries) {
        throw error;
      }

      const waitTime = 1000 * Math.pow(backoff, attempt - 1);

      if (onRetry) {
        onRetry(error, attempt, waitTime);
      }

      await delay(waitTime);
      attempt++;
    }
  }
}
