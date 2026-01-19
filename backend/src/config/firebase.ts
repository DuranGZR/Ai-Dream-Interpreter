import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Firebase Admin SDK yapılandırması
export function initializeFirebase() {
  try {
    // Firebase credentials kontrolü
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      console.warn('⚠️  Firebase Admin SDK yapılandırılmadı (FIREBASE_SERVICE_ACCOUNT_KEY eksik)');
      return null;
    }

    // Service account JSON'ı parse et
    const serviceAccount = JSON.parse(serviceAccountKey);

    // Firebase Admin'i başlat
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    console.log('✅ Firebase Admin SDK başlatıldı');
    return admin;
  } catch (error) {
    console.error('❌ Firebase başlatma hatası:', error);
    return null;
  }
}

// Firestore instance
export function getFirestore() {
  try {
    return admin.firestore();
  } catch (error) {
    console.error('Firestore alınamadı:', error);
    return null;
  }
}

// Firebase Auth instance
export function getAuth() {
  try {
    return admin.auth();
  } catch (error) {
    console.error('Auth alınamadı:', error);
    return null;
  }
}

// Firebase Storage instance
export function getStorage() {
  try {
    return admin.storage();
  } catch (error) {
    console.error('Storage alınamadı:', error);
    return null;
  }
}

// Token doğrulama
export async function verifyIdToken(token: string) {
  try {
    const auth = getAuth();
    if (!auth) throw new Error('Firebase Auth yapılandırılmamış');
    
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    throw error;
  }
}

export default admin;
