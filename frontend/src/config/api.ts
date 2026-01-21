import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_URL } from '@env';

const getBaseURL = () => {
  // Development modda local backend kullan
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';  // Android Emulator için
    }
    // iOS fiziksel cihaz veya simulator için bilgisayarın IP'si
    return 'http://10.62.8.112:3000'; // Bilgisayarın local IP adresi
  }

  // Production modda .env'den oku
  return API_URL || 'https://dream-interpreter-backend-5z7son9xn-durangzrs-projects.vercel.app';
};

export const API_BASE_URL = getBaseURL();

export const API_ENDPOINTS = {
  interpret: `${API_BASE_URL}/api/interpret`,
  transcribe: `${API_BASE_URL}/api/transcribe`,
  dreams: `${API_BASE_URL}/api/dreams`,
  dreamById: (id: string) => `${API_BASE_URL}/api/dreams/${id}`,
};
