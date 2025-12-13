#!/bin/bash
# Script to generate release keystore for Android app
# Run this once before building for production

KEYSTORE_PATH="android/app/release.keystore"
KEY_ALIAS="driver-release"

echo "🔐 Generating release keystore for Android app..."
echo ""
echo "You will be prompted to enter:"
echo "  - Keystore password (remember this!)"
echo "  - Key password (can be same as keystore password)"
echo "  - Your name and organization details"
echo ""

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore "$KEYSTORE_PATH" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Keystore generated successfully at: $KEYSTORE_PATH"
  echo ""
  echo "⚠️  IMPORTANT:"
  echo "   1. Add this file to .gitignore (already done)"
  echo "   2. Store the passwords securely"
  echo "   3. Update android/gradle.properties with your passwords"
  echo ""
  echo "Next steps:"
  echo "   1. Open android/gradle.properties"
  echo "   2. Set MYAPP_RELEASE_STORE_PASSWORD and MYAPP_RELEASE_KEY_PASSWORD"
  echo "   3. Run: npm run build:android:release"
else
  echo "❌ Failed to generate keystore"
  exit 1
fi

