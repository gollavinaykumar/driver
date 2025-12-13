# Production Deployment Guide

This guide will help you deploy the Driver mobile app to the Google Play Store.

## Prerequisites

1. **Java Development Kit (JDK)** - Version 17 or higher
2. **Android Studio** - Latest version
3. **Google Play Console Account** - With app listing created
4. **Production API URL** - Update `src/utils/getAPI.ts` with production endpoint

## Step 1: Generate Release Keystore

**⚠️ CRITICAL: Keep this keystore file and passwords secure! You'll need them for all future updates.**

```bash
npm run generate:keystore
```

This will:

- Generate a keystore file at `android/app/release.keystore`
- Prompt you for keystore password and key password
- Ask for your name and organization details

**Save the passwords securely!** You'll need them for every update.

## Step 2: Configure Keystore Passwords

1. Open `android/gradle.properties`
2. Update these values:
   ```
   MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
   MYAPP_RELEASE_KEY_PASSWORD=your_key_password
   ```

**⚠️ Never commit passwords to git!** Consider using environment variables or a secure password manager.

## Step 3: Update Production API URL

1. Open `src/utils/getAPI.ts`
2. Change the return value to your production API:
   ```typescript
   export function getBackendAPI(): string {
     return 'https://api.goodseva.com/api'; // Your production URL
   }
   ```

## Step 4: Update App Version

1. Open `android/app/build.gradle`
2. Update version information:
   ```gradle
   versionCode 1        // Increment for each release
   versionName "1.0.0"  // Semantic versioning
   ```

## Step 5: Build Release APK/AAB

### Option A: Build APK (for direct installation)

```bash
npm run build:android:release
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### Option B: Build AAB (for Play Store - Recommended)

```bash
npm run build:android:bundle
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

**Play Store requires AAB format for new apps.**

## Step 6: Test the Release Build

Before uploading to Play Store, test the release build:

```bash
# Install on connected device
adb install android/app/build/outputs/apk/release/app-release.apk
```

Test all critical features:

- ✅ Login/authentication
- ✅ API connectivity
- ✅ Location services
- ✅ All main screens

## Step 7: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Go to **Production** → **Create new release**
4. Upload the AAB file (`app-release.aab`)
5. Fill in release notes
6. Review and publish

## Step 8: Production Checklist

Before final deployment, verify:

- [ ] Production API URL is configured
- [ ] Keystore passwords are set in `gradle.properties`
- [ ] App version is incremented
- [ ] All console.log statements removed (using logger utility)
- [ ] ProGuard is enabled (already configured)
- [ ] SSL certificate is properly configured for production domain
- [ ] App has been tested on physical device
- [ ] All features work correctly
- [ ] App icon and metadata are set
- [ ] Privacy policy URL is configured (if required)

## Troubleshooting

### Build Fails: "Keystore file not found"

- Make sure you've run `npm run generate:keystore`
- Verify `android/app/release.keystore` exists

### Build Fails: "Keystore password incorrect"

- Check `android/gradle.properties` has correct passwords
- Ensure no extra spaces in password values

### App Crashes on Release Build

- Check ProGuard rules in `android/app/proguard-rules.pro`
- Test with `minifyEnabled false` first to isolate issues
- Check logs: `adb logcat | grep -i error`

### Network Errors in Production

- Verify production API URL is correct
- Check SSL certificate configuration
- Ensure production server has valid SSL certificate

## Security Notes

1. **Never commit** `release.keystore` or passwords to git
2. **Backup keystore** to secure location (you'll need it forever!)
3. **Use environment variables** for sensitive data in production
4. **Enable ProGuard** to obfuscate code (already enabled)

## Version Management

For each release:

1. Increment `versionCode` (required by Play Store)
2. Update `versionName` (user-visible version)
3. Update changelog in Play Console

Example:

```gradle
versionCode 2        // Was 1, now 2
versionName "1.0.1"  // Patch version update
```

## Support

For issues or questions:

- Check React Native docs: https://reactnative.dev/docs/signed-apk-android
- Google Play Console help: https://support.google.com/googleplay/android-developer
