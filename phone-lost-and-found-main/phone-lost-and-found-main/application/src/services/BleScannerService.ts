import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { BleManager, Device } from 'react-native-ble-plx';
import { storeLocation } from './api';

export const BACKGROUND_BLE_TASK = 'BACKGROUND_BLE_TASK';

// A single instance of BleManager should be used
export const bleManager = new BleManager();

export const startForegroundScan = async (
  onDeviceFound?: (data: { deviceId: string; lat: number; lon: number; timestamp: string }) => void
) => {
  const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
  if (locationStatus !== 'granted') {
    console.error('Permission to access location was denied');
    return;
  }

  // Check if Bluetooth is actually powered on before scanning
  const btState = await bleManager.state();
  if (btState === 'PoweredOff') {
    try {
      await bleManager.enable();
    } catch (enableError) {
      console.error('User refused to enable Bluetooth or it is unsupported:', enableError);
      return;
    }
  }

  bleManager.startDeviceScan(null, null, async (error, device) => {
    if (error) {
      // If we get an error, just log it instead of crashing the UI
      console.warn('BLE Scan Error:', error.message);
      return;
    }
    
    // Look for devices broadcasting our specific prefix
    if (device?.name?.startsWith('SIH_TEAM_SAPPHIRE')) {
      console.log('Found Lost Device:', device.name);
      
      try {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const timestamp = new Date().toISOString();
        
        await storeLocation(
          device.name,
          location.coords.latitude,
          location.coords.longitude,
          timestamp
        );
        console.log('Successfully reported location for:', device.name);
        
        if (onDeviceFound) {
          onDeviceFound({
            deviceId: device.name,
            lat: location.coords.latitude,
            lon: location.coords.longitude,
            timestamp
          });
        }
      } catch (err) {
        console.error('Failed to get location or send to backend:', err);
      }
    }
  });
};

export const stopForegroundScan = () => {
  bleManager.stopDeviceScan();
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
