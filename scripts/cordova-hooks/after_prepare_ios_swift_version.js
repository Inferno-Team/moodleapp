const fs = require('fs');
const path = require('path');
const xcode = require('xcode');
const { ConfigParser } = require('cordova-common');
const CordovaIos = require('cordova-ios');

function resolveIosProject(projectRoot) {
    const platformPath = path.join(projectRoot, 'platforms', 'ios');
    const iosProject = new CordovaIos('ios', platformPath);

    return iosProject.locations.pbxproj;
}

function fixStoryboardSplashProperty(projectRoot) {
    const storyboardPath = path.join(projectRoot, 'platforms', 'ios', 'App', 'Base.lproj', 'Main.storyboard');

    if (!fs.existsSync(storyboardPath)) {
        return;
    }

    const storyboard = fs.readFileSync(storyboardPath, 'utf8');
    const updatedStoryboard = storyboard.replace(/keyPath="showSplashScreen"/g, 'keyPath="showInitialSplashScreen"');

    if (storyboard === updatedStoryboard) {
        return;
    }

    fs.writeFileSync(storyboardPath, updatedStoryboard);
    console.log('Updated iOS storyboard splash runtime key to showInitialSplashScreen');
}

module.exports = function afterPrepareIosSwiftVersion(context) {
    const projectRoot = context.opts.projectRoot;
    const configPath = path.join(projectRoot, 'config.xml');
    const config = new ConfigParser(configPath);
    const swiftVersion = config.getPreference('UseSwiftLanguageVersion', 'ios') || '5.0';
    const pbxprojPath = resolveIosProject(projectRoot);

    fixStoryboardSplashProperty(projectRoot);

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
