import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigation } from './src/navigation/AppNavigation';

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <AppNavigation />
      </AuthProvider>
    </PaperProvider>
  );
}
