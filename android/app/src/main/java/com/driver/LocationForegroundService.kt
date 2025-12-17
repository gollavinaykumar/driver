package com.driver

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.os.Build
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class LocationForegroundService : Service() {

    companion object {
        private const val TAG = "LocationForegroundSvc"
        private const val CHANNEL_ID = "location_tracking_channel"
        private const val NOTIFICATION_ID = 1001
        private const val MIN_DISTANCE_METERS = 300f
        private const val MIN_TIME_MS = 120000L // 2 minutes

        var driverId: String? = null
        var vehicleId: String? = null
        var authToken: String? = null
        var backendUrl: String? = null
        var isRunning = false
    }

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private var lastSentLocation: Location? = null
    private var lastSentTime: Long = 0
    private val httpClient = OkHttpClient()

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service onCreate")
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Service onStartCommand")

        // Extract data from intent
        intent?.let {
            driverId = it.getStringExtra("driverId") ?: driverId
            vehicleId = it.getStringExtra("vehicleId") ?: vehicleId
            authToken = it.getStringExtra("authToken") ?: authToken
            backendUrl = it.getStringExtra("backendUrl") ?: backendUrl
        }

        Log.d(TAG, "driverId=$driverId, vehicleId=$vehicleId, backendUrl=$backendUrl")

        // Start foreground with notification
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)
        isRunning = true

        // Start location updates
        startLocationUpdates()

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Service onDestroy")
        stopLocationUpdates()
        isRunning = false
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Location Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Tracking your location for active trip"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Trip Active")
            .setContentText("Tracking your location...")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun startLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED
        ) {
            Log.e(TAG, "Location permission not granted")
            stopSelf()
            return
        }

        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            30000L // Request every 30 seconds
        ).apply {
            setMinUpdateIntervalMillis(15000L) // Fastest: 15 seconds
            setMinUpdateDistanceMeters(50f) // Minimum 50m movement
        }.build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { location ->
                    handleNewLocation(location)
                }
            }
        }

        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        )
        Log.d(TAG, "Location updates started")
    }

    private fun stopLocationUpdates() {
        if (::locationCallback.isInitialized) {
            fusedLocationClient.removeLocationUpdates(locationCallback)
            Log.d(TAG, "Location updates stopped")
        }
    }

    private fun handleNewLocation(location: Location) {
        val now = System.currentTimeMillis()
        val lastLoc = lastSentLocation
        val lastTime = lastSentTime

        // Throttle: only send if moved MIN_DISTANCE_METERS or MIN_TIME_MS passed
        val shouldSend = if (lastLoc == null) {
            true
        } else {
            val distance = location.distanceTo(lastLoc)
            val timeDiff = now - lastTime
            distance >= MIN_DISTANCE_METERS || timeDiff >= MIN_TIME_MS
        }

        if (shouldSend) {
            Log.d(TAG, "Sending location: lat=${location.latitude}, lng=${location.longitude}")
            sendLocationToBackend(location.latitude, location.longitude)
            lastSentLocation = location
            lastSentTime = now
        } else {
            Log.d(TAG, "Skipping location update (throttled)")
        }
    }

    private fun sendLocationToBackend(lat: Double, lng: Double) {
        val url = backendUrl ?: return
        val driver = driverId ?: return
        val vehicle = vehicleId ?: return
        val token = authToken ?: return

        // Send to /updateLocation endpoint
        val json = JSONObject().apply {
            put("driverId", driver)
            put("vehicleId", vehicle)
            put("lat", lat)
            put("lng", lng)
        }

        val requestBody = json.toString().toRequestBody("application/json".toMediaType())
        val request = Request.Builder()
            .url("$url/updateLocation")
            .put(requestBody)
            .addHeader("Authorization", "Bearer $token")
            .addHeader("Content-Type", "application/json")
            .build()

        httpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(TAG, "Failed to send location: ${e.message}")
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (it.isSuccessful) {
                        Log.d(TAG, "Location sent successfully")
                    } else {
                        Log.e(TAG, "Location send failed: ${it.code}")
                    }
                }
            }
        })
    }
}


