const fs = require('fs');
const path = require('path');

const FILE_MAPPINGS = [
    {
        source: 'node_modules/@moodlehq/cordova-plugin-advanced-http/src/ios/SDNetworkActivityIndicator/SDNetworkActivityIndicator.m',
        targets: [
            'plugins/@moodlehq/cordova-plugin-advanced-http/src/ios/SDNetworkActivityIndicator/SDNetworkActivityIndicator.m',
            'platforms/ios/App/Plugins/@moodlehq/cordova-plugin-advanced-http/SDNetworkActivityIndicator.m',
        ],
    },
    {
        source: 'node_modules/@moodlehq/cordova-plugin-file-transfer/src/ios/CDVFileTransfer.m',
        targets: [
            'plugins/@moodlehq/cordova-plugin-file-transfer/src/ios/CDVFileTransfer.m',
            'platforms/ios/App/Plugins/@moodlehq/cordova-plugin-file-transfer/CDVFileTransfer.m',
        ],
    },
    {
        source: 'node_modules/@moodlehq/cordova-plugin-ionic-webview/src/ios/CDVWKWebViewEngine.m',
        targets: [
            'plugins/@moodlehq/cordova-plugin-ionic-webview/src/ios/CDVWKWebViewEngine.m',
            'platforms/ios/App/Plugins/@moodlehq/cordova-plugin-ionic-webview/CDVWKWebViewEngine.m',
        ],
    },
    {
        source: 'node_modules/@moodlehq/cordova-plugin-qrscanner/src/ios/QRScanner.swift',
        targets: [
            'plugins/@moodlehq/cordova-plugin-qrscanner/src/ios/QRScanner.swift',
            'platforms/ios/App/Plugins/@moodlehq/cordova-plugin-qrscanner/QRScanner.swift',
        ],
    },
    {
        source: 'node_modules/@moodlehq/phonegap-plugin-push/src/ios/EncryptionHandler.m',
        targets: [
            'plugins/@moodlehq/phonegap-plugin-push/src/ios/EncryptionHandler.m',
            'platforms/ios/App/Plugins/@moodlehq/phonegap-plugin-push/EncryptionHandler.m',
        ],
    },
];

function copyIfChanged(projectRoot, sourceRelativePath, targetRelativePath) {
    const sourcePath = path.join(projectRoot, sourceRelativePath);
    const targetPath = path.join(projectRoot, targetRelativePath);

    if (!fs.existsSync(sourcePath) || !fs.existsSync(targetPath)) {
        return false;
    }

    const sourceContent = fs.readFileSync(sourcePath, 'utf8');
    const targetContent = fs.readFileSync(targetPath, 'utf8');

    if (sourceContent === targetContent) {
        return false;
    }

    fs.writeFileSync(targetPath, sourceContent);

    return true;
}

module.exports = function syncPatchedCordovaPlugins(context) {
    const projectRoot = context?.opts?.projectRoot || process.cwd();
    let copiedFiles = 0;

    FILE_MAPPINGS.forEach(({ source, targets }) => {
        targets.forEach(target => {
            if (copyIfChanged(projectRoot, source, target)) {
                copiedFiles += 1;
                console.log(`Synced patched Cordova source: ${target}`);
            }
        });
    });

    if (copiedFiles === 0) {
        console.log('Cordova patched sources already in sync.');
    }
};
