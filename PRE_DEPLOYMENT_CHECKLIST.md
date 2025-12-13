# Pre-Deployment Checklist

Quick checklist before deploying to Play Store:

## 🔐 Security & Signing

- [ ] Generate release keystore: `npm run generate:keystore`
- [ ] Update `android/gradle.properties` with keystore passwords
- [ ] Verify `release.keystore` is in `.gitignore` (already done)

## 🌐 API Configuration

- [ ] **CRITICAL**: Update `src/utils/getAPI.ts` to production API URL
  - Current: `https://qa.goodseva.com/api`
  - Change to: Your production API URL

## 📱 App Configuration

- [ ] Update app version in `android/app/build.gradle`:

  - `versionCode`: Increment for each release
  - `versionName`: Update semantic version

- [ ] Verify app name in `app.json` is correct
- [ ] Check app icon is set (if not already done)

## 🔒 SSL Certificate

- [ ] If production API uses different domain:
  - Download production SSL certificate
  - Update `android/app/src/main/res/raw/qa_goodseva_cert.pem`
  - Or remove bundled cert if production has complete chain

## 🧪 Testing

- [ ] Build release APK: `npm run build:android:release`
- [ ] Install and test on physical device
- [ ] Verify all features work:
  - Login/authentication
  - API calls
  - Location services
  - All screens load correctly

## 📦 Build for Play Store

- [ ] Build AAB: `npm run build:android:bundle`
- [ ] Locate file: `android/app/build/outputs/bundle/release/app-release.aab`
- [ ] File size is reasonable (< 100MB recommended)

## ✅ Final Checks

- [ ] All console.log statements use logger utility (already done)
- [ ] ProGuard is enabled (already configured)
- [ ] No debug code or test endpoints
- [ ] App works without Metro bundler running

## 🚀 Ready to Deploy!

Once all items are checked:

1. Upload AAB to Google Play Console
2. Fill in release notes
3. Submit for review

---

**Need help?** See `DEPLOYMENT.md` for detailed instructions.
