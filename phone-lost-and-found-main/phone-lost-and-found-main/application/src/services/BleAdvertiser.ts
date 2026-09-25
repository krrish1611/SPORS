import { NativeModules } from 'react-native';

const { BleAdvertiser } = NativeModules;

export const startAdvertising = async (deviceId: string): Promise<string> => {
  if (!BleAdvertiser) {
    throw new Error("BleAdvertiser native module is not linked.");
  }
  return BleAdvertiser.startAdvertising(deviceId);
};

export const stopAdvertising = async (): Promise<string> => {
  if (!BleAdvertiser) {
    throw new Error("BleAdvertiser native module is not linked.");
  }
  return BleAdvertiser.stopAdvertising();
};
