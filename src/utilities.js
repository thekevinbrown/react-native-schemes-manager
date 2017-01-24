const fs = require('fs');
const glob = require('glob');
const path = require('path');
const uuid = require('uuid');
const xcode = require('xcode');

module.exports = {
    getClosestLikelyReactNativeProjectPath () {
        let currentPath = process.cwd();
        let nextPath;

        console.log(`searching in ${currentPath}`);
        console.log(path.join(currentPath, 'ios/*.xcodeproj/project.pbxproj'));

        const pattern = 'ios/*.xcodeproj/project.pbxproj'
        const files = glob.sync(path.join(currentPath, pattern));

        while (files.length === 0) {
            nextPath = path.resolve(currentPath, '..');

            if (nextPath === currentPath) {
                throw new Error('Could not locate a likely path.');
            }

            files = glob.sync(path.join(currentPath, pattern));
        }

        if (files.length > 0) {
            return currentPath;
        } else {
            throw new Error('Could not locate a likely path.');
        }
    },
    updateProjectsMatchingGlob (pattern, callback) {
        // Find all of the pbxproj files we care about.
        const project = this.getClosestLikelyReactNativeProjectPath();
        if (!project) return callback(new Error('Unable to find project path.'));

        glob(path.join(project, pattern), (err, files) => {
            if (err) throw err;

            // Go through each project.
            for (const projectPath of files) {
                const project = xcode.project(projectPath);
                project.parseSync();

                // And fix it.
                if (callback(null, project)) {
                    console.log('Saving project file.');
                    fs.writeFileSync(projectPath, project.writeSync());
                }
            }
        });
    },
    generateUuid () {
        return uuid.v4().replace(/-/g, '').substr(0, 24).toUpperCase();
    },
    getMappings () {
        const project = this.getClosestLikelyReactNativeProjectPath();
        const package = require(path.join(project, 'package.json'));

        if (!package.schemes || !package.schemes.Debug) {
            throw new Error('Please configure schemes on your project. For more information, see https://github.com/Thinkmill/react-native-schemes-manager/blob/master/README.md');
        }

        return package.schemes.Debug;
    },
}