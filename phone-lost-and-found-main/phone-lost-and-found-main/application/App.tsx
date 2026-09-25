import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import LocateDeviceScreen from './src/screens/LocateDeviceScreen';
import ReportLostScreen from './src/screens/ReportLostScreen';
import BindDeviceScreen from './src/screens/BindDeviceScreen';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();

function NavigationWrapper() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const navTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator initialRouteName={isAuthenticated ? "Home" : "Login"}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SPORS Dashboard' }} />
            <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Network Scanner' }} />
            <Stack.Screen name="LocateDevice" component={LocateDeviceScreen} options={{ title: 'Find My Device' }} />
            <Stack.Screen name="ReportLost" component={ReportLostScreen} options={{ title: 'Report Lost' }} />
            <Stack.Screen name="BindDevice" component={BindDeviceScreen} options={{ title: 'Bind Phone as Beacon' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationWrapper />
      </AuthProvider>
    </ThemeProvider>
  );
}
