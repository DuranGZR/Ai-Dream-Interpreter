import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_URL } from '@env';

const getBaseURL = () => {
  // Öncelik: .env dosyasındaki API_URL (Vercel Backend)
  // Eğer .env'de API_URL varsa, Development modunda bile orayı kullanırız.
  if (API_URL) {
    return API_URL;
  }

  if (__DEV__) {
    // Expo dev server'dan host IP'sini otomatik al
    const debuggerHost = Constants.expoConfig?.hostUri ??
      (Constants.manifest as any)?.debuggerHost;
    const hostIP = debuggerHost?.split(':')[0];

    if (Platform.OS === 'android') {
      // Android Emulator için özel localhost adresi
      return 'http://10.0.2.2:3000';
    }

    // iOS/fiziksel cihaz: Expo'nun algıladığı IP'yi kullan
    if (hostIP) {
      return `http://${hostIP}:3000`;
    }

    // Fallback: localhost
    return 'http://localhost:3000';
  }

  // Production Check
  if (!API_URL) {
    console.error('❌ CRITICAL: API_URL is missing in environment variables!');
    console.warn('⚠️ Ensure .env was created during build via eas-build-pre-install hook.');
  }

  return API_URL || 'http://localhost:3000'; // Fail safe but log error
};

export const API_BASE_URL = getBaseURL();
console.log('🚀 API Configured:', API_BASE_URL);

export const API_ENDPOINTS = {
  interpret: `${API_BASE_URL}/api/interpret`,
  transcribe: `${API_BASE_URL}/api/transcribe`,
  dreams: `${API_BASE_URL}/api/dreams`,
  dreamById: (id: string) => `${API_BASE_URL}/api/dreams/${id}`,
};
