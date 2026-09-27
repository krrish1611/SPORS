import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextData {
  theme: 'light' | 'dark';
  themeSetting: ThemeType;
  setThemeSetting: (setting: ThemeType) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    subText: string;
    border: string;
    primary: string;
  };
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const lightColors = {
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  subText: '#64748b',
  border: '#e2e8f0',
  primary: '#3b82f6',
};

export const darkColors = {
  background: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  subText: '#94a3b8',
  border: '#334155',
  primary: '#3b82f6',
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = useColorScheme();
  const [themeSetting, setThemeSettingState] = useState<ThemeType>('system');

  useEffect(() => {
    AsyncStorage.getItem('@theme_setting').then((savedTheme) => {
      if (savedTheme) {
        setThemeSettingState(savedTheme as ThemeType);
      }
    });
  }, []);

  const setThemeSetting = async (setting: ThemeType) => {
    setThemeSettingState(setting);
    await AsyncStorage.setItem('@theme_setting', setting);
  };

  const currentTheme: 'light' | 'dark' = themeSetting === 'system' ? (systemTheme === 'dark' ? 'dark' : 'light') : themeSetting;
  const colors = currentTheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, themeSetting, setThemeSetting, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
