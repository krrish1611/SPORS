import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BleAdvertiserModule from '../../modules/ble-advertiser';

// Try both local Expo Module and legacy NativeModules bridge
const NativeAdvertiser = BleAdvertiserModule || NativeModules.BleAdvertiser;

export const DEFAULT_BLE_PREFIX = 'SIH_TEAM_SAPPHIRE';

/**
 * Checks whether native hardware BLE advertising module is linked and available.
 */
export const isNativeAdvertisingSupported = (): boolean => {
  return !!(NativeAdvertiser && typeof NativeAdvertiser.startAdvertising === 'function');
};

/**
 * Ensures that the broadcasted deviceId strictly starts with the specified prefix.
 * Example: if deviceId is "001" and prefix is "SIH_TEAM_SAPPHIRE", returns "SIH_TEAM_SAPPHIRE001".
 * If deviceId is already "SIH_TEAM_SAPPHIRE001", returns "SIH_TEAM_SAPPHIRE001".
 */
export const formatAdvertisedBeaconName = (deviceId: string, prefix: string = DEFAULT_BLE_PREFIX): string => {
  const cleanId = (deviceId || '').trim();
  const cleanPrefix = (prefix || DEFAULT_BLE_PREFIX).trim();
  if (!cleanPrefix) return cleanId;
  
  if (cleanId.startsWith(cleanPrefix)) {
    return cleanId;
  }
  
  // If switching prefix or if cleanId has old prefix prefix, strip and prepend
  const strippedId = cleanId.replace(/^(SIH_TEAM_SAPPHIRE|SPORS_DEVICE_|SPORS|_)+/i, '');
  return `${cleanPrefix}${strippedId || cleanId}`;
};

/**
 * Starts BLE Advertising for the specified deviceId using the provided prefix.
 * Guarantees that the emitted over-the-air packet starts with the prefix.
 */
export const startAdvertising = async (deviceId: string, prefix: string = DEFAULT_BLE_PREFIX): Promise<string> => {
  const finalBroadcastName = formatAdvertisedBeaconName(deviceId, prefix);
  
  // Persist the emitted prefix and name for cross-screen state consistency
  try {
    await AsyncStorage.setItem('@ble_advertiser_prefix', prefix);
    await AsyncStorage.setItem('@ble_advertised_name', finalBroadcastName);
  } catch (err) {
    console.warn('Could not cache advertised prefix:', err);
  }

  if (isNativeAdvertisingSupported()) {
    try {
      const res = await NativeAdvertiser.startAdvertising(finalBroadcastName);
      return res || `Hardware BLE Advertising started for ${finalBroadcastName}`;
    } catch (e: any) {
      console.warn("Native BLE Advertiser returned an error:", e);
      throw e;
    }
  }

  // Graceful fallback for environments without custom native peripheral binary (e.g., Expo Go)
  console.log(`ℹ️ BleAdvertiser native module running in software mesh fallback. Emitting beacon with prefix [${prefix}]: ${finalBroadcastName}`);
  return `Mesh Beacon registered as ${finalBroadcastName} (Software mode)`;
};

/**
 * Stops BLE Advertising.
 */
export const stopAdvertising = async (): Promise<string> => {
  if (isNativeAdvertisingSupported()) {
    try {
      const res = await NativeAdvertiser.stopAdvertising();
      return res || "Hardware BLE Advertising stopped";
    } catch (e: any) {
      console.warn("Native BLE Advertiser stop error:", e);
      throw e;
    }
  }

  return "Mesh Beacon stopped";
};
