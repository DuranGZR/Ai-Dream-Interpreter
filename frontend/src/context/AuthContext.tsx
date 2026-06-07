import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ResponseType } from 'expo-auth-session';
import { onAuthStateChanged, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '@env';
import { auth, db } from '../config/firebase';
import dreamService from '../services/dreamService';

interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  persona?: string; // e.g., 'MYSTIC', 'ANALYST', 'GUIDE'
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, birthDate: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  appleLogin: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { },
  register: async () => { },
  logout: async () => { },
  googleLogin: async () => { },
  appleLogin: async () => { },
  loginAsGuest: async () => { },
  resetPassword: async () => { },
  updateProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase Auth state listener
    const initAuth = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          console.log('🔥 Firebase Auth state changed: User logged in', firebaseUser.email);
          // Firestore'dan profil yükle
          await loadUserProfile(firebaseUser);
        } else {
          console.log('🔥 Firebase Auth state changed: User logged out');
          // AsyncStorage'dan misafir kontrolü
          const userData = await AsyncStorage.getItem('user');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.id?.startsWith('guest-')) {
              console.log('📦 Guest user from AsyncStorage');
              setUser(parsedUser);
            } else {
              console.log('🧹 Clearing orphaned user data');
              await AsyncStorage.removeItem('user');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    initAuth();
  }, []);

  const loadUserProfile = async (firebaseUser: any) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📦 Profile loaded from Firestore');

        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || userData.email,
          name: userData.name || firebaseUser.displayName,
          firstName: userData.firstName,
          lastName: userData.lastName,
          birthDate: userData.birthDate,
          photoURL: userData.photoURL || firebaseUser.photoURL,
          persona: userData.persona || 'ANALYST',
        };

        await AsyncStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      } else {
        console.log('⚠️ No Firestore profile for user');
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          photoURL: firebaseUser.photoURL,
          persona: 'ANALYST',
        };
        setUser(user);
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      // Fallback
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL,
      };
      setUser(user);
    }
  };

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking auth state...');

      // Önce authService'den mevcut kullanıcıyı kontrol et
      const currentUser = await authService.loadUser();

      if (currentUser) {
        console.log('✅ User found:', currentUser.email);

        // Firestore'dan detaylı profil bilgilerini yükle
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.id));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('📦 Profile loaded from Firestore');

            setUser({
              id: currentUser.id,
              email: currentUser.email,
              name: userData.name || currentUser.name,
              firstName: userData.firstName || currentUser.firstName,
              lastName: userData.lastName || currentUser.lastName,
              birthDate: userData.birthDate || currentUser.birthDate,
              photoURL: userData.photoURL || currentUser.photoURL,
              persona: userData.persona || 'ANALYST',
            });
          } else {
            console.log('⚠️ No Firestore profile, using Firebase Auth data');
            setUser({
              id: currentUser.id,
              email: currentUser.email,
              name: currentUser.name,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              birthDate: currentUser.birthDate,
              photoURL: currentUser.photoURL,
              persona: (currentUser as any).persona || 'ANALYST',
            });
          }
        } catch (firestoreError) {
          console.warn('⚠️ Firestore load failed, using Auth data:', firestoreError);
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            birthDate: currentUser.birthDate,
            photoURL: currentUser.photoURL,
            persona: (currentUser as any).persona || 'ANALYST',
          });
        }
      } else {
        console.log('ℹ️ No user found in Firebase');
        // AsyncStorage'dan backup kontrolü - ama guest kullanıcıları temizle
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          // Guest kullanıcıyı temizle, gerçek giriş yapsınlar
          if (parsedUser.id?.startsWith('guest-')) {
            console.log('🧹 Clearing guest user, showing login');
            await AsyncStorage.removeItem('user');
            setUser(null);
          } else {
            console.log('📦 User loaded from AsyncStorage');
            setUser(parsedUser);
          }
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('❌ Auth kontrol hatası:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Guest Dream Migration Helper
  const migrateGuestDreams = async (newUserId: string) => {
    try {
      const guestDreams = await dreamService.getLocalDreams();

      if (guestDreams.length > 0) {
        console.log(`📦 Migrating ${guestDreams.length} guest dreams to user account...`);

        for (const dream of guestDreams) {
          if (!dream.interpretation) continue;

          // Update userId and save to backend
          await dreamService.saveDream({
            userId: newUserId,
            dreamText: dream.dreamText,
            interpretation: dream.interpretation,
            energy: dream.energy ?? 50,
            symbols: dream.symbols,
            date: dream.date,
          });
        }

        // Clear local storage after successful migration
        await AsyncStorage.removeItem('@dreams_storage');
        console.log('✅ Guest dreams migrated successfully');
      }
    } catch (error) {
      console.error('⚠️ Guest dream migration failed:', error);
      // Don't throw - migration failure shouldn't block login
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login with:', email);
      const user = await authService.loginWithEmail(email, password);

      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        persona: (user as any).persona || 'ANALYST',
      };

      // Migrate guest dreams before completing login
      await migrateGuestDreams(user.id);

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      console.log('✅ Login successful');
    } catch (error) {
      console.error('❌ Giriş hatası:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, birthDate: string) => {
    try {
      console.log('📝 Attempting registration:', email);
      const fullName = `${firstName} ${lastName}`;
      const user = await authService.signUpWithEmail(email, password, fullName, firstName, lastName, birthDate);

      const userData: User = {
        id: user.id,
        email: user.email,
        name: fullName,
        firstName,
        lastName,
        birthDate,
        photoURL: user.photoURL,
        persona: 'ANALYST', // Default for new users
      };

      // Migrate guest dreams to new account
      await migrateGuestDreams(user.id);

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      console.log('✅ Registration successful');
    } catch (error) {
      console.error('❌ Kayıt hatası:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await authService.logout();
      await AsyncStorage.removeItem('user');
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Çıkış hatası:', error);
    }
  };

  // Google Auth Request Hook
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    responseType: ResponseType.IdToken,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleSignIn(id_token);
      } else {
        console.error('❌ Google response error: No ID Token returned', response);
      }
    } else if (response?.type === 'error') {
      console.error('❌ Google Auth Request Failed:', response.error);
      alert('Google bağlantı hatası: ' + (response.error?.code || 'unknown'));
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setLoading(true);
      console.log('🔄 Google authentication processing...', { idTokenLength: idToken?.length });
      const credential = authService.getGoogleCredential(idToken);
      const user = await authService.signInWithCredential(credential);

      console.log('✅ Google Authentication verified with Firebase');

      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      console.log('✅ Google Login successful');
    } catch (error) {
      console.error('❌ Google Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        console.error('⚠️ INVALID CREDENTIAL: This usually means the SHA-1 fingerprint in Firebase Console does not match the app signing key.');
        alert('Google giriş hatası: İmza doğrulanamadı (SHA-1 hatası).');
      } else {
        alert('Google ile giriş yapılamadı: ' + (error.message || 'Bilinmeyen hata'));
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    try {
      if (request) {
        await promptAsync();
      } else {
        console.warn('Google Auth request not ready');
      }
    } catch (error) {
      console.error('Google başlatma hatası:', error);
    }
  };

  const appleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        setLoading(true);
        // Apple provider genellikle nonce ve accessToken ister, ancak Firebase için sadece idToken + rawNonce gerekebilir
        // Basitlik için sadece token ile deniyoruz, production'da nonce validasyonu gerekebilir
        const firebaseCredential = authService.getOAuthCredential(credential.identityToken, credential.authorizationCode || ''); // AccessToken yerine authCode pass edilebilir ama Firebase SDK ne bekliyor kontrol etmek lazım. Genelde idToken yeterlidir.
        // Düzeltme: AuthService.getOAuthCredential implementasyonunu güncellememiz gerekebilir
        // Ancak şimdilik standart akış:

        const user = await authService.signInWithCredential(firebaseCredential);
        const userData: User = {
          id: user.id,
          email: user.email,
          name: user.name, // Apple ilk girişte isim verir sadece!
          photoURL: user.photoURL,
        };

        // İsmi güncelle (Apple'dan geldiyse)
        if (credential.fullName?.givenName) {
          userData.name = `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim();
          userData.firstName = credential.fullName.givenName;
          userData.lastName = credential.fullName.familyName || '';
        }

        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log('✅ Apple Login successful');
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // Kullanıcı iptal etti
      } else {
        console.error('Apple Login Error:', e);
        alert('Apple ile giriş yapılamadı.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async () => {
    try {
      console.log('🎭 Logging in as guest');
      const guestUser: User = {
        id: 'guest-' + Date.now(),
        email: 'guest@ruyayorumlayici.com',
        name: 'Misafir Kullanıcı',
        // persona: undefined, // Explicitly undefined to trigger Onboarding Quiz
      };

      await AsyncStorage.setItem('user', JSON.stringify(guestUser));
      setUser(guestUser);
      console.log('✅ Guest login successful');
    } catch (error) {
      console.error('❌ Guest login error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔑 Resetting password for:', email);
      await authService.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('❌ Password reset error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) return;
      console.log('✏️ Updating profile:', updates);

      const updatedUser = { ...user, ...updates };

      // 1. AsyncStorage'a kaydet (hızlı local erişim için)
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // 2. Firestore'a kaydet (kalıcı storage)
      if (!user.id.startsWith('guest-')) {
        try {
          // Undefined değerleri temizle - Firestore kabul etmiyor
          const firestoreData: any = {
            email: updatedUser.email,
            updatedAt: new Date().toISOString(),
          };

          if (updatedUser.name) firestoreData.name = updatedUser.name;
          if (updatedUser.firstName) firestoreData.firstName = updatedUser.firstName;
          if (updatedUser.lastName) firestoreData.lastName = updatedUser.lastName;
          if (updatedUser.birthDate) firestoreData.birthDate = updatedUser.birthDate;
          if (updatedUser.persona) firestoreData.persona = updatedUser.persona;
          if (updatedUser.photoURL) firestoreData.photoURL = updatedUser.photoURL;

          // Firestore'a kullanıcı bilgilerini kaydet
          await setDoc(doc(db, 'users', user.id), firestoreData, { merge: true });

          // Firebase Auth'ta displayName'i güncelle
          if (auth.currentUser && updates.name) {
            await updateFirebaseProfile(auth.currentUser, {
              displayName: updates.name
            });
          }

          console.log('✅ Profile saved to Firestore');
        } catch (firestoreError) {
          console.error('⚠️ Firestore save failed:', firestoreError);
        }
      }

      setUser(updatedUser);
      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, appleLogin, loginAsGuest, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
