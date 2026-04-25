# TOP LEADERS Change Log

Purpose: capture the branch-specific rebrand work for the TOP LEADERS app while keeping track of what is inherited from the DigiLearn debugging baseline and what still needs project-specific updates.

## Branch State

- `git switch -c topleaderscentre` was run on 2026-04-18.
- The branch was created from the clean `digilearn` branch so it inherits the native build/debugging fixes already documented in `DIGILEARN_CHANGE_LOG.md`.

## Changes Completed For TOP LEADERS

- `config.xml`
  - Changed the app display name to `TOP LEADERS`.
  - Replaced the description with `TOP LEADERS mobile learning app.`
  - Changed the widget id from `com.digiworld.digilearn` to `com.digiworld.topleaders`.
  - Switched the local iOS webview scheme from `digilearnfs` to `topleadersfs`.
  - Updated the appended user agent name to `TOP LEADERS`.
- `moodle.config.json`
  - Changed `appname` to `TOP LEADERS`.
  - Changed `app_id` and Android store identifier to `com.digiworld.topleaders`.
  - Updated the allowed site entry to `https://lms.topleaderscentre.com/`.
  - Renamed the site label to `TOP LEADERS`.
  - Switched `customurlscheme` to `topleaders`.
  - Switched `ioswebviewscheme` to `topleadersfs`.
- `package.json`
  - Renamed the package from `digilearn` to `topleaders`.
  - Replaced the description with the TOP LEADERS app description.
  - Updated the Cordova custom URL scheme plugin value to `topleaders`.
  - Changed `dev:ios` and `prod:ios` to build first, then launch the generated `.app` bundle via a helper script instead of assuming the old `platforms/ios/build/emulator/...` output path.
  - Added `android:keystore`, `build:android:apk:signed`, and `build:android:aab:signed` helper scripts for signed Android release builds.
- `ionic.config.json`
  - Renamed the Ionic project from `digilearn` to `topleaders`.
- `src/index.html`
  - Changed the document title to `TOP LEADERS`.
  - Updated the CSP to allow `topleadersfs:`.
- `src/theme/globals.custom.scss`
  - Updated the branding comment to refer to TOP LEADERS.
- `src/theme/theme.custom.scss`
  - Updated the branding comment to refer to TOP LEADERS.
- `resources/top-leaders-logo.png`
  - Added the TOP LEADERS source logo file for this branch.
- `resources/icon.png`
  - Replaced the active app icon source with the TOP LEADERS logo.
  - Rebuilt it as a non-alpha PNG so native icon generation remains valid.
- `resources/android/appicon/*`
  - Regenerated Android launcher icons from the TOP LEADERS `resources/icon.png` source.
- `resources/ios/appicon/*`
  - Regenerated iOS app icons from the TOP LEADERS `resources/icon.png` source.
- `src/assets/img/login_logo.png`
  - Replaced the login fallback logo with the TOP LEADERS logo.
- `src/assets/img/top_logo.png`
  - Replaced the top/header fallback logo with the TOP LEADERS logo.
- `src/assets/icon/favicon.png`
  - Replaced the favicon with the active TOP LEADERS icon.
- `resources/android/icon/drawable-*-smallicon.png`
  - Replaced the Android notification icon source files with the current TOP LEADERS icon asset for branch consistency.
- `GoogleService-Info.plist`
  - Changed the bundle id entry to `com.digiworld.topleaders`.
  - Note: this is still the inherited DigiLearn Firebase project file and should be replaced with a TOP LEADERS download.
- `google-services.json`
  - Changed the Android package name entry to `com.digiworld.topleaders`.
  - Note: this is still the inherited DigiLearn Firebase project file and should be replaced with a TOP LEADERS download.
- `patches/@moodlehq+phonegap-plugin-push+4.0.0-moodle.13.patch`
  - Added `TOP_LEADERS-Swift.h` as the first generated Swift header import fallback for the renamed iOS target.
  - Fixed the unified-diff hunk metadata after the TOP LEADERS header addition so `patch-package` can parse the patch during `npm install`.
- `patches/@moodlehq+cordova-plugin-ionic-webview+5.0.0-moodle.5.patch`
  - Refreshed the patch against the currently installed `5.0.0-moodle.5` source layout so the iOS white-screen fix still applies cleanly during `patch-package`.
  - Preserved the existing behavior changes: normalized local server URL handling and Cordova navigation-handler compatibility for newer `cordova-ios`.
- `patches/@moodlehq+cordova-plugin-qrscanner+3.0.1-moodle.6.patch`
  - Preserved the safe QR scan result / callback unwrapping fix.
  - Replaced the obsolete `UIApplicationOpenSettingsURLString` usage with `UIApplication.openSettingsURLString`.
  - Removed the dead pre-iOS-10 settings branch because this app now targets iOS 15.
  - Reason: fix iOS compilation on Xcode 16 / current iOS SDKs.
- `scripts/run-built-ios-app.sh`
  - Added a small iOS launcher helper that discovers the generated `.app` bundle under `platforms/ios/build` and passes the real path to `native-run`.
  - Reason: current `cordova-ios` output lands under `platforms/ios/build/Debug-iphonesimulator/`, so the previous hard-coded emulator path no longer worked.
- `scripts/ensure-android-keystore.sh`
  - Added a helper to create a repo-local Android release keystore if one does not already exist.
  - The keystore path defaults to `certs/android/topleaders-release.jks` and is ignored by Git.
- `scripts/build-android-release.sh`
  - Added a signed Android release builder that writes a temporary `build.json`, uses Cordova signing settings, and supports both `apk` and `aab` package types.

## Inherited Baseline From DigiLearn

- The Cordova hook changes and plugin patches from `DIGILEARN_CHANGE_LOG.md` are intentionally preserved on this branch.
- This includes the native icon generation hook, patched-plugin sync hook, iOS Swift project compatibility hook, splash-screen fallback logic, and all `patches/` plugin fixes.

## Pending Project-Specific Work

- Replace DigiLearn Firebase files (`GoogleService-Info.plist` and `google-services.json`) with TOP LEADERS equivalents if push notifications are required.
- Apply the TOP LEADERS color palette in `src/theme/globals.custom.scss`, `src/theme/theme.custom.scss`, and any platform splash/status bar color settings.
- Replace any other branded images still inherited from DigiLearn if they surface during QA.
- Run a full search for any leftover `digilearn` references after the package identifiers and assets are finalized.

## Verification

- `npx cordova build ios --verbose` completed successfully on 2026-04-18 after the QR scanner iOS SDK compatibility fix.
- `npm run dev:ios` completed successfully on 2026-04-18 after updating the iOS launch script to use the real build output path.
- `xcrun simctl` verification confirmed `com.digiworld.topleaders` was installed in the booted simulator and remained running after launch.
- `npx ionic cordova build android --prod --release -- -- --packageType=apk` produced `/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk`.
- A signed Android build flow is now present in repo scripts, but a real keystore password is still required from the user before generating signed release artifacts.
- The CocoaPods deployment target messages (`9.0` / `10.0` / `11.0` inside third-party Pods) remain warnings and did not block the build.
