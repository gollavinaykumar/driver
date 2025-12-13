#!/bin/bash
# Script to rebuild APK with bundled JavaScript

echo "🔄 Rebuilding APK with bundled JavaScript..."
echo ""

# Step 1: Create assets directory
echo "1️⃣ Creating assets directory..."
mkdir -p android/app/src/main/assets

# Step 2: Bundle JavaScript
echo "2️⃣ Bundling JavaScript..."
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/ \
  --reset-cache

if [ $? -ne 0 ]; then
  echo "❌ Failed to bundle JavaScript"
  exit 1
fi

# Step 3: Build APK
echo ""
echo "3️⃣ Building APK..."
cd android && ./gradlew assembleDebug

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ APK built successfully!"
  echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
  echo ""
  echo "To install on connected device:"
  echo "  adb install -r android/app/build/outputs/apk/debug/app-debug.apk"
else
  echo "❌ Failed to build APK"
  exit 1
fi






