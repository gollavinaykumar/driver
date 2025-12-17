package com.driver

import android.content.Intent
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*

class LocationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "LocationModule"
    }

    override fun getName(): String = "LocationModule"

    @ReactMethod
    fun startBackgroundTracking(
        driverId: String,
        vehicleId: String,
        authToken: String,
        backendUrl: String,
        promise: Promise
    ) {
        try {
            Log.d(TAG, "startBackgroundTracking called")
            Log.d(TAG, "driverId=$driverId, vehicleId=$vehicleId, backendUrl=$backendUrl")

            val context = reactApplicationContext
            val intent = Intent(context, LocationForegroundService::class.java).apply {
                putExtra("driverId", driverId)
                putExtra("vehicleId", vehicleId)
                putExtra("authToken", authToken)
                putExtra("backendUrl", backendUrl)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }

            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting service", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopBackgroundTracking(promise: Promise) {
        try {
            Log.d(TAG, "stopBackgroundTracking called")
            val context = reactApplicationContext
            val intent = Intent(context, LocationForegroundService::class.java)
            context.stopService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping service", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun isTrackingActive(promise: Promise) {
        promise.resolve(LocationForegroundService.isRunning)
    }
}


