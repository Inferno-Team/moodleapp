#!/bin/sh

set -eu

PACKAGE_TYPE=${1:-apk}

case "$PACKAGE_TYPE" in
    apk|aab)
        ;;
    *)
        echo "Usage: $0 [apk|aab]" >&2
        exit 1
        ;;
esac

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
BUILD_CONFIG=$(mktemp "${TMPDIR:-/tmp}/android-build.XXXXXX.json")

cleanup() {
    rm -f "$BUILD_CONFIG"
}

trap cleanup EXIT

ANDROID_HOME=${ANDROID_HOME:-"$HOME/Library/Android/sdk"}
ANDROID_KEY_ALIAS=${ANDROID_KEY_ALIAS:-topleaders}
ANDROID_KEYSTORE_PATH=${ANDROID_KEYSTORE_PATH:-"$PROJECT_ROOT/certs/android/topleaders-release.jks"}

: "${ANDROID_KEYSTORE_PASSWORD:?Set ANDROID_KEYSTORE_PASSWORD before building a signed Android release.}"

ANDROID_KEY_PASSWORD=${ANDROID_KEY_PASSWORD:-$ANDROID_KEYSTORE_PASSWORD}

"$SCRIPT_DIR/ensure-android-keystore.sh"

cat > "$BUILD_CONFIG" <<EOF
{
  "android": {
    "release": {
      "keystore": "$ANDROID_KEYSTORE_PATH",
      "storePassword": "$ANDROID_KEYSTORE_PASSWORD",
      "alias": "$ANDROID_KEY_ALIAS",
      "password": "$ANDROID_KEY_PASSWORD",
      "packageType": "$PACKAGE_TYPE"
    }
  }
}
EOF

export ANDROID_HOME
export NODE_ENV=production

npx ionic cordova build android --prod --release --buildConfig="$BUILD_CONFIG"
