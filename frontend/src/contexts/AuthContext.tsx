import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { AuthUser } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  appleLogin: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  googleLogin: async () => {},
  appleLogin: async () => {},
  loginAsGuest: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth kontrol hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const loggedInUser = await authService.loginWithEmail(email, password);
      setUser(loggedInUser);
      await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  const googleLogin = async () => {
    try {
      const loggedInUser = await authService.loginWithGoogle();
      setUser(loggedInUser);
      await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
    } catch (error) {
      console.error('Google giriş hatası:', error);
      throw error;
    }
  };

  const appleLogin = async () => {
    try {
      const loggedInUser = await authService.loginWithApple();
      setUser(loggedInUser);
      await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
    } catch (error) {
      console.error('Apple giriş hatası:', error);
      throw error;
    }
  };

  const loginAsGuest = async () => {
    try {
      console.log('🎭 Guest mode activated');
      const guestUser: AuthUser = {
        id: 'guest-' + Date.now(),
        email: 'guest@example.com',
        name: 'Misafir Kullanıcı',
      };
      setUser(guestUser);
      await AsyncStorage.setItem('user', JSON.stringify(guestUser));
      console.log('✅ Guest user created:', guestUser);
    } catch (error) {
      console.error('Guest mode hatası:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, googleLogin, appleLogin, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}
