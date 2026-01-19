import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export default function LoadingScreen({ 
  message = 'Yükleniyor...', 
  submessage 
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(138, 43, 226, 0.25)', 'rgba(106, 13, 173, 0.15)']}
        style={styles.loadingGradient}
      >
        <ActivityIndicator size="large" color="#9B30FF" />
        <Text style={styles.loadingText}>{message}</Text>
        {submessage && (
          <Text style={styles.loadingSubtext}>{submessage}</Text>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingGradient: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(138, 43, 226, 0.4)',
    minWidth: 200,
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingSubtext: {
    color: '#C8B4FF',
    marginTop: 8,
    fontSize: 14,
  },
});
