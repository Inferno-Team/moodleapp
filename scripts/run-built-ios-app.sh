#!/bin/sh

set -eu

APP_PATH="$(find platforms/ios/build -maxdepth 2 -type d -name '*.app' | head -n 1)"

if [ -z "${APP_PATH}" ]; then
    echo "No built iOS app found under platforms/ios/build." >&2
    exit 1
fi

echo "Launching iOS app: ${APP_PATH}"
exec npx native-run ios --app "${APP_PATH}"
