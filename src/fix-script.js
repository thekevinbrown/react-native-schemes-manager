const path = require('path');

const utilities = require('./utilities');

function updateProject (project) {
	console.log(path.dirname(path.relative(process.cwd(), project.filepath)));

    const section = project.hash.project.objects['PBXShellScriptBuildPhase'];

    for (const key of Object.keys(section)) {
        // Look for the React native script.
        const step = section[key];

        if (step && step.shellScript && step.shellScript.indexOf('react-native-xcode.sh') >= 0) {
            // Found it!
            // Need to add our actual mappings to the project.
            const configurations = utilities.getMappings().Debug.join('|');
            
            const newScript = `"export NODE_BINARY=node\\nexport DEVELOPMENT_BUILD_CONFIGURATIONS=\\"${configurations}|Debug\\"\\n../node_modules/react-native-schemes-manager/lib/react-native-xcode.sh"`;

            if (step.shellScript === newScript) {
                // It's already up to date.
                console.log(' - [skipped] already done');
                return false;
            } else {
                step.shellScript = newScript;

    			console.log(` ✔ [fixed]`);
                return true;
            }
        }
    }
}

module.exports = function findAndFix() {
	// Find all of the pbxproj files we care about.
    const pattern = './ios/*.xcodeproj/project.pbxproj';

	utilities.updateProjectsMatchingGlob(pattern, (err, project) => {
		return updateProject(project);
	});
}
