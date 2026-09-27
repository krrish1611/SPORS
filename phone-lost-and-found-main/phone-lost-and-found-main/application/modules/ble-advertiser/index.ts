import { requireNativeModule } from 'expo-modules-core';

let BleAdvertiser: any = null;
try {
  BleAdvertiser = requireNativeModule('BleAdvertiser');
} catch (e) {
  // Gracefully handles environments without native compilation (e.g. Expo Go)
  BleAdvertiser = null;
}

export default BleAdvertiser;
