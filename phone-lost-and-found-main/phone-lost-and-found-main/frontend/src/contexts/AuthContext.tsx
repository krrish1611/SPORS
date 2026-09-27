import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { fetchWithFallback } from '../lib/api';

interface Device {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  lastSeen: string;
}

interface User {
  id: number;
  username: string;
  role: string;
  email: string;
  firstname: string;
  lastname: string;
  token: string;
  devices?: Device[];
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<string | false>;
  logout: () => void;
  isAuthenticated: boolean;
  addDeviceToUser: (device: Device) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<string | false> => {
  try {
    const response = await fetchWithFallback("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return false;
    }

    const devices: Device[] = (data.user.devices || []).map((d: any) => ({
      id: d.deviceid,
      name: d.devicename,
      location: {
        lat: d.lat,
        lng: d.lon,
        address: d.address || "Unknown location",
      },
      lastSeen: d.time || "Unknown",
    }));

    const loggedInUser: User = {
      id: data.user.id,
      username: data.user.username || username,
      role: data.user.role || 'user',
      email: data.user.email,
      firstname: data.user.firstname,
      lastname: data.user.lastname,
      token: data.token,
      devices,
    };

    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    return loggedInUser.role;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const isAuthenticated = user !== null;

  const addDeviceToUser = (device: Device) => {
    if (user) {
      const updatedUser = {
        ...user,
        devices: [...(user.devices || []), device],
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, addDeviceToUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
