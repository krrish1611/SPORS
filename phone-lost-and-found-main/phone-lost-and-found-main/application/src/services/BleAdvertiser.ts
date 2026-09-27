import { NativeModules, Platform } from 'react-native';

const { BleAdvertiser } = NativeModules;

/**
 * Checks whether native hardware BLE advertising module is linked and available.
 */
export const isNativeAdvertisingSupported = (): boolean => {
  return !!(BleAdvertiser && typeof BleAdvertiser.startAdvertising === 'function');
};

/**
 * Starts BLE Advertising for the specified deviceId.
 * If running on a device with custom native module linked, broadcasts over hardware BLE.
 * If running in Expo Go or standard dev client, gracefully registers the beacon ID in software fallback.
 */
export const startAdvertising = async (deviceId: string): Promise<string> => {
  if (isNativeAdvertisingSupported()) {
    try {
      const res = await BleAdvertiser.startAdvertising(deviceId);
      return res || `Hardware BLE Advertising started for ${deviceId}`;
    } catch (e: any) {
      console.warn("Native BLE Advertiser returned an error:", e);
      throw e;
    }
  }

  // Graceful fallback for environments without custom native peripheral binary (e.g., Expo Go)
  console.log(`ℹ️ BleAdvertiser native module not compiled into current binary. Registered device ${deviceId} in simulated mesh beacon mode.`);
  return `Mesh Beacon registered for ${deviceId} (Software mode)`;
};

/**
 * Stops BLE Advertising.
 */
export const stopAdvertising = async (): Promise<string> => {
  if (isNativeAdvertisingSupported()) {
    try {
      const res = await BleAdvertiser.stopAdvertising();
      return res || "Hardware BLE Advertising stopped";
    } catch (e: any) {
      console.warn("Native BLE Advertiser stop error:", e);
      throw e;
    }
  }

  return "Mesh Beacon stopped";
};
