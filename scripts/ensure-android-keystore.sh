#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

KEYTOOL_BIN=${KEYTOOL_BIN:-$(command -v keytool || true)}

if [ -z "$KEYTOOL_BIN" ]; then
    echo "keytool was not found on PATH. Set KEYTOOL_BIN or JAVA_HOME first." >&2
    exit 1
fi

: "${ANDROID_KEYSTORE_PASSWORD:?Set ANDROID_KEYSTORE_PASSWORD to create or use the Android release keystore.}"

ANDROID_KEY_ALIAS=${ANDROID_KEY_ALIAS:-topleaders}
ANDROID_KEY_PASSWORD=${ANDROID_KEY_PASSWORD:-$ANDROID_KEYSTORE_PASSWORD}
ANDROID_KEYSTORE_PATH=${ANDROID_KEYSTORE_PATH:-"$PROJECT_ROOT/certs/android/topleaders-release.jks"}
ANDROID_KEYSTORE_DNAME=${ANDROID_KEYSTORE_DNAME:-CN=TOP LEADERS, OU=Mobile, O=Digiworld Developers, L=Unknown, S=Unknown, C=US}

mkdir -p "$(dirname "$ANDROID_KEYSTORE_PATH")"

if [ -f "$ANDROID_KEYSTORE_PATH" ]; then
    echo "Using existing Android keystore: $ANDROID_KEYSTORE_PATH"
    exit 0
fi

"$KEYTOOL_BIN" -genkeypair \
    -v \
    -keystore "$ANDROID_KEYSTORE_PATH" \
    -storepass "$ANDROID_KEYSTORE_PASSWORD" \
    -alias "$ANDROID_KEY_ALIAS" \
    -keypass "$ANDROID_KEY_PASSWORD" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "$ANDROID_KEYSTORE_DNAME"

echo "Created Android keystore: $ANDROID_KEYSTORE_PATH"
