const fs = require('fs');
const path = require('path');
const xcode = require('xcode');
const { ConfigParser } = require('cordova-common');

module.exports = function afterPrepareIosSwiftVersion(context) {
    const projectRoot = context.opts.projectRoot;
    const configPath = path.join(projectRoot, 'config.xml');
    const config = new ConfigParser(configPath);
    const swiftVersion = config.getPreference('UseSwiftLanguageVersion', 'ios') || '5.0';
    const projectName = config.name();
    const pbxprojPath = path.join(projectRoot, 'platforms', 'ios', `${projectName}.xcodeproj`, 'project.pbxproj');

    if (!fs.existsSync(pbxprojPath)) {
        return;
    }

    const project = xcode.project(pbxprojPath);
    project.parseSync();

    const buildConfigs = project.pbxXCBuildConfigurationSection();
    let changed = false;

    for (const [key, buildConfig] of Object.entries(buildConfigs)) {
        if (key.endsWith('_comment') || !buildConfig.buildSettings) {
            continue;
        }

        const currentSwiftVersion = buildConfig.buildSettings.SWIFT_VERSION;
        if (typeof currentSwiftVersion === 'string' && currentSwiftVersion.trim() !== '') {
            continue;
        }

        buildConfig.buildSettings.SWIFT_VERSION = swiftVersion;
        changed = true;
        console.log(`Set iOS SWIFT_VERSION to ${swiftVersion} for ${buildConfig.name}`);
    }

    if (!changed) {
        return;
    }

    fs.writeFileSync(pbxprojPath, project.writeSync());
};
