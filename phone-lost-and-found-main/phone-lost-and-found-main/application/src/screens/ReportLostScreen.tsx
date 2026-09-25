import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AlertTriangle, Search, CheckCircle, Smartphone } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { reportLost, markFound } from '../services/api';

export default function ReportLostScreen() {
  const { user } = useAuth();
  const { colors, theme } = useTheme();
  
  const [deviceId, setDeviceId] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success_lost' | 'success_found'>('idle');

  const handleDeviceAction = async (targetId: string, action: 'lost' | 'found') => {
    if (!targetId.trim()) {
      Alert.alert('Error', 'Please enter a valid Device ID');
      return;
    }

    const title = action === 'lost' ? "Report Lost" : "Mark as Found";
    const message = action === 'lost' 
      ? `Are you sure you want to mark ${targetId} as lost? This will alert the network to start tracking it.`
      : `Are you sure you want to mark ${targetId} as found? This will remove it from the active tracking network.`;

    Alert.alert(
      title,
      message,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: action === 'lost' ? "Yes, Report it" : "Yes, Mark Found", 
          style: action === 'lost' ? "destructive" : "default",
          onPress: async () => {
            setIsReporting(true);
            try {
              if (action === 'lost') {
                await reportLost(targetId);
                setStatus('success_lost');
              } else {
                await markFound(targetId);
                setStatus('success_found');
              }
              
              setDeviceId('');
              
              // Reset success state after 3 seconds
              setTimeout(() => {
                setStatus('idle');
              }, 3000);
            } catch (error: any) {
              const errorMsg = error?.response?.data?.message || `Failed to mark device as ${action}.`;
              Alert.alert('Error', errorMsg);
            } finally {
              setIsReporting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Icon */}
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2' }]}>
            <AlertTriangle color="#ef4444" size={48} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Report Lost Device</Text>
          <Text style={[styles.desc, { color: colors.subText }]}>
            Mark your device as lost to instantly activate network tracking. When any SPORS node detects it, its location will be securely mapped.
          </Text>
        </View>

        {/* Success Banner */}
        {status.startsWith('success') && (
          <View style={[styles.successBanner, { backgroundColor: theme === 'dark' ? '#064e3b' : '#ecfdf5', borderColor: '#10b981' }]}>
            <CheckCircle color="#10b981" size={24} />
            <Text style={[styles.successText, { color: '#10b981' }]}>
              {status === 'success_lost' ? 'Device marked as lost!' : 'Device removed from lost registry!'}
            </Text>
          </View>
        )}

        {/* Manual Input */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Enter Device ID</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g., SIH_TEAM_SAPPHIRE001"
            placeholderTextColor={colors.subText}
            value={deviceId}
            onChangeText={setDeviceId}
            editable={!isReporting}
            autoCapitalize="characters"
          />
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.submitButton, isReporting && { opacity: 0.7 }]} 
              onPress={() => handleDeviceAction(deviceId, 'lost')}
              disabled={isReporting}
            >
              <Text style={styles.submitButtonText}>Mark Lost</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.foundButton, isReporting && { opacity: 0.7 }]} 
              onPress={() => handleDeviceAction(deviceId, 'found')}
              disabled={isReporting}
            >
              <Text style={styles.foundButtonText}>Mark Found</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Select from Registered Devices */}
        <View style={styles.quickSelectSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Or select from your devices:</Text>
          {user?.devices && user.devices.length > 0 ? (
            user.devices.map((device: any) => (
              <View key={device.deviceid} style={[styles.deviceItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.deviceItemLeft}>
                  <Smartphone color={colors.primary} size={24} />
                  <View style={styles.deviceItemInfo}>
                    <Text style={[styles.deviceName, { color: colors.text }]}>{device.devicename}</Text>
                    <Text style={[styles.deviceIdLabel, { color: colors.subText }]}>{device.deviceid}</Text>
                  </View>
                </View>
                
                <View style={styles.deviceActions}>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => handleDeviceAction(device.deviceid, 'lost')}
                    disabled={isReporting}
                  >
                    <AlertTriangle color="#ef4444" size={20} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => handleDeviceAction(device.deviceid, 'found')}
                    disabled={isReporting}
                  >
                    <CheckCircle color="#10b981" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.subText }]}>You have no registered devices.</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  successText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 12,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  foundButton: {
    flex: 1,
    backgroundColor: '#10b981',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foundButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickSelectSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  deviceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceItemInfo: {
    marginLeft: 16,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceIdLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  deviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
  }
});
