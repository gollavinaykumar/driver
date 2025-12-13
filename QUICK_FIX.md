# Quick Fix: "Unable to Load Script" Error

## Your device is connected via USB - Use this method:

### Step 1: Set up port forwarding

```bash
adb reverse tcp:8081 tcp:8081
```

### Step 2: Reload the app

In Metro bundler terminal, press `r` to reload, OR:

```bash
# Kill and restart the app
adb shell am force-stop com.driver
npm run android:device
```

### Step 3: If still not working - Manual Dev Server Setup

1. **Shake your device** (or press `Cmd+M` / `Ctrl+M`)
2. Tap **"Settings"** (or open Dev Menu)
3. Tap **"Debug server host & port for device"**
4. Enter: `localhost:8081` (since you're using USB with adb reverse)
5. Go back and tap **"Reload"**

## Alternative: Use WiFi IP

If USB method doesn't work:

1. Make sure phone and computer are on **same WiFi**
2. Shake device → Settings → "Debug server host & port"
3. Enter: `192.168.0.114:8081` (your computer's IP)
4. Reload

## Verify Connection

Check if port forwarding is active:

```bash
adb reverse --list
```

Should show: `tcp:8081 tcp:8081`

## Still Not Working?

1. **Restart Metro with cache clear:**

   ```bash
   npm start -- --reset-cache
   ```

2. **Uninstall and reinstall app:**

   ```bash
   adb uninstall com.driver
   npm run android:device
   ```

3. **Check Metro is listening on all interfaces:**
   ```bash
   lsof -i :8081
   ```
   Should show `*:8081` (not just `localhost:8081`)
