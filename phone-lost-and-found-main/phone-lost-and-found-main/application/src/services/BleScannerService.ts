import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { storeLocation } from './api';

export const BACKGROUND_BLE_TASK = 'BACKGROUND_BLE_TASK';

// A single instance of BleManager should be used
export const bleManager = new BleManager();

// ------------------------------------------------------------------
// Client-side deduplication cache
// ------------------------------------------------------------------
// Prevents flooding the backend with identical requests.
// Key = deviceId, Value = timestamp (ms) of last successful push.
const lastPushTimestamps: Map<string, number> = new Map();
const MIN_PUSH_INTERVAL_MS = 6000; // Only push once every 6 seconds per device

/**
 * Check if we should push data for this device right now.
 * Returns true if enough time has passed since the last push.
 */
const shouldPushForDevice = (deviceId: string): boolean => {
  const lastPush = lastPushTimestamps.get(deviceId);
  if (!lastPush) return true;
  return Date.now() - lastPush >= MIN_PUSH_INTERVAL_MS;
};

/**
 * Record that we just pushed data for this device.
 */
const recordPush = (deviceId: string): void => {
  lastPushTimestamps.set(deviceId, Date.now());
};

export const startForegroundScan = async (
  onDeviceFound?: (data: { deviceId: string; lat: number; lon: number; timestamp: string }) => void,
  onError?: (error: string) => void
) => {
  // 1. Android Bluetooth Runtime Permissions (Android 12+)
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      if (
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] !== PermissionsAndroid.RESULTS.GRANTED ||
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        const msg = 'Bluetooth Scan permissions denied by user';
        console.warn(msg);
        onError?.(msg);
        return;
      }
    } catch (permErr: any) {
      console.warn('Bluetooth permission request error:', permErr);
    }
  }

  // 2. Location Permission Check
  const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
  if (locationStatus !== 'granted') {
    const msg = 'Permission to access location was denied';
    console.error(msg);
    onError?.(msg);
    return;
  }

  // 3. Check if Bluetooth is actually powered on before scanning
  try {
    const btState = await bleManager.state();
    if (btState === 'PoweredOff') {
      try {
        await bleManager.enable();
      } catch (enableError) {
        const msg = 'User refused to enable Bluetooth or it is unsupported';
        console.error(msg, enableError);
        onError?.(msg);
        return;
      }
    }
  } catch (stateErr) {
    console.warn('Could not query BleManager state:', stateErr);
  }

  // 4. Start Device Scan with dual name detection (localName in advert packet or name)
  bleManager.startDeviceScan(null, null, async (error, device) => {
    if (error) {
      console.warn('BLE Scan Error:', error.message);
      return;
    }
    
    // Look for devices broadcasting our specific prefixes (localName takes precedence in BLE packets)
    const detectedName = device?.localName || device?.name || '';
    if (detectedName.startsWith('SIH_TEAM_SAPPHIRE') || detectedName.startsWith('SPORS')) {
      console.log('Found Lost Device:', detectedName);
      
      // ---- Client-side dedup: skip if we recently pushed for this device ----
      if (!shouldPushForDevice(detectedName)) {
        console.log(`⏳ Skipping push for ${detectedName} (throttled — less than ${MIN_PUSH_INTERVAL_MS / 1000}s since last push)`);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const timestamp = new Date().toISOString();
        
        await storeLocation(
          detectedName,
          location.coords.latitude,
          location.coords.longitude,
          timestamp
        );

        // Mark this device as just-pushed
        recordPush(detectedName);

        console.log('✅ Successfully reported location for:', detectedName);
        
        if (onDeviceFound) {
          onDeviceFound({
            deviceId: detectedName,
            lat: location.coords.latitude,
            lon: location.coords.longitude,
            timestamp
          });
        }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.error || err?.message || 'Unknown error pushing data to backend';
        console.error('❌ Failed to get location or send to backend:', errorMsg);
        onError?.(`Failed to push data for ${detectedName}: ${errorMsg}`);
      }
    }
  });
};

export const stopForegroundScan = () => {
  bleManager.stopDeviceScan();
  // Clear the dedup cache when scanning stops
  lastPushTimestamps.clear();
};

// Define the background task
TaskManager.defineTask(BACKGROUND_BLE_TASK, async () => {
  try {
    // In background, we ideally want Location updates, or a background BLE scanner.
    // NOTE: react-native-ble-plx background scanning has limited support on iOS without specific setup.
    // For pure background location triggering (e.g. geofencing triggering a scan) you would use expo-location.
    
    // Example: fetch location
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    console.log('Background Task running at:', location.coords);
    
    // We can briefly scan here if OS allows
    return null;
  } catch (error) {
    console.error('Background Task Error:', error);
    return null;
  }
});
