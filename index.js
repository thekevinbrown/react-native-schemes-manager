#! /usr/bin/env node
const glob = require('glob');

const yargs = require('yargs');

yargs
.usage('$0 command')
.command('all', 'run all bundled commands', yargs => {
	const files = glob.sync('src/*.js');

	for (const file of files) {
		if (file.endsWith('utilities.js')) continue;

		require('./' + file)();
	}
})
.command('fix-libraries', 'add any missing build configurations to all xcode projects in node_modules', yargs => {
	require('./src/fix-libraries')();
})
.command('fix-script', 'replace the react native ios bundler with our scheme aware one', yargs => {
	require('./src/fix-script')();
})
.demand(1, 'must provide a valid command')
.help('h')
.alias('h', 'help')
.argv;
