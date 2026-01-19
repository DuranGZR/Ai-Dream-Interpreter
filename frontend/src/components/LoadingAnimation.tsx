import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface LoadingAnimationProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function LoadingAnimation({ 
  message = 'Rüyanız yorumlanıyor...', 
  size = 'medium' 
}: LoadingAnimationProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Döndürme animasyonu
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Nabız animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizes = {
    small: 40,
    medium: 60,
    large: 80,
  };

  const moonSize = sizes[size];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.moonContainer,
          {
            transform: [{ rotate }, { scale: pulseAnim }],
            width: moonSize,
            height: moonSize,
          },
        ]}
      >
        <Text style={[styles.moon, { fontSize: moonSize * 0.7 }]}>🌙</Text>
      </Animated.View>
      
      {message && (
        <View style={styles.messageContainer}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.dotsContainer}>
            <AnimatedDot delay={0} />
            <AnimatedDot delay={200} />
            <AnimatedDot delay={400} />
          </View>
        </View>
      )}
    </View>
  );
}

function AnimatedDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return <Animated.Text style={[styles.dot, { opacity }]}>.</Animated.Text>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  moonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moon: {
    textAlign: 'center',
  },
  messageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#7c4dff',
    fontWeight: '600',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  dot: {
    fontSize: 24,
    color: '#7c4dff',
    marginHorizontal: 2,
  },
});
