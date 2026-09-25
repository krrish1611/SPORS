import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Smartphone, CheckCircle, Info } from 'lucide-react-native';

import { startAdvertising, stopAdvertising } from '../services/BleAdvertiser';

export default function BindDeviceScreen() {
  const { user } = useAuth();
  const [boundDeviceId, setBoundDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoundDevice();
  }, []);

  const loadBoundDevice = async () => {
    try {
      const savedId = await AsyncStorage.getItem('@bound_device_id');
      if (savedId) {
        setBoundDeviceId(savedId);
        // Automatically resume broadcasting if they restart the app
        const hasPermissions = await requestPermissions();
        if (hasPermissions) {
          await startAdvertising(savedId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      return (
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  };

  const bindDevice = async (deviceId: string) => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        Alert.alert("Permission Required", "Bluetooth Advertising permissions are required to act as a beacon.");
        return;
      }

      // Start broadcasting this specific ID natively!
      await startAdvertising(deviceId);

      await AsyncStorage.setItem('@bound_device_id', deviceId);
      setBoundDeviceId(deviceId);
      
      Alert.alert(
        "Device Bound!", 
        `This physical phone is now broadcasting its Bluetooth name as ${deviceId} so it can be found if lost.`
      );
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.message || "Failed to start BLE Advertising.");
    }
  };

  const unbindDevice = async () => {
    try {
      await stopAdvertising();
      await AsyncStorage.removeItem('@bound_device_id');
      setBoundDeviceId(null);
      Alert.alert("Unbound", "This phone is no longer broadcasting as a beacon.");
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.message || "Failed to stop BLE Advertising.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.infoCard}>
        <Info color="#3b82f6" size={24} />
        <Text style={styles.infoText}>
          Due to modern Android privacy constraints, third-party apps cannot access hardware identifiers like IMEI or Serial Numbers.
          Instead, select which of your registered devices this physical phone ({Device.modelName}) corresponds to.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Your Registered Devices</Text>

      {user?.devices && user.devices.length > 0 ? (
        user.devices.map((device: any) => (
          <TouchableOpacity 
            key={device.deviceid} 
            style={[styles.deviceCard, boundDeviceId === device.deviceid && styles.deviceCardActive]}
            onPress={() => bindDevice(device.deviceid)}
          >
            <View style={styles.deviceHeader}>
              <Smartphone color={boundDeviceId === device.deviceid ? "#3b82f6" : "#64748b"} size={24} />
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.devicename}</Text>
                <Text style={styles.deviceId}>{device.deviceid}</Text>
              </View>
              {boundDeviceId === device.deviceid && (
                <CheckCircle color="#3b82f6" size={24} />
              )}
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyText}>You don't have any devices registered yet.</Text>
      )}

      {boundDeviceId && (
        <TouchableOpacity style={styles.unbindButton} onPress={unbindDevice}>
          <Text style={styles.unbindButtonText}>Stop Broadcasting / Unbind</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  deviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  deviceCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 16,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  deviceId: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 20,
    fontSize: 16,
  },
  unbindButton: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    alignItems: 'center',
  },
  unbindButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
