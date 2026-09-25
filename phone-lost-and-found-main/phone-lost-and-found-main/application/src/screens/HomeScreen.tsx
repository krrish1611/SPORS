import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { MapPin, Search, AlertTriangle, LogOut, Smartphone, Sun, Moon } from 'lucide-react-native';

type RootStackParamList = {
  Home: undefined;
  Scanner: undefined;
  LocateDevice: undefined;
  ReportLost: undefined;
  BindDevice: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { theme, setThemeSetting, colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 16, marginRight: 8 }}>
          <TouchableOpacity 
            onPress={() => setThemeSetting(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun color={colors.text} size={24} /> : <Moon color={colors.text} size={24} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <LogOut color="#ef4444" size={24} />
          </TouchableOpacity>
        </View>
      ),
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTintColor: colors.text,
    });
  }, [navigation, theme, colors, logout]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.welcome, { color: colors.subText }]}>Welcome back,</Text>
        <Text style={[styles.name, { color: colors.text }]}>{user?.firstname || user?.username}</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Scanner')}
        >
          <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? '#1e3a8a' : '#eff6ff' }]}>
            <Search color="#3b82f6" size={32} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Network Scanner</Text>
          <Text style={[styles.cardDesc, { color: colors.subText }]}>Help find lost devices nearby</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('LocateDevice')}
        >
          <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? '#064e3b' : '#ecfdf5' }]}>
            <MapPin color="#10b981" size={32} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Find My Device</Text>
          <Text style={[styles.cardDesc, { color: colors.subText }]}>Locate your registered devices</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('ReportLost')}
        >
          <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2' }]}>
            <AlertTriangle color="#ef4444" size={32} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Report Lost</Text>
          <Text style={[styles.cardDesc, { color: colors.subText }]}>Mark a device as missing</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('BindDevice')}
        >
          <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? '#4c1d95' : '#f5f3ff' }]}>
            <Smartphone color="#8b5cf6" size={32} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Make Beacon</Text>
          <Text style={[styles.cardDesc, { color: colors.subText }]}>Assign this phone to a registered ID</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 32,
  },
  welcome: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  }
});
