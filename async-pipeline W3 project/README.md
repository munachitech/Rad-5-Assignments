# Async Data Pipeline Manager

A beginner-friendly Node.js CLI project demonstrating Week 3 asynchronous JavaScript concepts.

## Concepts Used

- Promises
- async/await
- setTimeout
- Promise.allSettled
- Promise.all
- try/catch error handling
- Timeout handling
- Retry logic
- Exponential backoff
- Sequential processing
- Parallel processing
- ES6 modules
- Timestamped logging
- Partial-failure handling

## Project Structure

```text
async-pipeline/
├── src/
│   ├── sources/
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── reviews.js
│   ├── pipeline/
│   │   ├── fetcher.js
│   │   ├── transforms.js
│   │   └── reporter.js
│   ├── utils/
│   │   ├── delay.js
│   │   ├── logger.js
│   │   └── retry.js
│   └── app.js
├── index.js
├── package.json
└── README.md
```

## How to Run

Make sure Node.js is installed.

```bash
cd async-pipeline
node index.js
```

Or:

```bash
npm start
```

## Retry Behaviour

The default configuration is:

- Timeout: 5000ms
- Retries: 3
- Backoff multiplier: 2

The wait times are:

- After attempt 1: 1000ms
- After attempt 2: 2000ms
- After attempt 3: 4000ms

A source is allowed its initial attempt plus 3 retries.

## Important Note

The source failures are random. Running the program again can produce a different result. A failed source does not stop the other sources or prevent a partial report from being generated.
