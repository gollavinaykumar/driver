import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  PermissionsAndroid,
  Platform,
  AppState,
  RefreshControl,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StepTracker from '../components/StepTracker';
import TripComponent from '../components/TripComponent';
import VehicleCard from '../components/VehicleCard';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
  getSingleVehicleByVehicleId,
  getTripByVehicleId,
  getDriverById,
  getLoadByLoadId,
  updateLocationToVehicleAndDriver,
  updatePickUPLoadTrip,
  updateDropLoadTrip,
} from '../services/apiService';

import { getUserData } from '../utils/getUserData';
import { getToken } from '../utils/getUserToken';
import { getBackendAPI } from '../utils/getAPI';
import PinInputModal from '../components/common/PinInputModal';
import { useVehicleStore } from '../store/VehicleStore';
import { useDriverStore } from '../store/DriverStore';
import { getMapsAPIKey } from '../utils/getMapsApiKey';
import { SocketContext } from '../utils/SocketContext';
import { Load } from '../types/loadInterface';
import { logger } from '../utils/logger';
import {
  startBackgroundLocationService,
  stopBackgroundLocationService,
} from '../native/LocationService';

interface LocationCoords {
  lat: number;
  lng: number;
}

const toRad = (value: number): number => (value * Math.PI) / 180;

// Haversine distance between two coordinates in meters
const calculateDistanceMeters = (
  a: LocationCoords,
  b: LocationCoords,
): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
};

interface Driver {
  id: string;
  vehicleId: string;
  name: string;
  image: string;
  ownerId: string;
}

interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
}

interface Trip {
  id: string;
  loadId: string;
  status: string;
  pickUpPIN?: string;
  deliveryPIN?: string;
}

export default function HomeScreen() {
  const [location, setLocation] = useState('Fetching location...');
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [load, setLoad] = useState<Load | null>(null);

  const [isActiveTrip, setIsActiveTrip] = useState(false);

  const [isEwayModalOpen, setIsEwayModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [pickupPin, setPickupPin] = useState('');
  const [deliveryPin, setDeliveryPin] = useState('');

  const [pickedLoad, setPickedLoad] = useState(false);
  const hasJoinedTrackingRoomRef = useRef(false);
  const joinRoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastJoinAttemptRef = useRef<number>(0);

  // Throttle backend location updates and initial profile fetch
  const lastBackendLocationRef = React.useRef<LocationCoords | null>(null);
  const lastBackendLocationTimeRef = React.useRef<number | null>(null);
  const hasLoadedDriverDataRef = React.useRef(false);

  const setVehicleForStore = useVehicleStore(state => state.setVehicle);
  const setProfileForStore = useDriverStore(state => state.setDriver);

  const [appState, setAppState] = useState(AppState.currentState);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);
  const insets = useSafeAreaInsets();
  const socketContext = useContext(SocketContext);
  const socket = socketContext?.socket;

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        // Check if foreground location permission is already granted
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (hasPermission) {
          return true;
        }

        // Request foreground location permission only
        const foregroundGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to track trips.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        // Handle different permission results
        if (foregroundGranted === PermissionsAndroid.RESULTS.DENIED) {
          logger.warn('Location permission denied by user');
          return false;
        }

        if (foregroundGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          logger.warn('Location permission permanently denied');
          Alert.alert(
            'Location Permission Required',
            'Location permission is required for trip tracking. Please enable it in app settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return false;
        }

        // Foreground permission granted – we do NOT request background permission.
        // Foreground is enough for current app behavior and avoids extra MIUI dialogs.
        if (foregroundGranted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        }

        return false;
      } else if (Platform.OS === 'ios') {
        // iOS permission handling
        return new Promise(resolve => {
          Geolocation.requestAuthorization(
            () => {
              // Permission granted
              resolve(true);
            },
            error => {
              // Permission denied
              logger.error('iOS location permission error:', error);
              Alert.alert(
                'Location Permission Required',
                'Location permission is required for trip tracking. Please enable it in Settings.',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => resolve(false),
                  },
                  {
                    text: 'Open Settings',
                    onPress: () => {
                      Linking.openSettings();
                      resolve(false);
                    },
                  },
                ],
              );
            },
          );
        });
      }

      return false;
    } catch (err) {
      logger.error('Permission request error:', err);
      return false;
    }
  }, []);

  const reverseGeocodeWithGoogle = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      try {
        const apiKey = getMapsAPIKey();
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
        );
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
          return data.results[0].formatted_address;
        }
        return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
      } catch (error) {
        logger.error('Google Geocoding error:', error);
        return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
      }
    },
    [],
  );

  const fetchTripDetailsWithGoogle = useCallback(
    async (
      originCoords: LocationCoords,
      destCoords: LocationCoords,
    ): Promise<void> => {
      try {
        const apiKey = getMapsAPIKey();
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${originCoords.lat},${originCoords.lng}&destination=${destCoords.lat},${destCoords.lng}&key=${apiKey}`,
        );
        const data = await response.json();

        if (data.status === 'OK' && data.routes.length > 0) {
          const route = data.routes[0];
          const leg = route.legs[0];
          setDistance(leg.distance.text);
          setDuration(leg.duration.text);
        }
      } catch (error) {
        logger.error('Error fetching trip details:', error);
      }
    },
    [],
  );

  useEffect(() => {
    if (!socket || !driver?.id) {
      return;
    }

    const MIN_JOIN_INTERVAL = 5000; // 5 seconds minimum between changes
    const now = Date.now();

    if (now - lastJoinAttemptRef.current < MIN_JOIN_INTERVAL) {
      if (joinRoomTimeoutRef.current) {
        clearTimeout(joinRoomTimeoutRef.current);
      }

      joinRoomTimeoutRef.current = setTimeout(() => {
        handleRoomManagement();
      }, MIN_JOIN_INTERVAL - (now - lastJoinAttemptRef.current));

      return;
    }

    handleRoomManagement();
    lastJoinAttemptRef.current = now;

    function handleRoomManagement() {
      if (isActiveTrip && !hasJoinedTrackingRoomRef.current && driver) {
        // Join room
        logger.log('🔄 Joining tracking room for driver:', driver.id);
        socket?.emit('joinTrackingRoom', {
          driverId: driver.id,
        });
        hasJoinedTrackingRoomRef.current = true;

        socket?.on('liveDriverLocation', locationData => {
          logger.log(
            'Received live location update from server:',
            locationData,
          );
        });
      } else if (!isActiveTrip && hasJoinedTrackingRoomRef.current && driver) {
        // Leave room
        logger.log('🔄 Leaving tracking room for driver:', driver.id);
        socket?.emit('leaveTrackingRoom', { driverId: driver.id });
        socket?.off('liveDriverLocation');
        hasJoinedTrackingRoomRef.current = false;
      }
    }

    // Cleanup
    return () => {
      if (joinRoomTimeoutRef.current) {
        clearTimeout(joinRoomTimeoutRef.current);
      }

      // Only cleanup socket listeners, don't emit leave here
      socket.off('liveDriverLocation');
    };
  }, [socket, driver?.id, isActiveTrip, driver]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      if (joinRoomTimeoutRef.current) {
        clearTimeout(joinRoomTimeoutRef.current);
      }

      // Cleanup socket on unmount
      if (socket && driver?.id && hasJoinedTrackingRoomRef.current) {
        logger.log('🧹 Cleaning up socket room on unmount');
        socket.emit('leaveTrackingRoom', { driverId: driver.id });
        socket.off('liveDriverLocation');
        hasJoinedTrackingRoomRef.current = false;
      }
    };
  }, [socket, driver?.id]);

  const setupBackgroundLocationUpdates = useCallback((): number | null => {
    if (!isActiveTrip || !driver?.id) return null;

    try {
      const watchId = Geolocation.watchPosition(
        position => {
          try {
            const { latitude, longitude } = position.coords;
            setCoords({ lat: latitude, lng: longitude });

            reverseGeocodeWithGoogle(latitude, longitude)
              .then(address => {
                setLocation(address);
              })
              .catch(err => {
                logger.warn('Geocoding error in watchPosition:', err);
                setLocation(
                  `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                );
              });

            if (
              driver?.id &&
              socket?.connected &&
              hasJoinedTrackingRoomRef.current
            ) {
              try {
                socket?.emit('sendDriverLocation', {
                  driverId: driver.id,
                  lat: latitude,
                  lng: longitude,
                });

                logger.log('📤 Sent location to server:', {
                  driverId: driver.id,
                  lat: latitude,
                  lng: longitude,
                  socketConnected: socket?.connected,
                  hasJoinedRoom: hasJoinedTrackingRoomRef.current,
                });

                logger.log('📍 Location sent to tracking room:', {
                  driverId: driver.id,
                  latitude,
                  longitude,
                });
              } catch (trackingSocketError) {
                logger.error(
                  'Error sending location to tracking room:',
                  trackingSocketError,
                );
              }
            }
          } catch (err) {
            logger.error('Error in watchPosition callback:', err);
          }
        },
        error => {
          logger.error('Background location error:', error);

          // If permission denied, stop watching
          if (error.code === error.PERMISSION_DENIED) {
            logger.warn(
              'Location permission denied, stopping background updates',
            );
            if (locationWatchId !== null) {
              try {
                Geolocation.clearWatch(locationWatchId);
                setLocationWatchId(null);
              } catch (clearError) {
                logger.error('Error clearing watch:', clearError);
              }
            }
          }
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 20000,
          fastestInterval: 15000,
        },
      );

      return watchId;
    } catch (err) {
      logger.error('Error setting up background location updates:', err);
      return null;
    }
  }, [
    isActiveTrip,
    reverseGeocodeWithGoogle,
    driver?.id,
    socket,
    locationWatchId,
  ]);

  const fetchLocationWithRetry = useCallback(
    async (retryCount = 0): Promise<void> => {
      try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          setLocation(
            'Location permission required. Please enable in settings.',
          );
          return;
        }

        return new Promise(resolve => {
          try {
            Geolocation.getCurrentPosition(
              async position => {
                try {
                  const { latitude, longitude } = position.coords;
                  setCoords({ lat: latitude, lng: longitude });

                  try {
                    const address = await reverseGeocodeWithGoogle(
                      latitude,
                      longitude,
                    );
                    setLocation(address);
                  } catch (geocodeError) {
                    logger.warn('Geocoding error:', geocodeError);
                    setLocation(
                      `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(
                        6,
                      )}`,
                    );
                  }

                  if (
                    driver?.id &&
                    socket?.connected &&
                    isActiveTrip &&
                    hasJoinedTrackingRoomRef.current
                  ) {
                    try {
                      socket.emit('sendDriverLocation', {
                        driverId: driver.id,
                        lat: latitude,
                        lng: longitude,
                      });

                      logger.log('📍 Manual location sent to tracking room:', {
                        driverId: driver.id,
                        latitude,
                        longitude,
                      });
                    } catch (socketError) {
                      logger.error(
                        'Error sending manual location:',
                        socketError,
                      );
                    }
                  }

                  resolve();
                } catch (err) {
                  logger.error('Error processing location:', err);
                  setLocation('Error processing location');
                  resolve();
                }
              },
              error => {
                logger.error('Location error:', error);

                if (error.code === error.PERMISSION_DENIED) {
                  setLocation(
                    'Location permission denied. Please enable in settings.',
                  );
                  resolve();
                  return;
                }

                // Retry for other errors
                if (retryCount < 2) {
                  setTimeout(() => {
                    fetchLocationWithRetry(retryCount + 1);
                  }, 2000);
                  return;
                }

                let errorMessage = 'Failed to get location';
                switch (error.code) {
                  case error.PERMISSION_DENIED:
                    errorMessage = 'Location permission denied';
                    break;
                  case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location services disabled';
                    break;
                  case error.TIMEOUT:
                    errorMessage = 'Location request timeout';
                    break;
                  default:
                    errorMessage = 'Location unavailable';
                }

                setLocation(errorMessage);
                resolve();
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
              },
            );
          } catch (err) {
            logger.error('Geolocation.getCurrentPosition error:', err);
            setLocation('Location service error');
            resolve();
          }
        });
      } catch (error) {
        logger.error('fetchLocationWithRetry error:', error);
        setLocation('Location error occurred');
      }
    },
    [
      requestLocationPermission,
      reverseGeocodeWithGoogle,
      driver?.id,
      socket,
      isActiveTrip,
    ],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchLocationWithRetry();
    } finally {
      setRefreshing(false);
    }
  }, [fetchLocationWithRetry]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        fetchLocationWithRetry();
      }

      if (nextAppState === 'background' && isActiveTrip) {
        if (!locationWatchId) {
          const watchId = setupBackgroundLocationUpdates();
          setLocationWatchId(watchId);
        }
      }

      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [
    appState,
    isActiveTrip,
    locationWatchId,
    fetchLocationWithRetry,
    setupBackgroundLocationUpdates,
  ]);

  useEffect(() => {
    const startNativeService = async () => {
      if (!driver?.id || !vehicle?.id) {
        logger.warn('Cannot start native tracking: missing driver or vehicle');
        return;
      }

      try {
        const token = await getToken();
        const backendUrl = getBackendAPI();

        if (!token) {
          logger.error('Cannot start native tracking: no auth token');
          return;
        }

        logger.log('🚀 Starting native background location service...');
        await startBackgroundLocationService({
          driverId: driver.id,
          vehicleId: vehicle.id,
          authToken: token,
          backendUrl: backendUrl,
        });
      } catch (err) {
        logger.error('Error starting native tracking:', err);
      }
    };

    if (isActiveTrip) {
      const watchId = setupBackgroundLocationUpdates();
      if (watchId !== null) {
        setLocationWatchId(watchId);
      }

      fetchLocationWithRetry();

      if (Platform.OS === 'android') {
        startNativeService();
      }
    } else {
      if (locationWatchId !== null) {
        try {
          Geolocation.clearWatch(locationWatchId);
          setLocationWatchId(null);
        } catch (err) {
          logger.error('Error clearing watch:', err);
        }
      }

      if (Platform.OS === 'android') {
        stopBackgroundLocationService().catch(err =>
          logger.error('Error stopping native service:', err),
        );
      }
    }

    return () => {
      if (locationWatchId !== null) {
        try {
          Geolocation.clearWatch(locationWatchId);
        } catch (err) {
          logger.error('Error clearing watch in cleanup:', err);
        }
      }

      // Stop native service on unmount
      if (Platform.OS === 'android') {
        stopBackgroundLocationService().catch(err =>
          logger.error('Error stopping native service on cleanup:', err),
        );
      }
    };
  }, [
    isActiveTrip,
    setupBackgroundLocationUpdates,
    fetchLocationWithRetry,
    locationWatchId,
    driver?.id,
    vehicle?.id,
  ]);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setLocation('Location service unavailable');
      }
    }, 15000);

    return () => clearTimeout(loadingTimeout);
  }, [loading]);

  useEffect(() => {
    fetchLocationWithRetry().catch(() => {
      setLoading(false);
      setLocation('Location service unavailable');
    });
  }, [fetchLocationWithRetry]);

  const validatePin = (pin: string, expectedPin: string): boolean => {
    return pin === expectedPin;
  };

  const handleCollectLoad = async (): Promise<void> => {
    if (trip?.pickUpPIN && !validatePin(pickupPin, trip.pickUpPIN)) {
      Alert.alert('Error', 'Invalid pickup PIN. Please check and try again.');
      return;
    }

    try {
      const data = {
        tripId: trip?.id,
        locationData: {
          lat: coords?.lat,
          lng: coords?.lng,
          address: location,
        },
        loadId: load?.id,
      };

      const res = await updatePickUPLoadTrip(data, vehicle?.id ?? '');

      if (res.message === 'success') {
        setPickedLoad(true);
        setTrip(trip ? { ...trip, status: 'IN_PROGRESS' } : null);
        setIsEwayModalOpen(false);
        setPickupPin('');
        Alert.alert('Success', 'Trip is now IN_PROGRESS!');

        if (!locationWatchId) {
          const watchId = setupBackgroundLocationUpdates();
          setLocationWatchId(watchId);
        }
      } else {
        Alert.alert('Error', 'Error updating trip status.');
      }
    } catch (error) {
      logger.error('Error updating trip status:', error);
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  const handleDeliverLoad = async (): Promise<void> => {
    if (trip?.deliveryPIN && !validatePin(deliveryPin, trip.deliveryPIN)) {
      Alert.alert('Error', 'Invalid delivery PIN. Please check and try again.');
      return;
    }

    try {
      const data = {
        tripId: trip?.id,
        locationData: {
          lat: coords?.lat,
          lng: coords?.lng,
          address: location,
        },
        loadId: load?.id,
      };

      const res = await updateDropLoadTrip(data, vehicle?.id ?? '');

      if (res.message === 'success') {
        setTrip(trip ? { ...trip, status: 'COMPLETED' } : null);
        setIsInvoiceModalOpen(false);
        setDeliveryPin('');
        Alert.alert('Success', 'Trip is now COMPLETED!');

        // Stop background location tracking when trip completes
        if (locationWatchId !== null) {
          Geolocation.clearWatch(locationWatchId);
          setLocationWatchId(null);
        }
      } else {
        Alert.alert('Error', 'Error updating trip status.');
      }
    } catch (error) {
      logger.error('Error updating trip status:', error);
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  const openGoogleMaps = (): void => {
    if (!coords || !load?.destination) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${load.destination.lat},${load.destination.lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  const fetchDriverData = useCallback(async (): Promise<void> => {
    try {
      const userData = await getUserData();
      const driverRes = await getDriverById(userData?.userId);
      const vehicleRes = await getSingleVehicleByVehicleId(driverRes.vehicleId);
      const tripRes = await getTripByVehicleId(vehicleRes?.id);

      // Check if trip exists and has a valid status
      const hasActiveTrip =
        tripRes &&
        tripRes.message !== 'Trip not found for this vehicle' &&
        tripRes.id; // Ensure trip has an ID

      // Only update if state actually changed
      setIsActiveTrip(prev => {
        const newValue = !!hasActiveTrip;
        return prev !== newValue ? newValue : prev;
      });

      if (vehicleRes?.id) {
        setVehicle(vehicleRes);
        setVehicleForStore(vehicleRes);
      }
      if (driverRes?.id) {
        setDriver(driverRes);
        setProfileForStore(driverRes);
      }

      if (hasActiveTrip) {
        setTrip(tripRes);
        const loadRes = await getLoadByLoadId(tripRes.loadId);
        if (loadRes?.id) setLoad(loadRes);

        if (coords && loadRes?.destination) {
          fetchTripDetailsWithGoogle(
            { lat: coords.lat, lng: coords.lng },
            { lat: loadRes.destination.lat, lng: loadRes.destination.lng },
          );
        }
      } else {
        // Clear trip-related data when no active trip
        setTrip(null);
        setLoad(null);
        setDistance(null);
        setDuration(null);
      }
    } catch (error) {
      logger.error('Error fetching driver data:', error);
      setIsActiveTrip(false);
    }
  }, [
    coords,
    fetchTripDetailsWithGoogle,
    setProfileForStore,
    setVehicleForStore,
  ]);

  useEffect(() => {
    if (!coords) {
      return;
    }

    // Load driver/vehicle/trip only once after we have an initial coordinate.
    if (!hasLoadedDriverDataRef.current) {
      hasLoadedDriverDataRef.current = true;
      fetchDriverData();
    }
  }, [coords, fetchDriverData]);

  useEffect(() => {
    const updateBackendLocation = async (): Promise<void> => {
      if (!coords || !driver?.id) {
        return;
      }

      const now = Date.now();
      const lastCoords = lastBackendLocationRef.current;
      const lastTime = lastBackendLocationTimeRef.current;

      const MIN_TIME_DIFF_MS = 2 * 60 * 1000; // 2 minutes
      const MIN_DISTANCE_METERS = 300; // 300 meters

      if (lastCoords && lastTime) {
        const timeDiff = now - lastTime;
        const dist = calculateDistanceMeters(lastCoords, coords);

        if (timeDiff < MIN_TIME_DIFF_MS && dist < MIN_DISTANCE_METERS) {
          return;
        }
      }

      try {
        await updateLocationToVehicleAndDriver({
          tripId: trip?.id,
          lat: coords.lat,
          lng: coords.lng,
          driverId: driver.id,
          vehicleId: vehicle?.id,
        });
        lastBackendLocationRef.current = coords;
        lastBackendLocationTimeRef.current = now;
      } catch (error) {
        logger.error('Error updating location:', error);
      }
    };

    updateBackendLocation();
  }, [coords, driver, vehicle, trip]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isActiveTrip ? (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Location Display */}
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationLabel}>Current Location</Text>
                <View style={styles.locationStatusBadge}>
                  <Text style={styles.locationStatusText}>
                    {isActiveTrip ? 'Active Trip' : 'No Trip'}
                  </Text>
                </View>
              </View>
              <Text style={styles.locationAddress} numberOfLines={3}>
                {location}
              </Text>

              <View style={styles.trackingInfo}>
                <View style={styles.trackingItem}>
                  <Text style={styles.trackingLabel}>Background Tracking</Text>
                  <View
                    style={[
                      styles.statusIndicator,
                      isActiveTrip
                        ? styles.statusActive
                        : styles.statusInactive,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {isActiveTrip ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>
                </View>
                <View style={styles.trackingItem}>
                  <Text style={styles.trackingLabel}>Trip Status</Text>
                  <Text style={styles.tripStatusText}>
                    {trip?.status || 'NO TRIP'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Step Tracker */}
            <StepTracker
              pickedLoad={pickedLoad}
              nearDrop={trip?.status === 'COMPLETED'}
              tripStatus={trip?.status || ''}
            />

            {/* Trip Component */}
            {load && (
              <TripComponent
                load={load}
                distance={distance}
                duration={duration}
                tripStatus={trip?.status || ''}
              />
            )}

            {/* Vehicle Card */}
            {vehicle && <VehicleCard vehicle={vehicle} />}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {load?.pickupWindowStart &&
            new Date(load.pickupWindowStart) <= new Date() ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    trip?.status !== 'SCHEDULED' && styles.disabledButton,
                  ]}
                  disabled={trip?.status !== 'SCHEDULED'}
                  onPress={() => setIsEwayModalOpen(true)}
                >
                  <Text style={styles.buttonText}>Collect Load</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    (trip?.status === 'COMPLETED' ||
                      trip?.status !== 'IN_PROGRESS') &&
                      styles.disabledButton,
                  ]}
                  disabled={
                    trip?.status === 'COMPLETED' ||
                    trip?.status !== 'IN_PROGRESS'
                  }
                  onPress={() => setIsInvoiceModalOpen(true)}
                >
                  <Text style={styles.buttonText}>Deliver Load</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.scheduledMessage}>
                <Text style={styles.scheduledText}>
                  Trip starts at {'\n'}
                  <Text style={styles.scheduledTime}>
                    {load?.pickupWindowStart
                      ? new Date(load.pickupWindowStart).toLocaleString(
                          'en-IN',
                          {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )
                      : 'scheduled time'}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {coords && load?.destination && (
            <TouchableOpacity style={styles.fab} onPress={openGoogleMaps}>
              <MaterialIcons name="alt-route" size={44} />
            </TouchableOpacity>
          )}

          <PinInputModal
            visible={isEwayModalOpen}
            title="Collect Load"
            onClose={() => {
              setIsEwayModalOpen(false);
              setPickupPin('');
            }}
            onSubmit={handleCollectLoad}
            pin={pickupPin}
            onPinChange={setPickupPin}
            pinLabel="Pickup PIN"
            pinHelpText="Enter the pickup PIN provided for this trip"
            showPin={!!trip?.pickUpPIN}
            submitText="Collect Load"
            file={undefined}
            onFilePick={function (): void {
              throw new Error('Function not implemented.');
            }}
            onFileRemove={function (): void {
              throw new Error('Function not implemented.');
            }}
            fileLabel={''}
            fileHelpText={''}
          />

          <PinInputModal
            visible={isInvoiceModalOpen}
            title="Deliver Load"
            onClose={() => {
              setIsInvoiceModalOpen(false);
              setDeliveryPin('');
            }}
            onSubmit={handleDeliverLoad}
            pin={deliveryPin}
            onPinChange={setDeliveryPin}
            pinLabel="Delivery PIN"
            pinHelpText="Enter the delivery PIN provided for this trip"
            showPin={!!trip?.deliveryPIN}
            submitText="Deliver Load"
            file={undefined}
            onFilePick={function (): void {
              throw new Error('Function not implemented.');
            }}
            onFileRemove={function (): void {
              throw new Error('Function not implemented.');
            }}
            fileLabel={''}
            fileHelpText={''}
          />
        </>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.emptyContainer,
            { paddingTop: insets.top },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.emptyCard}>
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationLabel}>Current Location</Text>
                <View
                  style={[styles.locationStatusBadge, styles.statusInactive]}
                >
                  <Text style={styles.locationStatusText}>No Active Trip</Text>
                </View>
              </View>
              <Text style={styles.locationAddress} numberOfLines={3}>
                {location}
              </Text>
            </View>
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🚚</Text>
              <Text style={styles.emptyTitle}>No's Active Trips</Text>
              <Text style={styles.emptyDescription}>
                You don't have any active trips assigned at the moment.
              </Text>
              <Text style={styles.emptyActionText}>
                Please check back later for new trip assignments.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationLabel: {
    fontWeight: '600',
    fontSize: 18,
    color: '#2c3e50',
  },
  locationStatusBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6c757d',
  },
  locationAddress: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 16,
  },
  trackingInfo: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  trackingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#d4edda',
  },
  statusInactive: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#155724',
  },
  tripStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    textTransform: 'capitalize',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#adb5bd',
    shadowColor: 'transparent',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduledMessage: {
    alignItems: 'center',
    padding: 8,
  },
  scheduledText: {
    textAlign: 'center',
    color: '#6c757d',
    lineHeight: 22,
    fontSize: 15,
  },
  scheduledTime: {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: 'white',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCard: {
    width: '100%',
    maxWidth: 400,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#2c3e50',
  },
  emptyDescription: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  emptyActionText: {
    fontSize: 13,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 18,
  },
});
