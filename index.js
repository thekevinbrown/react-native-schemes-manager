#!/usr/bin/env node
const yargs = require('yargs');

yargs
	.usage('$0 command')
	.command('all', 'run all bundled commands', yargs => {
		const operations = require('./src');

		for (const key of Object.keys(operations)) {
			operations[key]();
		}
	})
	.command('fix-libraries', 'add any missing build configurations to all xcode projects in node_modules', yargs => {
		require('./src/fix-libraries')(yargs.argv.singleProject);
	})
	.command('fix-script', 'replace the react native ios bundler with our scheme aware one', yargs => {
		require('./src/fix-script')();
	})
	.command('hide-library-schemes', `hide any schemes that come from your node modules directory so they don't clutter up the menu.`, yargs => {
		require('./src/hide-library-schemes')();
	})
	.command('verify-config', `check the configuration and ensure we have both a postinstall script and xcodeSchemes configurations.`, yargs => {
		require('./src/verify-config')();
	})
	.option('single-project', {
		describe: 'Specify Xcode project name to fix a single project',
		type: 'string',
		default: null,
	})
	.demand(1, 'must provide a valid command')
	.help('h')
	.alias('h', 'help')
	.argv;
