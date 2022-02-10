const chalk = require('chalk');
const path = require('path');

const utilities = require('./utilities');

function updateProject (project) {
	console.log(path.dirname(path.relative(process.cwd(), project.filepath)));

	const section = project.hash.project.objects.PBXShellScriptBuildPhase;

	for (const key of Object.keys(section)) {
		// Look for the React native script.
		const step = section[key];

		if (step && step.shellScript && step.shellScript.indexOf('react-native-xcode.sh') >= 0) {
			// Found it!
			// Need to add our actual mappings to the project.
			const mappings = utilities.getMappings();
			const configurations = (mappings.Debug || []).join('|');
			const scriptSettings = (mappings.settings && mappings.settings['fix-script']) || {};
			const nodeCommand = scriptSettings.nodeCommand ? scriptSettings.nodeCommand + ' ' : '';
			const env = scriptSettings.env || [];

			const devConfigs = `\\"+(${configurations}${configurations.length ? '|' : ''}Debug)\\"`;
			env.DEVELOPMENT_BUILD_CONFIGURATIONS = devConfigs;
			env.NODE_BINARY = env.NODE_BINARY || 'node';

			const exports = Object.keys(env)
				.map((key) => [key, env[key]])
				.map(([key, value]) => `export ${key}=${value}`);

			const runCommand = `${nodeCommand}../node_modules/react-native-schemes-manager/lib/react-native-xcode.sh`;

			const commands = [
				...exports,
				runCommand,
			];

			const newScript = `"${commands.join('\\n')}\n"`;

			if (step.shellScript === newScript) {
				// It's already up to date.
				console.log(chalk.gray(` - [fix-script]: ${path.dirname(path.relative(process.cwd(), project.filepath))} skipped`));
				return false;
			} else {
				step.shellScript = newScript;

				console.log(chalk.gray(` ${chalk.green('✔')} [fix-script]: ${path.dirname(path.relative(process.cwd(), project.filepath))} ${chalk.green('fixed')}`));
				return true;
			}
		}
	}
}

module.exports = function findAndFix () {
	let projectDirectory = utilities.getMappings().projectDirectory;
	if (!projectDirectory) {
		projectDirectory = 'ios';
	}

	// Find all of the pbxproj files we care about.
	const pattern = `./${projectDirectory}/*.xcodeproj/project.pbxproj`;

	utilities.updateProjectsMatchingGlob(pattern, (err, project) => {
		if (err) {
			return console.error(chalk.red(`⃠ [fix-script]: Error!`, err));
		}

		return updateProject(project);
	});
};
