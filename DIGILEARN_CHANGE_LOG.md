# DigiLearn Change Log

Purpose: capture the native debugging changes made while getting iOS/Android building and loading, and separate repo-owned changes from ignored dependency/plugin edits.

## Branch State

- `git switch -c digilearn` was run on 2026-03-07.
- The branch was created from the current dirty working tree, so all existing tracked changes stayed with the new branch.

## Repo-Owned Changes Created During This Debugging Work

- `config.xml`
  - Added a `before_prepare` hook for `scripts/cordova-hooks/before_prepare_native_icons.js`.
  - Added explicit Android and iOS `<icon>` entries that point at generated files under `resources/android/appicon/` and `resources/ios/appicon/`.
  - Reason: native builds were generating or picking the wrong app icon.
- `scripts/cordova-hooks/before_prepare_native_icons.js`
  - New hook that generates native icon sizes from `resources/icon.png` using `sips`.
  - Reason: force native icons to use the brand source icon instead of `www/assets/icon/icon.png`.
- `scripts/cordova-hooks/sync_patched_cordova_plugins.js`
  - New hook that copies patched iOS plugin sources from `node_modules/` into Cordova's ignored `plugins/` and `platforms/ios/App/Plugins/` copies.
  - Reason: `patch-package` only updates `node_modules`, but Cordova builds from its own generated plugin directories.
- `resources/android/appicon/*`
  - Generated Android launcher icons.
  - Reason: assets referenced by `config.xml`.
- `resources/ios/appicon/*`
  - Generated iOS app icons.
  - Reason: assets referenced by `config.xml`.
- `scripts/cordova-hooks/after_prepare_ios_swift_version.js`
  - Changed project lookup to use `cordova-ios` instead of assuming `<AppName>.xcodeproj`.
  - Added a storyboard rewrite from `showSplashScreen` to `showInitialSplashScreen`.
  - Reason: fix iOS build failures after app rename and keep splash handling compatible with current `cordova-ios`.
- `src/app/app.component.ts`
  - Added guarded splash-hide logic and a startup fallback timeout.
  - Reason: reduce cases where the app remains stuck behind the splash screen.
- `src/index.html`
  - Updated CSP to allow `digilearnfs:` instead of `moodleappfs:`.
  - Reason: the renamed app uses the `digilearnfs` local webview scheme.
- `patches/@moodlehq+cordova-plugin-advanced-http+3.3.1-moodle.1.patch`
  - Adds `UIKit` import to `SDNetworkActivityIndicator.m`.
  - Reason: preserve the iOS compile fix for `UIApplication` symbols.
- `patches/@moodlehq+cordova-plugin-file-transfer+2.0.0-moodle.2.patch`
  - Adds `CDVFile.h` import and uses explicit `CDVFile` lookups for filesystem helpers.
  - Reason: preserve the iOS compile fix for newer Cordova file APIs.
- `patches/@moodlehq+cordova-plugin-ionic-webview+5.0.0-moodle.5.patch`
  - Captures both `localServerURL` normalization and the navigation-handler compatibility fix.
  - Reason: preserve the full iOS white-screen fix across `npm install`.
- `patches/@moodlehq+cordova-plugin-qrscanner+3.0.1-moodle.6.patch`
  - Safely unwraps QR scan results and the callback command.
  - Reason: preserve the Swift compile fix on the newer iOS toolchain.
- `patches/@moodlehq+phonegap-plugin-push+4.0.0-moodle.13.patch`
  - Uses conditional imports for generated Swift interface headers.
  - Reason: preserve the iOS compile fix after the app rename.

## Ignored Dependency/Plugin Edits Created During This Debugging Work

- `node_modules/@moodlehq/cordova-plugin-ionic-webview/src/ios/CDVWKWebViewEngine.m`
- `plugins/@moodlehq/cordova-plugin-ionic-webview/src/ios/CDVWKWebViewEngine.m`
- `platforms/ios/App/Plugins/@moodlehq/cordova-plugin-ionic-webview/CDVWKWebViewEngine.m`
  - Added `localServerURL` to normalize the local server base URL.
  - Updated navigation delegation to support both `shouldOverrideLoadWithRequest:navigationType:` and `shouldOverrideLoadWithRequest:navigationType:info:`.
  - Reason: fix the iOS white screen. The old plugin code canceled the app's own `digilearnfs://...` startup navigation on `cordova-ios` 8, so WKWebView never loaded the web app.
- `plugins/@moodlehq/phonegap-plugin-push/src/ios/EncryptionHandler.m`
- `platforms/ios/App/Plugins/@moodlehq/phonegap-plugin-push/EncryptionHandler.m`
  - Replaced the hardcoded `#import "Moodle-Swift.h"` with conditional imports for `DigiLearn-Swift.h`, `Moodle-Swift.h`, or `App-Swift.h`.
  - Reason: the app rename changed the generated Swift interface header name and broke iOS compilation.
- `plugins/@moodlehq/cordova-plugin-qrscanner/src/ios/QRScanner.swift`
- `platforms/ios/App/Plugins/@moodlehq/cordova-plugin-qrscanner/QRScanner.swift`
  - Safely unwrapped `found.stringValue` and `nextScanningCommand` before sending the scan result.
  - Reason: fix Swift compile errors on the newer iOS toolchain.
- `plugins/@moodlehq/cordova-plugin-file-transfer/src/ios/CDVFileTransfer.m`
- `platforms/ios/App/Plugins/@moodlehq/cordova-plugin-file-transfer/CDVFileTransfer.m`
  - Added `#import "CDVFile.h"`.
  - Replaced calls on generic `CDVPlugin` with explicit `CDVFile *filePlugin` lookups for `filesystemForURL:` and `fileSystemURLforLocalPath:`.
  - Reason: fix iOS compilation after Cordova API changes.
- `plugins/@moodlehq/cordova-plugin-advanced-http/src/ios/SDNetworkActivityIndicator/SDNetworkActivityIndicator.m`
- `platforms/ios/App/Plugins/@moodlehq/cordova-plugin-advanced-http/SDNetworkActivityIndicator.m`
  - Added `#import <UIKit/UIKit.h>`.
  - Reason: fix `UIApplication` undeclared compile errors on iOS.

## Important Persistence Note

- `plugins/`, `platforms/`, and `node_modules/` are ignored in this repository.
- The dependency/plugin edits are now preserved in `patches/`.
- `postinstall` runs `patch-package` to reapply those diffs into `node_modules/`.
- `scripts/cordova-hooks/sync_patched_cordova_plugins.js` copies the patched files into Cordova's ignored `plugins/` and `platforms/` build copies during `after_plugin_add` and `before_prepare`.
- If the dependency versions change later, the patch files will need to be reviewed and updated.

## Other Tracked Changes Already Present In The Worktree

- The current branch also contains tracked changes not documented in detail here because they were already present as part of app branding/config work: `GoogleService-Info.plist`, `google-services.json`, `ionic.config.json`, `moodle.config.json`, `package.json`, `package-lock.json`, `resources/icon.png`, `resources/splash.png`, `resources/android/icon-foreground.png`, `resources/android/icon/drawable-hdpi-smallicon.png`, `resources/android/icon/drawable-ldpi-smallicon.png`, `resources/android/icon/drawable-mdpi-smallicon.png`, `resources/android/icon/drawable-xhdpi-smallicon.png`, `resources/values/colors.xml`, `src/assets/img/login_logo.png`, `src/assets/img/top_logo.png`, `src/theme/globals.custom.scss`, `src/theme/theme.custom.scss`.
- If needed, document those separately based on product/branding decisions rather than native debugging.
