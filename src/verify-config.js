const chalk = require('chalk');
const path = require('path');

const utilities = require('./utilities');

module.exports = function verifyConfig () {
	let packageJson = null;

	const project = utilities.getClosestLikelyReactNativeProjectPath();
	if (project) packageJson = require(path.join(project, 'package.json'));

	if (!packageJson) {
		console.log(chalk.red('========================================================================================='));
		console.log(chalk.red('     Error: Unable to locate a react-native project directory.'));
		console.log(chalk.red('     Are you sure you\'re running in a directory with an xcode project under ios/?\n'));
		console.log(chalk.red('     It\'s quite likely that react-native-schemes-manager will fail in this project.'));
		console.log(chalk.red('========================================================================================='));
		return;
	}

	const postinstall = packageJson.scripts && packageJson.scripts.postinstall;
	const postinstallInvalid = !postinstall || typeof postinstall !== 'string' || postinstall.indexOf('react-native-schemes-manager') < 0;

	const xcodeSchemes = packageJson.xcodeSchemes;
	const xcodeSchemesInvalid = !xcodeSchemes || !(Array.isArray(xcodeSchemes.Debug) || Array.isArray(xcodeSchemes.Release));

	if (postinstallInvalid || xcodeSchemesInvalid) {
		console.log(chalk.yellow('========================================================================================='));

		if (postinstallInvalid) {
			console.log(chalk.yellow('     It looks like you haven\'t yet configured a postinstall script'));
			console.log(chalk.yellow('     for react-native-schemes-manager.\n'));
		}

		if (xcodeSchemesInvalid) {
			console.log(chalk.yellow('     It looks like you haven\'t yet configured your xcode schemes'));
			console.log(chalk.yellow('     for react-native-schemes-manager.\n'));
		}

		console.log(chalk.yellow('     Please visit https://github.com/thekevinbrown/react-native-schemes-manager#installation'));
		console.log(chalk.yellow('     and complete the installation process.'));
		console.log(chalk.yellow('========================================================================================='));
	}
};
