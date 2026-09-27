import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  PermissionsAndroid, 
  Platform, 
  ScrollView, 
  ActivityIndicator,
  TextInput 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  startForegroundScan, 
  stopForegroundScan, 
  BACKGROUND_BLE_TASK,
  DEFAULT_SCAN_PREFIX 
} from '../services/BleScannerService';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Radar, Play, Square, Wifi, Shield, AlertTriangle, Filter } from 'lucide-react-native';

interface ScanResult {
  deviceId: string;
  timestamp: string;
  lat: number;
  lon: number;
}

export default function ScannerScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanPrefix, setScanPrefix] = useState<string>(DEFAULT_SCAN_PREFIX);
  const [customPrefixInput, setCustomPrefixInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedPrefix();
    return () => {
      stopForegroundScan();
    };
  }, []);

  const loadSavedPrefix = async () => {
    try {
      const saved = await AsyncStorage.getItem('@ble_scan_prefix');
      if (saved) {
        setScanPrefix(saved);
        if (saved !== 'SIH_TEAM_SAPPHIRE' && saved !== 'SPORS') {
          setShowCustomInput(true);
          setCustomPrefixInput(saved);
        }
      }
    } catch (e) {
      console.warn("Could not load saved scan prefix:", e);
    }
  };

  const handleSelectPrefix = async (prefix: string) => {
    setScanPrefix(prefix);
    setShowCustomInput(false);
    await AsyncStorage.setItem('@ble_scan_prefix', prefix);

    // If currently scanning, restart scanner to apply new filter immediately
    if (isScanning) {
      stopForegroundScan();
      startForegroundScan(handleDeviceFound, handleScanError, prefix);
    }
  };

  const handleApplyCustomPrefix = async () => {
    const trimmed = customPrefixInput.trim();
    if (!trimmed) {
      Alert.alert("Invalid Prefix", "Please enter a valid prefix.");
      return;
    }
    await handleSelectPrefix(trimmed);
  };

  const handleDeviceFound = (device: ScanResult) => {
    setLastError(null);
    setScanResults((prev) => {
      // Avoid immediate duplicates
      if (prev.length > 0 && prev[0].deviceId === device.deviceId) return prev;
      return [device, ...prev.slice(0, 4)];
    });
  };

  const handleScanError = (errorMsg: string) => {
    setLastError(errorMsg);
    setTimeout(() => setLastError(null), 8000);
  };

  const toggleScan = async () => {
    if (isScanning) {
      stopForegroundScan();
      setIsScanning(false);
      setLastError(null);
      
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_BLE_TASK);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_BLE_TASK);
      }
    } else {
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        
        if (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert('Permission Denied', 'Bluetooth permissions are required for scanning.');
          return;
        }
      }

      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for scanning.');
        return;
      }
      
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === 'granted') {
        await Location.startLocationUpdatesAsync(BACKGROUND_BLE_TASK, {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
          deferredUpdatesInterval: 1000 * 60 * 1,
        });
      }

      // Start scan with the STRICT prefix filter
      startForegroundScan(handleDeviceFound, handleScanError, scanPrefix);
      setIsScanning(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Radar color="#ffffff" size={32} />
        </View>
        <Text style={styles.title}>Help Find a Device</Text>
        <Text style={styles.subtitle}>
          Turn your phone into a secure community scanner. It listens exclusively for missing devices broadcasting your target prefix.
        </Text>
      </View>

      {/* Error Banner */}
      {lastError && (
        <View style={styles.errorBanner}>
          <AlertTriangle color="#ef4444" size={20} style={{ marginRight: 10 }} />
          <Text style={styles.errorText}>{lastError}</Text>
        </View>
      )}

      {/* Prefix Filtering Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Filter color="#3b82f6" size={20} />
          <Text style={styles.cardTitleInline}>Capture Prefix Filter</Text>
        </View>
        <Text style={styles.prefixSubtitle}>
          The scanner will <Text style={{ fontWeight: '700', color: '#0f172a' }}>ONLY</Text> capture and relay BLE beacons starting with this prefix:
        </Text>

        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, scanPrefix === 'SIH_TEAM_SAPPHIRE' && styles.chipActive]}
            onPress={() => handleSelectPrefix('SIH_TEAM_SAPPHIRE')}
          >
            <Text style={[styles.chipText, scanPrefix === 'SIH_TEAM_SAPPHIRE' && styles.chipTextActive]}>
              SIH_TEAM_SAPPHIRE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, scanPrefix === 'SPORS' && styles.chipActive]}
            onPress={() => handleSelectPrefix('SPORS')}
          >
            <Text style={[styles.chipText, scanPrefix === 'SPORS' && styles.chipTextActive]}>
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
              placeholder="e.g. SIH_TEAM_SAPPHIRE"
              placeholderTextColor="#94a3b8"
              value={customPrefixInput}
              onChangeText={setCustomPrefixInput}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyCustomPrefix}>
              <Text style={styles.applyButtonText}>Set Prefix</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.filterStatusTag}>
          <Text style={styles.filterStatusLabel}>TARGET FILTER:</Text>
          <Text style={styles.filterStatusValue}>Capturing ONLY "{scanPrefix}*"</Text>
        </View>
      </View>

      {/* Network Scanner Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Network Scanner</Text>
        
        <TouchableOpacity 
          style={[styles.mainButton, isScanning ? styles.btnStop : styles.btnStart]} 
          onPress={toggleScan}
        >
          {isScanning ? <Square color="#ffffff" size={24} /> : <Play color="#ffffff" size={24} />}
          <Text style={styles.mainButtonText}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.statusBox}>
          {isScanning ? (
            <View style={styles.statusRow}>
              <ActivityIndicator color="#ef4444" style={styles.statusIcon} />
              <Text style={styles.statusTextActive}>
                Scanning strictly for beacons starting with "{scanPrefix}"...
              </Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <Wifi color="#64748b" size={20} style={styles.statusIcon} />
              <Text style={styles.statusTextInactive}>Your device is not currently scanning</Text>
            </View>
          )}
        </View>
      </View>

      {/* Recent Detections Card */}
      {scanResults.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Shield color="#0f172a" size={20} />
            <Text style={styles.cardTitleInline}>Verified Detections ({scanResults.length})</Text>
          </View>
          
          <View style={styles.resultsContainer}>
            {scanResults.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <View style={styles.resultIconWrapper}>
                  <Radar color="#ef4444" size={16} />
                </View>
                <View style={styles.resultDetails}>
                  <Text style={styles.resultDeviceId}>{result.deviceId}</Text>
                  <Text style={styles.resultLocation}>GPS: {result.lat.toFixed(5)}, {result.lon.toFixed(5)}</Text>
                </View>
                <Text style={styles.resultTime}>
                  {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Privacy Info Card */}
      <View style={styles.privacyCard}>
        <View style={styles.privacyIconWrapper}>
          <Shield color="#3b82f6" size={20} />
        </View>
        <View style={styles.privacyTextContainer}>
          <Text style={styles.privacyTitle}>Strict Prefix Isolation</Text>
          <Text style={styles.privacyText}>
            Only lost phones configured with the specified prefix are parsed and reported. All non-matching Bluetooth signals (earbuds, watches, trackers) are completely dropped without processing.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleInline: {
    fontSize: 17,
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
  filterStatusTag: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  filterStatusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: 0.5,
  },
  filterStatusValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4ed8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  btnStart: {
    backgroundColor: '#ef4444',
  },
  btnStop: {
    backgroundColor: '#0f172a',
  },
  mainButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statusBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 10,
  },
  statusTextActive: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
    flex: 1,
  },
  statusTextInactive: {
    fontSize: 13,
    color: '#64748b',
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  resultIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultDetails: {
    flex: 1,
  },
  resultDeviceId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  resultLocation: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  resultTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 8,
  },
  privacyCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 20,
  },
  privacyIconWrapper: {
    marginRight: 12,
    marginTop: 2,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 12,
    color: '#3b82f6',
    lineHeight: 18,
  },
});
