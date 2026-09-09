Shoot!

What the project does

It's a command-line tool that reads log files (timestamped lines like [INFO], [WARN], [ERROR]) and answers questions about them: how many of each severity level, what the errors were, which errors repeat most, and when errors spiked. You run it as node index.js <command> <path> and it prints a formatted report to the terminal.

Here's every file, in the order the code actually runs.

package.json

Metadata, not logic. Tells Node the project's name, version, entry file (index.js), and defines shortcuts (npm start runs node index.js, npm run generate runs generate-logs.js). No external libraries — only Node's built-in fs and path modules are used anywhere in the project.

generate-logs.js

Not part of the CLI itself — a helper script that manufactures fake log data so you have something to test with.

Has arrays of sample messages for each level (INFO/WARN/ERROR/DEBUG).
weightedLevels is a trick to control realistic proportions — it's an array with 70 copies of "INFO", 20 of "WARN", etc., so picking randomly from it naturally gives ~70% INFO, ~7% ERROR, matching the ratios in the assignment's sample output.
generateLogEntry() picks a random level, a random message for that level, and stamps it with a timestamp.
generateLogs() loops that 1,758 times, spacing each entry 5 seconds apart starting from a fixed date.
Writes the result to logs/app.log.
src/parser.js — turns raw text into data
parseLogLine(line): takes one line of text like 2026-08-17T10:30:15.789Z [ERROR] Database connection failed: timeout and uses a regex to split it into three pieces — timestamp, level, message — returning { timestamp, level, message } as a proper object. Returns null if the line doesn't match the expected shape (so junk lines get silently skipped).
parseLogFile(filePath): reads one file with fs.readFileSync, splits it into lines, runs every line through parseLogLine, and throws away the nulls.
resolveLogFiles(targetPath): checks with fs.statSync whether the given path is a file or a folder. If it's a folder, it lists everything inside with fs.readdirSync and keeps only files ending in .log.
parseLogPath(targetPath): the function everything else calls. Uses resolveLogFiles to get one or more file paths, parses all of them, merges the results into one array, and sorts by timestamp. This is the piece I added beyond the assignment's raw code, so a single file or a directory both work.
src/analyzer.js — does the math on the parsed data
countByLevel(entries): loops through entries, tallies how many of each level ({ INFO: 1254, WARN: 339, ... }).
getErrors(entries): filters to just the ERROR level entries.
getTopErrors(entries, limit=5): takes all errors, strips out the variable part of each message (e.g. "Authentication failed for user: john@example.com" → "Authentication failed for user: ...") so similar errors group together, counts occurrences of each normalized message, sorts descending, returns the top 5.
getTimeline(entries) / getErrorTimeline(entries): groups entries by the hour they occurred (10:00, 11:00...) and counts how many fall in each hour. The error-only version feeds the timeline command.
getPeriod(entries): finds the earliest and latest timestamp in the data, for the "Period: X to Y" line in the report.
getSummary(entries): the one used by the report command — calls all of the above and bundles everything into one object, plus calculates errorRate (errors as a % of total).
src/reporter.js — turns the numbers into printed text

Pure formatting, no logic about what the numbers mean — just how they look on screen.

formatNumber, formatPercent, formatDate, formatDateTime: small helpers (commas in big numbers, percentages, date slicing).
printCountReport, printErrors, printTopErrors: each takes analyzer output and console.logs it in the layout the assignment specified.
printTimeline: builds the bar chart using repeated █ characters, scaled so the busiest hour gets a full 20-character bar.
printReport: the big one — assembles the full boxed report (period, level breakdown, top 3 errors, peak hour, and a 🔴/🟡/🟢 status based on error rate).
src/cli.js — the traffic controller
printUsage(): prints the help text when you run the tool with no arguments.
run(argv): reads the command (report, count, etc.) and the target path from the arguments. Validates: is there a command? Is there a path? Does the path exist? If any check fails, prints an error and exits with code 1 (this is what makes node index.js with no args, or a bad file path, fail cleanly instead of crashing with a stack trace).
If everything checks out, calls parseLogPath to get entries, then a switch statement routes to the right analyzer + reporter functions depending on which command you typed.
index.js — the entry point

Only 4 real lines. Grabs process.argv (the words you typed after node index.js), strips off the first two (which are always node and the file path), and hands the rest to cli.js's run() function. This is the file Node actually executes when you type node index.js ....

logs/app.log

Not code — the actual data file, 1,758 generated lines in the <timestamp> [LEVEL] message format, created by generate-logs.js. This is what every command reads and analyzes.

Flow in one sentence: index.js reads your command → cli.js validates it → parser.js turns the log file into JS objects → analyzer.js crunches numbers on those objects → reporter.js prints the resul