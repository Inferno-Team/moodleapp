const fs = require('fs');
const path = require('path');
const { ConfigParser } = require('cordova-common');

/**
 * Recursively list files in a directory.
 *
 * @param {string} dir Directory.
 * @returns {string[]} Absolute file paths.
 */
function listFilesRecursive(dir) {
    if (!fs.existsSync(dir)) {
        return [];
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    entries.forEach((entry) => {
        const entryPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...listFilesRecursive(entryPath));
        } else {
            files.push(entryPath);
        }
    });

    return files;
}

/**
 * Update package statement in Java source.
 *
 * @param {string} content File content.
 * @param {string} packageName Java package.
 * @returns {string} Updated content.
 */
function updateJavaPackage(content, packageName) {
    if (/^package\s+[\w.]+;/m.test(content)) {
        return content.replace(/^package\s+[\w.]+;/m, `package ${packageName};`);
    }

    return `package ${packageName};\n\n${content}`;
}

module.exports = function beforePrepareAndroidMainActivityPackage(context) {
    const projectRoot = context?.opts?.projectRoot || process.cwd();
    const targetPlatforms = context?.opts?.platforms || [];

    if (targetPlatforms.length && !targetPlatforms.includes('android')) {
        return;
    }

    const configPath = path.join(projectRoot, 'config.xml');
    const javaRoot = path.join(projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'java');

    if (!fs.existsSync(configPath) || !fs.existsSync(javaRoot)) {
        return;
    }

    const config = new ConfigParser(configPath);
    const packageName = (config.android_packageName && config.android_packageName()) || config.packageName();

    if (!packageName) {
        return;
    }

    const expectedDir = path.join(javaRoot, packageName.replace(/\./g, '/'));
    const expectedMainActivity = path.join(expectedDir, 'MainActivity.java');

    if (fs.existsSync(expectedMainActivity)) {
        const current = fs.readFileSync(expectedMainActivity, 'utf8');
        const updated = updateJavaPackage(current, packageName);

        if (updated !== current) {
            fs.writeFileSync(expectedMainActivity, updated);
            console.log(`Updated Android MainActivity package to ${packageName}`);
        }

        return;
    }

    const mainActivityCandidates = listFilesRecursive(javaRoot)
        .filter(filePath => filePath.endsWith(`${path.sep}MainActivity.java`))
        .filter((filePath) => {
            const content = fs.readFileSync(filePath, 'utf8');

            return /extends\s+CordovaActivity/.test(content);
        });

    if (!mainActivityCandidates.length) {
        return;
    }

    const sourceMainActivity = mainActivityCandidates[0];
    const sourceContent = fs.readFileSync(sourceMainActivity, 'utf8');
    const updatedContent = updateJavaPackage(sourceContent, packageName);

    fs.mkdirSync(expectedDir, { recursive: true });
    fs.writeFileSync(expectedMainActivity, updatedContent);

    if (sourceMainActivity !== expectedMainActivity && fs.existsSync(sourceMainActivity)) {
        fs.unlinkSync(sourceMainActivity);
    }

    console.log(
        `Synced Android MainActivity to package ${packageName} (${path.relative(projectRoot, expectedMainActivity)})`,
    );
};
