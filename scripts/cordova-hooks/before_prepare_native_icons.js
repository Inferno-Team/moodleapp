const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const IOS_SIZES = [40, 58, 60, 76, 80, 87, 114, 120, 128, 136, 152, 167, 180, 192, 1024];
const ANDROID_SIZES = {
    ldpi: 36,
    mdpi: 48,
    hdpi: 72,
    xhdpi: 96,
    xxhdpi: 144,
    xxxhdpi: 192,
};

function ensureDirectory(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function resizeImage(source, destination, size) {
    execFileSync('sips', ['-z', String(size), String(size), source, '--out', destination], {
        stdio: 'ignore',
    });
}

module.exports = function beforePrepareNativeIcons(context) {
    const projectRoot = context.opts.projectRoot;
    const sourceIcon = path.join(projectRoot, 'resources', 'icon.png');
    const iosOutputDir = path.join(projectRoot, 'resources', 'ios', 'appicon');
    const androidOutputDir = path.join(projectRoot, 'resources', 'android', 'appicon');

    if (!fs.existsSync(sourceIcon)) {
        console.warn(`Skipping native icon generation because ${sourceIcon} does not exist.`);

        return;
    }

    if (process.platform !== 'darwin') {
        console.warn('Skipping native icon generation because sips is only available on macOS.');

        return;
    }

    ensureDirectory(iosOutputDir);
    ensureDirectory(androidOutputDir);

    IOS_SIZES.forEach(size => {
        resizeImage(sourceIcon, path.join(iosOutputDir, `icon-${size}.png`), size);
    });

    Object.entries(ANDROID_SIZES).forEach(([density, size]) => {
        resizeImage(sourceIcon, path.join(androidOutputDir, `icon-${density}.png`), size);
    });

    console.log(`Generated native iOS and Android icons from ${path.relative(projectRoot, sourceIcon)}`);
};
