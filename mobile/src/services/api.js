import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_API_BASE_URL } from '../utils/constants';

let currentBaseUrl = DEFAULT_API_BASE_URL;

const api = axios.create({
  baseURL: currentBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to update API base URL dynamically if user overrides it in settings
export const setApiBaseUrl = (url) => {
  if (url) {
    currentBaseUrl = url.trim();
    api.defaults.baseURL = currentBaseUrl;
    AsyncStorage.setItem('custom_api_url', currentBaseUrl).catch(() => {});
  }
};

export const getApiBaseUrl = () => currentBaseUrl;

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  async (config) => {
    try {
      const storedUrl = await AsyncStorage.getItem('custom_api_url');
      if (storedUrl && storedUrl !== currentBaseUrl) {
        currentBaseUrl = storedUrl;
        config.baseURL = storedUrl;
      }
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
    } catch (e) {
      console.error('Error attaching auth token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth errors & formatting
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Return rejected promise so caller handles the error cleanly without LogBox warning
    return Promise.reject(error);
  }
);

// Helper to extract clean error message
export const getErrorMessage = (error) => {
  if (error.response) {
    return error.response.data?.message || error.response.data?.error || `Server error (${error.response.status})`;
  }
  if (error.request) {
    return `Cannot connect to server at ${currentBaseUrl}. Please ensure the backend server is running and device network is connected.`;
  }
  return error.message || 'An unexpected error occurred';
};

export default api;
