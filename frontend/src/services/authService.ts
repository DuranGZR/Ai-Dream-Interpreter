// Firebase Authentication Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  AuthCredential,
  updateProfile,
  sendPasswordResetEmail as firebaseSendPasswordReset
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  createdAt?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  constructor() {
    // Auth state değişikliklerini dinle
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = this.mapFirebaseUser(user);
      } else {
        this.currentUser = null;
      }
    });
  }

  // Firebase User'ı AuthUser'a map et
  private mapFirebaseUser(user: User): AuthUser {
    return {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0],
      photoURL: user.photoURL || undefined,
    };
  }

  // Email/şifre ile giriş
  async loginWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      console.log('🔐 Attempting login with:', email);
      console.log('🌐 Auth instance exists:', !!auth);
      console.log('🔌 Auth currentUser:', auth.currentUser?.email || 'null');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      console.log('✅ Login successful! User UID:', userCredential.user.uid);
      const user = this.mapFirebaseUser(userCredential.user);

      this.currentUser = user;
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      console.log('💾 User saved to AsyncStorage');

      return user;
    } catch (error: any) {
      console.error('❌ Login failed:');
      console.error('  Error Code:', error.code);
      console.error('  Error Message:', error.message);
      console.error('  Full Error:', JSON.stringify(error, null, 2));

      throw new Error(this.getErrorMessage(error.code || 'default'));
    }
  }

  // Email/şifre ile kayıt ol
  async signUpWithEmail(
    email: string,
    password: string,
    name?: string,
    firstName?: string,
    lastName?: string,
    birthDate?: string
  ): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Kullanıcı adını güncelle
      if (name && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }

      // Firestore'a kullanıcı bilgilerini kaydet
      const userDoc = {
        email,
        name: name || `${firstName} ${lastName}`,
        firstName: firstName || '',
        lastName: lastName || '',
        birthDate: birthDate || '',
        createdAt: new Date().toISOString(),
        photoURL: userCredential.user.photoURL || '',
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);

      const user: AuthUser = {
        id: userCredential.user.uid,
        email: userCredential.user.email || email,
        name: name || `${firstName} ${lastName}`,
        firstName,
        lastName,
        birthDate,
        photoURL: userCredential.user.photoURL || undefined,
        createdAt: userDoc.createdAt,
      };

      this.currentUser = user;
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));

      return user;
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      throw new Error(this.getErrorMessage(error.code || 'default'));
    }
  }

  // External Credential ile giriş (Google/Apple)
  async signInWithCredential(credential: AuthCredential): Promise<AuthUser> {
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const user = this.mapFirebaseUser(userCredential.user);

      // Eğer kullanıcı yeni ise veya bilgileri eksikse Firestore'u güncelle
      const userRef = doc(db, 'users', user.id);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.name,
          createdAt: new Date().toISOString(),
          photoURL: user.photoURL,
        });
      }

      this.currentUser = user;
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      console.error('Credential login hatası:', error);
      throw new Error(this.getErrorMessage(error.code || 'default'));
    }
  }

  // Google Credential Oluşturucu
  getGoogleCredential(idToken: string) {
    return GoogleAuthProvider.credential(idToken);
  }

  // Apple Credential Oluşturucu
  getOAuthCredential(idToken: string, accessToken: string) {
    const provider = new OAuthProvider('apple.com');
    return provider.credential({
      idToken,
      accessToken,
    });
  }

  // Google ile giriş (Stub - AuthContext kullanır)
  async loginWithGoogle(): Promise<AuthUser> {
    console.warn('⚠️ authService.loginWithGoogle is deprecated, use AuthContext instead.');
    throw new Error('Use AuthContext for Google Login');
  }

  // Apple ile giriş (Stub - AuthContext kullanır)
  async loginWithApple(): Promise<AuthUser> {
    console.warn('⚠️ authService.loginWithApple is deprecated, use AuthContext instead.');
    throw new Error('Use AuthContext for Apple Login');
  }

  // Çıkış yap
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
      await AsyncStorage.removeItem('auth_user');
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    }
  }

  // Mevcut kullanıcıyı al
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Kullanıcıyı yükle (Firebase Auth + Firestore'dan)
  async loadUser(): Promise<AuthUser | null> {
    try {
      // Firebase Auth'tan current user'ı al
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        console.log('No Firebase Auth user');
        return null;
      }

      console.log('🔍 Loading user from Firestore:', firebaseUser.uid);

      // Firestore'dan detaylı profil bilgilerini al
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('📦 User profile loaded from Firestore');

          const user: AuthUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || userData.email,
            name: userData.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            firstName: userData.firstName,
            lastName: userData.lastName,
            birthDate: userData.birthDate,
            photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
            createdAt: userData.createdAt,
          };

          this.currentUser = user;
          await AsyncStorage.setItem('auth_user', JSON.stringify(user));
          return user;
        } else {
          console.log('⚠️ No Firestore doc, creating one');
          // Firestore doc yoksa oluştur
          const newUserData = {
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            createdAt: new Date().toISOString(),
            photoURL: firebaseUser.photoURL || '',
          };

          await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);

          const user: AuthUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: newUserData.createdAt,
          };

          this.currentUser = user;
          await AsyncStorage.setItem('auth_user', JSON.stringify(user));
          return user;
        }
      } catch (firestoreError) {
        console.error('⚠️ Firestore error, using Auth data:', firestoreError);
        // Firestore hatası varsa, sadece Firebase Auth verisini kullan
        const user = this.mapFirebaseUser(firebaseUser);
        this.currentUser = user;
        return user;
      }
    } catch (error) {
      console.error('❌ Kullanıcı yükleme hatası:', error);
      return null;
    }
  }

  // Şifre sıfırlama emaili gönder
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await firebaseSendPasswordReset(auth, email);
    } catch (error: any) {
      console.error('Şifre sıfırlama hatası:', error);
      throw new Error(this.getErrorMessage(error.code || 'default'));
    }
  }

  // Hata mesajlarını Türkçeleştir
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/invalid-email': 'Geçersiz email adresi',
      'auth/user-disabled': 'Bu hesap devre dışı bırakılmış',
      'auth/user-not-found': 'Kullanıcı bulunamadı',
      'auth/wrong-password': 'Hatalı şifre',
      'auth/email-already-in-use': 'Bu email zaten kullanılıyor',
      'auth/weak-password': 'Şifre çok zayıf (min 6 karakter)',
      'auth/network-request-failed': 'İnternet bağlantısı yok',
      'default': 'Bir hata oluştu',
    };

    return errorMessages[errorCode] || errorMessages['default'];
  }
}

export default new AuthService();
