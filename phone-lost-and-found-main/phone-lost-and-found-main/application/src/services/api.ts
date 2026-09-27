import axios, { AxiosError } from 'axios';

// ------------------------------------------------------------------
// API URL CONFIGURATION — Smart Fallback
// ------------------------------------------------------------------
// The app will try the local dev server first.
// If it's unreachable (phone not on same WiFi), it falls back to
// the production Vercel backend automatically.
// ------------------------------------------------------------------
const LOCAL_URL = 'http://10.146.218.165:9000';
const PROD_URL = 'https://phone-lost-and-found.vercel.app';

// Start with production by default — it's always reachable.
// Local is only useful during active development on the same network.
let activeBaseURL = PROD_URL;

const api = axios.create({
  baseURL: activeBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout to prevent hanging requests
});

// Interceptor: if request fails due to network error on PROD, try LOCAL (and vice versa)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;

    // Only retry once — prevent infinite loops
    if (!config || (config as any)._retried) {
      return Promise.reject(error);
    }

    // Network error or timeout — try the other URL
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      (config as any)._retried = true;

      // Swap to the other base URL
      const fallbackURL = config.baseURL === PROD_URL ? LOCAL_URL : PROD_URL;
      config.baseURL = fallbackURL;

      console.log(`🔄 Primary backend unreachable, retrying with fallback: ${fallbackURL}`);

      // Update default for subsequent requests
      activeBaseURL = fallbackURL;
      api.defaults.baseURL = fallbackURL;

      return api.request(config);
    }

    return Promise.reject(error);
  }
);

// ------------------------------------------------------------------
// API FUNCTIONS
// ------------------------------------------------------------------

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
    const response = await api.get(`/locatedevice/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error locating device:', error);
    throw error;
  }
};

// 5. Report a device as lost
export const reportLost = async (deviceId: string) => {
  try {
    const response = await api.post(`/reportlost/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error reporting device as lost:', error);
    throw error;
  }
};

// 6. Mark a device as found (remove from lost registry)
export const markFound = async (deviceId: string) => {
  try {
    const response = await api.post(`/markfound/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking device as found:', error);
    throw error;
  }
};

export default api;
