const chalk = require('chalk');
const path = require('path');

const utilities = require('./utilities');

function configListForConfig (configLists, configUuid) {
	for (const listUuid of Object.keys(configLists)) {
		if (listUuid.endsWith('_comment')) continue;

		const configList = configLists[listUuid];

		if (configList.buildConfigurations.find(config => config.value === configUuid)) {
			return configList;
		}
	}

	return null;
}

function updateProject (project) {

	const configs = project.pbxXCBuildConfigurationSection();
	const configLists = project.pbxXCConfigurationList();
	let changed = false;
	const { Debug, Release } = utilities.getMappings();
	const mappings = {
		Debug,
		Release,
	};

	// Go through each mapping in our debug map and figure out if we need to clone it.
	for (const sourceBuildConfig of Object.keys(mappings)) {
		for (const destinationBuildConfig of mappings[sourceBuildConfig]) {
			// Do we have the clone already?
			const buildConfig = project.getBuildConfigByName(destinationBuildConfig);

			// If we get an empty object back, then it's not able to find the build config.
			if (Object.keys(buildConfig).length === 0) {
				// Ok, we need to create our clone of the build configs they've asked for and add it to the config lists.
				const sourceConfigs = project.getBuildConfigByName(sourceBuildConfig);

				// Handle cases where some configurations are missing, e.g. RCTWebSocket does not have a 'Release' config
				let hasError = false;

				// There are actually multiple of the same configs spread across multiple lists. Clone them all to the destination build configs.
				for (const key of Object.keys(sourceConfigs)) {
					const sourceConfig = sourceConfigs[key];
					const configList = configListForConfig(configLists, key);

					if (!configList) {
						hasError = true;
						continue;
					}

					// Copy that bad boy.
					const clone = JSON.parse(JSON.stringify(sourceConfig));
					clone.name = `"${destinationBuildConfig}"`;

					const configurationUuid = project.generateUuid();
					const configurationCommentKey = `${configurationUuid}_comment`;

					configs[configurationUuid] = clone;
					configs[configurationCommentKey] = destinationBuildConfig;
					configList.buildConfigurations.push({ value: configurationUuid, comment: destinationBuildConfig });
				}

				if (hasError) {
					console.log(chalk.gray(` ${chalk.red('✗')} [fix-libraries]: ${chalk.red(sourceBuildConfig + ' -> ' + destinationBuildConfig + ' failed')}  in ${path.dirname(path.relative(process.cwd(), project.filepath))}`));
				} else {
					console.log(chalk.gray(` ${chalk.green('✔')} [fix-libraries]: ${chalk.green(sourceBuildConfig + ' -> ' + destinationBuildConfig + ' created')} in ${path.dirname(path.relative(process.cwd(), project.filepath))}`));
				}

				changed = true;
			} else {
				console.log(chalk.gray(` - [fix-libraries]: ${sourceBuildConfig} -> ${destinationBuildConfig} skipped in ${path.dirname(path.relative(process.cwd(), project.filepath))}`));
			}
		}
	}

	return changed;
}

module.exports = function findAndFix (singleProject = null) {
	// Find all of the pbxproj files we care about.
	let pattern = './node_modules/**/*.xcodeproj/project.pbxproj';
	// Search only for specified project
	if (singleProject) {
		pattern = './node_modules/**/' + singleProject + '.xcodeproj/project.pbxproj';
	}

	utilities.updateProjectsMatchingGlob(pattern, (err, project) => {
		if (err) {
			return console.error(chalk.red(`⃠ [fix-libraries]: Error!`, err));
		}

		return updateProject(project);
	});
};
