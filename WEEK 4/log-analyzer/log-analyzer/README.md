# log-analyzer

CLI tool that parses, aggregates, and reports errors and trends from log files.

## Setup

```
npm install    # no runtime deps, but sets things up
node generate-logs.js
```

## Usage

```
node index.js <command> <log-file-or-directory>
```

Accepts either a single `.log` file or a directory containing `.log` files.

### Commands

| Command      | Description                          |
|--------------|---------------------------------------|
| `count`      | Count entries by log level            |
| `errors`     | List all ERROR entries                |
| `top-errors` | Most common error messages (normalized) |
| `timeline`   | ERROR counts by hour, with peak hour  |
| `report`     | Full summary report                   |

### Examples

```
node index.js count logs/app.log
node index.js errors logs/app.log
node index.js top-errors logs/app.log
node index.js timeline logs/app.log
node index.js report logs/app.log

# directory mode: analyzes every .log file in the folder
node index.js report logs/
```

## Log format

```
<ISO-8601 timestamp> [LEVEL] message
```

Example:

```
2026-08-17T10:30:15.789Z [ERROR] Database connection failed: timeout
```

## Project structure

```
log-analyzer/
├── src/
│   ├── parser.js       # parse log lines / files / directories
│   ├── analyzer.js      # counting, top errors, timeline, summary
│   ├── reporter.js      # console output formatting
│   └── cli.js            # argument parsing and command dispatch
├── logs/
│   └── app.log           # sample log file (generate with generate-logs.js)
├── generate-logs.js       # sample log generator
├── index.js               # entry point
├── package.json
└── README.md
```

## Error handling

- Missing command → usage printed, exits with code 1
- Missing path argument → error message, exits with code 1
- Path does not exist → error message, exits with code 1
- Directory with no `.log` files → error message, exits with code 1
- Unrecognized command → error message + usage, exits with code 1
- Malformed log lines are silently skipped by the parser (they don't match the expected format)
