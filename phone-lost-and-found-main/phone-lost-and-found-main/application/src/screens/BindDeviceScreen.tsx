import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  Platform, 
  PermissionsAndroid,
  TextInput 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Smartphone, CheckCircle, Info, Radio, Settings2 } from 'lucide-react-native';
import * as Device from 'expo-device';
import { 
  startAdvertising, 
  stopAdvertising, 
  formatAdvertisedBeaconName, 
  DEFAULT_BLE_PREFIX 
} from '../services/BleAdvertiser';

export default function BindDeviceScreen() {
  const { user } = useAuth();
  const [boundDeviceId, setBoundDeviceId] = useState<string | null>(null);
  const [broadcastPrefix, setBroadcastPrefix] = useState<string>(DEFAULT_BLE_PREFIX);
  const [customPrefixInput, setCustomPrefixInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedId = await AsyncStorage.getItem('@bound_device_id');
      const savedPrefix = await AsyncStorage.getItem('@ble_advertiser_prefix');
      if (savedId) setBoundDeviceId(savedId);
      if (savedPrefix) {
        setBroadcastPrefix(savedPrefix);
        if (savedPrefix !== 'SIH_TEAM_SAPPHIRE' && savedPrefix !== 'SPORS') {
          setShowCustomInput(true);
          setCustomPrefixInput(savedPrefix);
        }
      }
    } catch (e) {
      console.warn("Failed to load binding settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPrefix = async (prefix: string) => {
    setBroadcastPrefix(prefix);
    setShowCustomInput(false);
    await AsyncStorage.setItem('@ble_advertiser_prefix', prefix);
    
    // If device is currently bound, re-advertise with the updated prefix immediately
    if (boundDeviceId) {
      try {
        await startAdvertising(boundDeviceId, prefix);
        Alert.alert(
          "Broadcast Prefix Updated",
          `Broadcasting updated to prefix "${prefix}":\n\n${formatAdvertisedBeaconName(boundDeviceId, prefix)}`
        );
      } catch (err: any) {
        console.warn("Could not re-advertise with new prefix:", err);
      }
    }
  };

  const handleApplyCustomPrefix = async () => {
    const trimmed = customPrefixInput.trim();
    if (!trimmed) {
      Alert.alert("Invalid Prefix", "Please enter a valid prefix name.");
      return;
    }
    await handleSelectPrefix(trimmed);
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

      // Start broadcasting this specific ID natively with our specified prefix!
      await startAdvertising(deviceId, broadcastPrefix);

      await AsyncStorage.setItem('@bound_device_id', deviceId);
      await AsyncStorage.setItem('@ble_advertiser_prefix', broadcastPrefix);
      setBoundDeviceId(deviceId);
      
      const formattedBeaconName = formatAdvertisedBeaconName(deviceId, broadcastPrefix);
      Alert.alert(
        "Device Bound!", 
        `This physical phone is now broadcasting over Bluetooth with prefix "${broadcastPrefix}" as:\n\n${formattedBeaconName}`
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
          Select which registered device this physical phone ({Device.modelName || 'Device'}) corresponds to.
          When bound, the phone emits a BLE beacon with your specified prefix so nearby scanners can locate it.
        </Text>
      </View>

      {/* Prefix Configuration Card */}
      <View style={styles.prefixCard}>
        <View style={styles.prefixHeader}>
          <Radio color="#3b82f6" size={20} />
          <Text style={styles.prefixTitle}>BLE Broadcast Prefix</Text>
        </View>
        <Text style={styles.prefixSubtitle}>
          Choose the prefix emitted by this device when broadcasting over Bluetooth:
        </Text>

        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, broadcastPrefix === 'SIH_TEAM_SAPPHIRE' && styles.chipActive]}
            onPress={() => handleSelectPrefix('SIH_TEAM_SAPPHIRE')}
          >
            <Text style={[styles.chipText, broadcastPrefix === 'SIH_TEAM_SAPPHIRE' && styles.chipTextActive]}>
              SIH_TEAM_SAPPHIRE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, broadcastPrefix === 'SPORS' && styles.chipActive]}
            onPress={() => handleSelectPrefix('SPORS')}
          >
            <Text style={[styles.chipText, broadcastPrefix === 'SPORS' && styles.chipTextActive]}>
              SPORS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, showCustomInput && styles.chipActive]}
            onPress={() => setShowCustomInput(true)}
          >
            <Text style={[styles.chipText, showCustomInput && styles.chipTextActive]}>
              Custom...
            </Text>
          </TouchableOpacity>
        </View>

        {showCustomInput && (
          <View style={styles.customInputRow}>
            <TextInput
              style={styles.customInput}
              placeholder="e.g. SPORS_RECOVERY_"
              placeholderTextColor="#94a3b8"
              value={customPrefixInput}
              onChangeText={setCustomPrefixInput}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyCustomPrefix}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.broadcastPreviewBox}>
          <Text style={styles.broadcastPreviewLabel}>ACTIVE BROADCAST PREFIX:</Text>
          <Text style={styles.broadcastPreviewValue}>"{broadcastPrefix}"</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your Registered Devices</Text>

      {user?.devices && user.devices.length > 0 ? (
        user.devices.map((device: any) => {
          const isBound = boundDeviceId === device.deviceid;
          const formattedBeacon = formatAdvertisedBeaconName(device.deviceid, broadcastPrefix);
          return (
            <TouchableOpacity 
              key={device.deviceid} 
              style={[styles.deviceCard, isBound && styles.deviceCardActive]}
              onPress={() => bindDevice(device.deviceid)}
            >
              <View style={styles.deviceHeader}>
                <Smartphone color={isBound ? "#3b82f6" : "#64748b"} size={24} />
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.devicename}</Text>
                  <Text style={styles.deviceId}>ID: {device.deviceid}</Text>
                  <Text style={styles.beaconEmittedText}>
                    Emits: <Text style={styles.beaconEmittedCode}>{formattedBeacon}</Text>
                  </Text>
                </View>
                {isBound && (
                  <CheckCircle color="#3b82f6" size={24} />
                )}
              </View>
            </TouchableOpacity>
          );
        })
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 18,
  },
  prefixCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  prefixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  prefixTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 8,
  },
  prefixSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  chipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    color: '#0f172a',
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  broadcastPreviewBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  broadcastPreviewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  broadcastPreviewValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4ed8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 14,
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
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  beaconEmittedText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  beaconEmittedCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#2563eb',
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 20,
    fontSize: 16,
  },
  unbindButton: {
    marginTop: 24,
    marginBottom: 32,
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
