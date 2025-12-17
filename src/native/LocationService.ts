/**
 * Native module wrapper for Android background location tracking service
 * This uses a foreground service to keep tracking alive when app is in background
 */

import { NativeModules, Platform } from 'react-native';
import { logger } from '../utils/logger';

const { LocationModule } = NativeModules;

interface LocationServiceParams {
  driverId: string;
  vehicleId: string;
  authToken: string;
  backendUrl: string;
}

/**
 * Start the native foreground service for background location tracking
 * Shows a persistent notification while tracking
 */
export async function startBackgroundLocationService(
  params: LocationServiceParams,
): Promise<boolean> {
  if (Platform.OS !== 'android') {
    logger.warn('Background location service only available on Android');
    return false;
  }

  if (!LocationModule) {
    logger.error('LocationModule is not available');
    return false;
  }

  try {
    const { driverId, vehicleId, authToken, backendUrl } = params;

    if (!driverId || !vehicleId || !authToken || !backendUrl) {
      logger.error('Missing required params for background tracking', {
        hasDriverId: !!driverId,
        hasVehicleId: !!vehicleId,
        hasAuthToken: !!authToken,
        hasBackendUrl: !!backendUrl,
      });
      return false;
    }

    logger.log('🚀 Starting native background location service...');
    const result = await LocationModule.startBackgroundTracking(
      driverId,
      vehicleId,
      authToken,
      backendUrl,
    );
    logger.log('✅ Native background location service started');
    return result;
  } catch (error) {
    logger.error('❌ Failed to start background location service:', error);
    return false;
  }
}

/**
 * Stop the native foreground service
 */
export async function stopBackgroundLocationService(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  if (!LocationModule) {
    logger.error('LocationModule is not available');
    return false;
  }

  try {
    logger.log('🛑 Stopping native background location service...');
    const result = await LocationModule.stopBackgroundTracking();
    logger.log('✅ Native background location service stopped');
    return result;
  } catch (error) {
    logger.error('❌ Failed to stop background location service:', error);
    return false;
  }
}

/**
 * Check if the native tracking service is currently running
 */
export async function isBackgroundTrackingActive(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  if (!LocationModule) {
    return false;
  }

  try {
    return await LocationModule.isTrackingActive();
  } catch (error) {
    logger.error('Failed to check tracking status:', error);
    return false;
  }
}


