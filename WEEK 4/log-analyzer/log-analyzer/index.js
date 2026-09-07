#!/usr/bin/env node

const { run } = require("./src/cli");

const [, , ...argv] = process.argv;

run(argv);
