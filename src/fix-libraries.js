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
	console.log(path.dirname(path.relative(process.cwd(), project.filepath)));

	const configs = project.pbxXCBuildConfigurationSection();
	const configLists = project.pbxXCConfigurationList();
	let changed = false;

	// Go through each mapping in our debug map and figure out if we need to clone it.
	for (let mapping of utilities.getMappings()) {

		// Do we have the clone already?
		const buildConfig = project.getBuildConfigByName(mapping);

		// If we get an empty object back, then it's not able to find the build config.
		if (Object.keys(buildConfig).length === 0) {
			// Ok, we need to create our clone of the Debug build config and add it to the config lists.
			const debugConfigs = project.getBuildConfigByName('Debug');

			// There are actually multiple debug configs spread across multiple lists. Clone them all.
			for (const key of Object.keys(debugConfigs)) {
				const debugConfig = debugConfigs[key];
				const configList = configListForConfig(configLists, key);

				if (!configList) throw new Error(`Unable to find config list for build configuration: ${debugConfig.name}`);

				const clone = JSON.parse(JSON.stringify(debugConfig));
				clone.name = mapping;

				const configurationUuid = utilities.generateUuid();
				const configurationCommentKey = `${configurationUuid}_comment`;

				configs[configurationUuid] = clone;
				configs[configurationCommentKey] = mapping;
				configList.buildConfigurations.push({ value: configurationUuid, comment: mapping });
			}

			console.log(` ✔ [created] Debug -> ${mapping}`);

			changed = true;
		} else {
			console.log(` - [skipped] Debug -> ${mapping}`);
		}
	}

	return changed;
}

module.exports = function findAndFix () {
	// Find all of the pbxproj files we care about.
	const pattern = './node_modules/**/*.xcodeproj/project.pbxproj';

	utilities.updateProjectsMatchingGlob(pattern, (err, project) => {
		return updateProject(project);
	});
};
