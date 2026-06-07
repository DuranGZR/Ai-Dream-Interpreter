import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_URL } from '@env';

const getBaseURL = () => {
  if (__DEV__) {
    // Web development should target localhost:3000
    if (Platform.OS === 'web') {
      return 'http://localhost:3000';
    }

    // Android Emulator has its own special localhost mapping
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }

    // Expo dev server: automatically get host IP for physical iOS/Android device testing
    const debuggerHost = Constants.expoConfig?.hostUri ??
      (Constants.manifest as any)?.debuggerHost;
    const hostIP = debuggerHost?.split(':')[0];

    if (hostIP) {
      return `http://${hostIP}:3000`;
    }

    // Default development fallback
    return 'http://localhost:3000';
  }

  // Production: use API_URL from env
  if (API_URL) {
    return API_URL;
  }

  console.error('❌ CRITICAL: API_URL is missing in environment variables!');
  console.warn('⚠️ Ensure .env was created during build via eas-build-pre-install hook.');
  return 'http://localhost:3000'; // Fail safe but log error
};

export const API_BASE_URL = getBaseURL();
console.log('🚀 API Configured:', API_BASE_URL);

export const API_ENDPOINTS = {
  interpret: `${API_BASE_URL}/api/interpret`,
  transcribe: `${API_BASE_URL}/api/transcribe`,
  dreams: `${API_BASE_URL}/api/dreams`,
  dreamById: (id: string) => `${API_BASE_URL}/api/dreams/${id}`,
};
