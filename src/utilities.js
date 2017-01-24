const glob = require('glob');
const path = require('path');
const xcode = require('xcode');

module.exports = {
    getClosestLikelyReactNativeProjectPath (currentPath, callback) {
        console.log(`searching in ${currentPath}`);
        console.log(path.join(currentPath, 'ios/*.xcodeproj/project.pbxproj'));
        glob(path.join(currentPath, 'ios/*.xcodeproj/project.pbxproj'), (err, files) => {
            if (files.length > 0) {
                return callback(null, currentPath);
            } 

            const nextPath = path.resolve(currentPath, '..');
            if (nextPath === currentPath) {
                return callback(new Error('Could not locate a likely path.'));
            }

            return this.getClosestLikelyReactNativeProjectPath(nextPath, callback);
        });
    },
    updateProjectsMatchingGlob (pattern, callback) {
        // Find all of the pbxproj files we care about.
        this.getClosestLikelyReactNativeProjectPath(process.cwd(), (err, project) => {
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
        });

        
    },
    generateUuid () {
        return uuid.v4().replace(/-/g, '').substr(0, 24).toUpperCase();
    },
    getMappings () {
        return {
            Debug: ['Development', 'Staging', 'Preflight'],
        };
    },
}