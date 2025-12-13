# Troubleshooting "Unable to Load Script" Error

## Quick Fix Steps

### Step 1: Ensure Metro is Running

```bash
npm start
```

Keep this terminal open. Metro should show:

```
Metro waiting on exp://192.168.0.114:8081
```

### Step 2: Configure Device Manually

If automatic connection fails, manually set the dev server:

1. **Shake your device** (or press `Cmd+M` / `Ctrl+M` in emulator)
2. Tap **"Settings"** or open **Dev Menu**
3. Tap **"Debug server host & port for device"**
4. Enter: `192.168.0.114:8081` (your computer's IP)
5. Go back and tap **"Reload"**

### Step 3: Verify Same Network

- ✅ Phone and computer must be on **same WiFi network**
- ✅ Check phone WiFi IP: Settings → WiFi → Tap your network → Check IP
- ✅ Computer IP should be: `192.168.0.114` (check with `ifconfig`)

### Step 4: Check Firewall

**macOS:**

```bash
# Check if firewall is blocking
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# If enabled, allow Node.js
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

**Windows:**

- Go to Windows Defender Firewall
- Allow Node.js through firewall
- Allow port 8081

### Step 5: Use ADB Reverse (USB Connection)

If using USB:

```bash
adb reverse tcp:8081 tcp:8081
npm run android:device
```

### Step 6: Restart Everything

1. Stop Metro (Ctrl+C)
2. Clear Metro cache:
   ```bash
   npm start -- --reset-cache
   ```
3. Uninstall app from device:
   ```bash
   adb uninstall com.driver
   ```
4. Rebuild and install:
   ```bash
   npm run android:device
   ```

## Common Issues

### Issue: "Metro bundler not found"

**Solution:** Start Metro in a separate terminal:

```bash
npm start
```

### Issue: "Connection refused"

**Solution:**

- Check if Metro is listening on `0.0.0.0:8081` (not just localhost)
- Verify firewall isn't blocking
- Try ADB reverse if on USB

### Issue: "Timeout connecting to Metro"

**Solution:**

- Ensure same WiFi network
- Check IP address is correct
- Try manually setting dev server IP on device

### Issue: Works on emulator but not physical device

**Solution:**

- Emulator uses `10.0.2.2` automatically
- Physical device needs your computer's IP
- Use ADB reverse or set IP manually

## Testing Connection

Test if device can reach Metro:

```bash
# On your computer, check Metro is accessible
curl http://192.168.0.114:8081/status

# Should return JSON with Metro status
```

## Alternative: Bundle for Release

If Metro connection keeps failing, you can bundle the JS for testing:

```bash
# Create bundle
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

# Then build normally
npm run android
```

Note: This bundles JS into APK, so you won't get hot reload.
