
// PART A: Callback / Async Task Simulation


// Returns a Promise that resolves after the given duration
function delay(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}


// Logs a message after a specified delay
function logWithTimestamp(message, delayMs) {
  setTimeout(() => {
    console.log(`[${delayMs}ms] ${message}`);
  }, delayMs);
}


// Simulates multiple asynchronous tasks
// All tasks start at the same time.
// Each task completes after its own duration.
function simulateTasks(tasks) {
  // Log all tasks as started immediately
  tasks.forEach((task) => {
    console.log(`[0ms] Task "${task.name}" started`);
  });

  // Schedule each task to complete after its duration
  tasks.forEach((task) => {
    setTimeout(() => {
      console.log(
        `[${task.duration}ms] Task "${task.name}" completed`
      );
    }, task.duration);
  });
}


// Example usage for Part A
console.log("==== PART A ====");

logWithTimestamp("Task 1 started", 0);
logWithTimestamp("Task 1 done", 1000);

simulateTasks([
  { name: "Download file", duration: 2000 },
  { name: "Process data", duration: 1000 },
  { name: "Upload result", duration: 1500 }
]);


// PART B: Promise Queue

class PromiseQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }

  // Adds an async task to the queue
  // Returns a Promise that resolves when THIS task completes
  add(taskFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        taskFn,
        resolve,
        reject
      });

      // Start processing the queue
      this.process();
    });
  }

  // Processes tasks one at a time
  async process() {
    // Prevent multiple queue processors from running
    if (this.running) {
      return;
    }

    this.running = true;

    // Continue until the queue is empty
    while (this.queue.length > 0) {
      const task = this.queue.shift();

      try {
        // Wait for the current task to finish
        const result = await task.taskFn();

        // Resolve the Promise returned by add()
        task.resolve(result);
      } catch (error) {
        // Reject the Promise if the task fails
        task.reject(error);
      }
    }

    this.running = false;
  }
}


// Example usage for Part B
setTimeout(() => {
  console.log("\n========== PART B ==========");

  const queue = new PromiseQueue();

  queue
    .add(() => {
      console.log("Task 1 starts");

      return delay(1000).then(() => {
        return "Task 1 done";
      });
    })
    .then((result) => {
      console.log(result);
    });

  queue
    .add(() => {
      console.log("Task 2 starts");

      return delay(500).then(() => {
        return "Task 2 done";
      });
    })
    .then((result) => {
      console.log(result);
    });

  queue
    .add(() => {
      console.log("Task 3 starts");

      return delay(1500).then(() => {
        return "Task 3 done";
      });
    })
    .then((result) => {
      console.log(result);
    });
}, 2500);
