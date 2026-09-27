import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MapPin, Search, Clock, Navigation } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { fetchDeviceLocation } from '../services/api';

export default function LocateDeviceScreen() {
  const { user } = useAuth();
  const [deviceId, setDeviceId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

  const handleSearch = async (idToSearch: string) => {
    if (!idToSearch.trim()) {
      Alert.alert('Error', 'Please enter a device ID');
      return;
    }
    
    setIsSearching(true);
    setSelectedDevice(null);
    
    try {
      const data = await fetchDeviceLocation(idToSearch);
      setSelectedDevice(data);
    } catch (error) {
      Alert.alert('Not Found', 'Device not found in network');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <MapPin color="#ffffff" size={32} />
        </View>
        <Text style={styles.title}>Find My Device</Text>
        <Text style={styles.subtitle}>
          Enter your device ID or select from your registered devices to see its last known location on the map.
        </Text>
      </View>

      {/* Quick Select Devices (if user has registered devices) */}
      {user?.devices && user.devices.length > 0 && (
        <View style={styles.quickSelectContainer}>
          <Text style={styles.quickSelectTitle}>Your Registered Devices</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {user.devices.map((d: any) => (
              <TouchableOpacity 
                key={d.deviceid} 
                style={styles.chip} 
                onPress={() => {
                  setDeviceId(d.deviceid);
                  handleSearch(d.deviceid);
                }}
              >
                <Text style={styles.chipText}>{d.devicename}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Manual Search Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Device Search</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Device ID (e.g. SIH_TEAM...)"
            value={deviceId}
            onChangeText={setDeviceId}
            autoCapitalize="none"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={() => handleSearch(deviceId)}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Search color="#ffffff" size={20} />
              <Text style={styles.searchButtonText}>Find Device</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={[styles.card, styles.mapCard]}>
        {selectedDevice ? (
          (() => {
            const lat = Number(selectedDevice.location?.lat) || 28.6139;
            const lng = Number(selectedDevice.location?.lng) || 77.2090;
            return (
              <MapView
                style={styles.map}
                region={{
                  latitude: lat,
                  longitude: lng,
                  latitudeDelta: 0.008,
                  longitudeDelta: 0.008,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: lat,
                    longitude: lng,
                  }}
                  title={selectedDevice.name}
                  description={selectedDevice.location?.address || "Unknown address"}
                />
              </MapView>
            );
          })()
        ) : (
          <View style={styles.mapPlaceholder}>
            <MapPin color="#3b82f6" size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
            <Text style={styles.placeholderText}>Map will be displayed here...</Text>
            <Text style={styles.placeholderSub}>Search for a device to see its location</Text>
          </View>
        )}
      </View>

      {/* Location Details Card */}
      {selectedDevice && (
        <View style={styles.card}>
          <View style={styles.detailsHeader}>
            <View style={styles.detailsIconWrapper}>
              <MapPin color="#ef4444" size={20} />
            </View>
            <View>
              <Text style={styles.detailsTitle}>Device Located</Text>
              <Text style={styles.detailsSubtitle}>Last known location</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Device Name</Text>
              <Text style={styles.detailValue}>{selectedDevice.name}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location Address</Text>
              <Text style={styles.detailValue}>{selectedDevice.location?.address || "Coordinates logged via Bluetooth mesh"}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Seen</Text>
              <View style={styles.timeRow}>
                <Clock color="#64748b" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.detailValue}>
                  {(() => {
                    const ts = selectedDevice.lastSeen;
                    if (!ts) return "Recently";
                    const d = new Date(ts);
                    return isNaN(d.getTime()) ? ts : d.toLocaleString();
                  })()}
                </Text>
              </View>
            </View>
          </View>

          {/* Open in Google Maps Navigation */}
          <TouchableOpacity
            style={styles.googleMapsButton}
            onPress={() => {
              const lat = Number(selectedDevice.location?.lat) || 28.6139;
              const lng = Number(selectedDevice.location?.lng) || 77.2090;
              Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
            }}
          >
            <Navigation color="#ffffff" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.googleMapsButtonText}>Open in Google Maps App</Text>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: '#3b82f6',
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
  quickSelectContainer: {
    marginBottom: 24,
  },
  quickSelectTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
    marginLeft: 4,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  chipText: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 14,
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
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapCard: {
    padding: 0, // Remove padding so map fills card
    overflow: 'hidden',
    height: 300,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  placeholderSub: {
    fontSize: 14,
    color: '#94a3b8',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  detailsSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#0f172a',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  googleMapsButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
