import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from '@env';

// Firebase yapılandırması - Environment variables'dan okunuyor
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

// Firebase app'i başlat
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
} else {
  app = getApp();
  console.log('✅ Using existing Firebase app');
}

// Auth'u başlat
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialized for Web');
  } else {
    // @ts-ignore - React Native persistence
    const { getReactNativePersistence } = require('@firebase/auth/dist/rn/index.js');
    // Yeni bir auth instance oluştur persistence ile
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
  }

  // React Native için network timeout ayarlarını artır
  // @ts-ignore - Firebase internal API
  if (auth && '_getSettings' in auth) {
    // @ts-ignore
    auth._getSettings().appVerificationDisabledForTesting = false;
  }
} catch (error: any) {
  // Eğer auth zaten varsa (hot reload), mevcut instance'ı kullan
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
    console.log('✅ Using existing Firebase Auth instance');
  } else {
    console.error('❌ Firebase Auth error:', error);
    // Fallback: persistence olmadan
    auth = getAuth(app);
    console.log('⚠️ Firebase Auth initialized without persistence');
  }
}

// Network durumunu log et
console.log('🌐 Network check: Testing Firebase connectivity...');
setTimeout(() => {
  console.log('⏰ Auth state:', auth.currentUser ? 'Signed in' : 'Signed out');
}, 1000);

// 🔧 GEÇICI ÇÖZÜM: Eğer emulator'de network sorunu yaşıyorsan, bu satırı aç:
// import { connectAuthEmulator } from 'firebase/auth';
// connectAuthEmulator(auth, 'http://10.0.2.2:9099'); // Android Emulator localhost
// console.log('⚠️ Using Firebase Auth Emulator');

// Firestore
const db = getFirestore(app);
console.log('✅ Firestore initialized');

// Storage
const storage = getStorage(app);
console.log('✅ Storage initialized');

export { app, auth, db, storage };
export default app;
