const chalk = require('chalk');
const path = require('path');

const utilities = require('./utilities');

function updateFile (file, filePath) {
	let changed = false;

	if (file.SchemeUserState) {
		for (const key of Object.keys(file.SchemeUserState)) {
			if (key.endsWith('.xcscheme')) {
				const scheme = file.SchemeUserState[key];

				if (!scheme.hasOwnProperty('isShown') || scheme.isShown) {
					scheme.isShown = false;
					changed = true;

					console.log(chalk.gray(` ${chalk.green('✔')} [hide-library-schemes]: ${path.dirname(path.relative(process.cwd(), filePath))} ${chalk.green('hidden')}`));
				} else {
					console.log(chalk.gray(` - [hide-library-schemes]: ${path.dirname(path.relative(process.cwd(), filePath))} skipped`));
				}
			}
		}
	}

	return changed;
}

module.exports = function findAndFix () {
	// Find all of the pbxproj files we care about.
	const userSpecificPattern = './node_modules/**/*.xcodeproj/xcuserdata/*.xcuserdatad/xcschemes/xcschememanagement.plist';

	console.log(chalk.gray('Hiding schemes from node_modules xcode projects.'));

	utilities.updatePlistsMatchingGlob(userSpecificPattern, (err, file, filePath) => {
		return updateFile(file, filePath);
	});
};
