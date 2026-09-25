import axios from 'axios';

// ------------------------------------------------------------------
// IMPORTANT: API URL CONFIGURATION
// ------------------------------------------------------------------
// Option 1: Local Testing on Physical Phone (Must be on same WiFi)
const LOCAL_IP = '10.146.218.165'; 
const API_URL = `http://${LOCAL_IP}:9000`;

// Option 2: Production / Hosted Backend (Vercel, Render, etc.)
// Uncomment the line below and paste your Vercel backend link!
// const API_URL = 'https://your-project-backend.vercel.app';
// ------------------------------------------------------------------

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const storeLocation = async (deviceId: string, latitude: number, longitude: number, timestamp: string) => {
  try {
    const response = await api.post('/storeLocation', {
      deviceId,
      latitude,
      longitude,
      timestamp,
    });
    return response.data;
  } catch (error) {
    console.error('API Error (storeLocation):', error);
    throw error;
  }
};

export const fetchDeviceLocation = async (deviceId: string) => {
  try {
    const response = await api.get(`/locatedevice/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error('API Error (fetchDeviceLocation):', error);
    throw error;
  }
};

export const locateDevice = async (deviceId: string) => {
  try {
    const response = await axios.get(`${API_URL}/locatedevice/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error locating device:', error);
    throw error;
  }
};

// 5. Report a device as lost
export const reportLost = async (deviceId: string) => {
  try {
    const response = await axios.post(`${API_URL}/reportlost/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error reporting device as lost:', error);
    throw error;
  }
};

// 6. Mark a device as found (remove from lost registry)
export const markFound = async (deviceId: string) => {
  try {
    const response = await axios.post(`${API_URL}/markfound/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking device as found:', error);
    throw error;
  }
};

export default api;
