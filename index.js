#! /usr/bin/env node

const yargs = require("yargs");

var argv = yargs.usage("$0 command")
    .command(
        "fix-libraries",
        "add any missing build configurations to all xcode projects in node_modules",
        yargs => {
            require('./src/fix-libraries')();
        })
    .command(
        "fix-script",
        "replace the react native ios bundler with our scheme aware one",
        yargs => {
            require('./src/fix-script')();
        })
    .demand(1, "must provide a valid command")
    .help("h")
    .alias("h", "help")
    .argv

