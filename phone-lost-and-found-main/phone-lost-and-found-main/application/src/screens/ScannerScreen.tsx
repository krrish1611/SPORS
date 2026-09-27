import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { startForegroundScan, stopForegroundScan, BACKGROUND_BLE_TASK } from '../services/BleScannerService';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Radar, Play, Square, Wifi, Shield, AlertTriangle } from 'lucide-react-native';

interface ScanResult {
  deviceId: string;
  timestamp: string;
  lat: number;
  lon: number;
}

export default function ScannerScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopForegroundScan();
    };
  }, []);

  const handleDeviceFound = (device: ScanResult) => {
    // Clear any previous error on successful detection + push
    setLastError(null);
    setScanResults((prev) => {
      // Avoid immediate duplicates
      if (prev.length > 0 && prev[0].deviceId === device.deviceId) return prev;
      return [device, ...prev.slice(0, 3)];
    });
  };

  const handleScanError = (errorMsg: string) => {
    setLastError(errorMsg);
    // Auto-clear error after 8 seconds
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

      startForegroundScan(handleDeviceFound, handleScanError);
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
          Help others by turning your device into a scanner. If you find a lost device, its location will be anonymously reported to the owner.
        </Text>
      </View>

      {/* Error Banner */}
      {lastError && (
        <View style={styles.errorBanner}>
          <AlertTriangle color="#ef4444" size={20} style={{ marginRight: 10 }} />
          <Text style={styles.errorText}>{lastError}</Text>
        </View>
      )}

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
              <Text style={styles.statusTextActive}>Scanning for Bluetooth devices nearby...</Text>
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
            <Text style={styles.cardTitleInline}>Recent Detections</Text>
          </View>
          
          <View style={styles.resultsContainer}>
            {scanResults.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <View style={styles.resultIconWrapper}>
                  <Radar color="#ef4444" size={16} />
                </View>
                <View style={styles.resultDetails}>
                  <Text style={styles.resultDeviceId}>{result.deviceId}</Text>
                  <Text style={styles.resultLocation}>Lat: {result.lat.toFixed(5)}, Lon: {result.lon.toFixed(5)}</Text>
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
          <Text style={styles.privacyTitle}>Privacy Protected</Text>
          <Text style={styles.privacyText}>
            All scanning is completely anonymous. Device locations are encrypted and only shared with verified owners. Your personal information is never collected or stored.
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
    marginBottom: 32,
    marginTop: 16,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6', // primary blue
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleInline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginLeft: 8,
  },
  mainButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  btnStart: {
    backgroundColor: '#3b82f6',
  },
  btnStop: {
    backgroundColor: '#ef4444',
  },
  mainButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  statusBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    marginRight: 10,
  },
  statusTextActive: {
    color: '#ef4444',
    fontWeight: '500',
    fontSize: 14,
  },
  statusTextInactive: {
    color: '#64748b',
    fontSize: 14,
  },
  resultsContainer: {
    gap: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2', // light red tint for accent
    padding: 12,
    borderRadius: 12,
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
  },
  resultLocation: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  resultTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  privacyIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
    lineHeight: 20,
  },
});
