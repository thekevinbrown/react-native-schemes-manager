const fs = require('fs');
const glob = require('glob');
const path = require('path');
const plist = require('plist');
const xcode = require('xcode');

module.exports = {
	getClosestLikelyReactNativeProjectPath () {
		let currentPath = process.cwd();
		let nextPath;

		const pattern = 'ios/*.xcodeproj/project.pbxproj';
		let files = glob.sync(path.join(currentPath, pattern));

		while (files.length === 0) {
			nextPath = path.resolve(currentPath, '..');

			if (nextPath === currentPath) {
				// We're at the root of the filesystem and didn't find anything.
				return null;
			}

			currentPath = nextPath;

			files = glob.sync(path.join(currentPath, pattern));
		}

		return currentPath;
	},
	getFilesMatchingGlob (pattern, callback) {
        // Find all of the files we care about.
		const project = this.getClosestLikelyReactNativeProjectPath();
		if (!project) return callback(new Error('Unable to find project path.'));

		glob(path.join(project, pattern), (err, files) => {
			if (err) throw err;

            // Go through each project.
			for (const filePath of files) {
				callback(null, filePath);
			}
		});
	},
	updateProjectsMatchingGlob (pattern, callback) {
		this.getFilesMatchingGlob(pattern, (err, filePath) => {
			if (!filePath) return callback(new Error('Unable to find project path.'));

			const project = xcode.project(filePath);
			project.parseSync();

			// And fix it.
			if (callback(null, project)) {
				fs.writeFileSync(filePath, project.writeSync());
			}
		});
	},
	updatePlistsMatchingGlob (pattern, callback) {
		this.getFilesMatchingGlob(pattern, (err, filePath) => {
			if (!filePath) return callback(new Error('Unable to find plist path.'));

			const file = plist.parse(fs.readFileSync(filePath, 'utf8'));

			// And fix it.
			if (callback(null, file, filePath)) {
				fs.writeFileSync(filePath, plist.build(file));
			}
		});
	},
	getMappings () {
		const project = this.getClosestLikelyReactNativeProjectPath();
		const packageJson = require(path.join(project, 'package.json'));

		if (!packageJson.xcodeSchemes) {
			throw new Error('Please configure schemes on your project. For more information, see https://github.com/Thinkmill/react-native-schemes-manager/blob/master/README.md');
		}

		return packageJson.xcodeSchemes;
	},
};
