const chalk = require('chalk');
const path = require('path');

const utilities = require('./utilities');

function updateProject (project) {
  const projectPath = path.dirname(path.relative(process.cwd(), project.filepath))
  const pathComponents = projectPath.split('/')
  const scriptPath = Array.apply(null, {length: pathComponents.length-1}).map(function(val) {
    return '../'
  }).join('') + 'node_modules/react-native-schemes-manager/lib/react-native/xcode.sh'

  const section = project.hash.project.objects.PBXShellScriptBuildPhase;

  for (const key of Object.keys(section)) {
        // Look for the React native script.
    const step = section[key];

    if (step && step.shellScript && step.shellScript.indexOf('react-native-xcode.sh') >= 0) {
            // Found it!
            // Need to add our actual mappings to the project.
      const configurations = (utilities.getMappings().Debug || []).join('|');
      const devConfigs = `+(${configurations}${configurations.length ? '|' : ''}Debug)`;
      const newScript = `"export NODE_BINARY=node\\nexport DEVELOPMENT_BUILD_CONFIGURATIONS=\\"${devConfigs}\\"\\n"${scriptPath}`;

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
