import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Animated, TouchableOpacity, ImageBackground } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const THEME = {
  primary: '#9B30FF',
  gold: '#FFD700',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.7)',
};

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    id: 1,
    icon: 'brain',
    iconType: 'MaterialCommunityIcons',
    color: '#A855F7', // Purple
    title: 'BİLİNÇALTININ HARİTASI',
    subtitle: 'Derin Analiz',
    description: 'Rüyalarınız rastgele görüntüler değil, ruhunuzdan gelen şifreli mektuplardır. Yapay Zeka ile bu şifreleri çözün.',
  },
  {
    id: 2,
    icon: 'book-open-page-variant',
    iconType: 'MaterialCommunityIcons',
    color: '#F59E0B', // Gold
    title: 'KADİM BİLGELİK',
    subtitle: 'RAG Teknolojisi',
    description: 'Binlerce yıllık sembol sözlüğü ve modern psikoloji el ele. "Yılan" sadece bir hayvan değil, bir dönüşüm işaretidir.',
  },
  {
    id: 3,
    icon: 'account-switch',
    iconType: 'MaterialCommunityIcons',
    color: '#10B981', // Emerald
    title: 'SİZE ÖZEL REHBER',
    subtitle: 'Adaptif Kişilik',
    description: 'İster Mistik bir kahin, ister Analitik bir doktor. Ruh halinize en uygun rehberi seçin ve yolculuğa başlayın.',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Background Animation Loop
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 4000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleComplete = async () => {
    // Save is handled in App.tsx mainly, but we do it here too just in case
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    onComplete();
  };

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
    } else {
      handleComplete();
    }
  };

  const BackgroundLayer = ({ index, color }: { index: number; color: string }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
    });

    return (
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
        <LinearGradient
          colors={[color, '#000000']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.8 }}
        />
        {/* Subtle texture or noise could go here */}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 🌌 FULL SCREEN GRADIENT BACKGROUNDS */}
      {SLIDES.map((slide, index) => (
        <BackgroundLayer key={index} index={index} color={slide.color} />
      ))}

      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

      {/* 📜 SCROLLABLE CONTENT */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false, // color interpolation needs false usually, but opacity is fine with true? 
            // Actually, we are interpolating opacity on Views, so useNativeDriver: false strictly for width/colors if needed.
            // But here we just use ScrollView.
            listener: (event: any) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentIndex(index);
            }
          }
        )}
      >
        {SLIDES.map((slide, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

          const translateY = scrollX.interpolate({ inputRange, outputRange: [50, 0, 50] });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0] });
          const scale = scrollX.interpolate({ inputRange, outputRange: [0.8, 1, 0.8] });

          return (
            <View key={slide.id} style={styles.slide}>

              {/* ICON CARD - Centerpiece */}
              <Animated.View style={[
                styles.iconCard,
                { opacity, transform: [{ translateY }, { scale }], borderColor: slide.color }
              ]}>
                {/* Inner Glow */}
                <View style={[styles.iconGlow, { backgroundColor: slide.color }]} />
                <MaterialCommunityIcons name={slide.icon as any} size={80} color="#FFFFFF" />
              </Animated.View>

              {/* TEXT CONTENT */}
              <View style={styles.textContainer}>
                <Animated.Text style={[styles.subtitle, { color: slide.color, opacity }]}>
                  {slide.subtitle.toUpperCase()}
                </Animated.Text>

                <Animated.Text style={[styles.title, { opacity, transform: [{ translateY }] }]}>
                  {slide.title}
                </Animated.Text>

                <Animated.Text style={[styles.description, { opacity }]}>
                  {slide.description}
                </Animated.Text>
              </View>

            </View>
          );
        })}
      </Animated.ScrollView>

      {/* 🦶 FOOTER / CONTROLS */}
      <View style={styles.footer}>
        {/* PAGINATION DOTS */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 30, 8],
              extrapolate: 'clamp',
            });
            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: ['rgba(255,255,255,0.3)', '#FFFFFF', 'rgba(255,255,255,0.3)'],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]}
              />
            );
          })}
        </View>

        {/* NEXT / START BUTTON */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={goToNext}
          activeOpacity={0.8}
        >
          <BlurView intensity={30} tint="light" style={styles.buttonBlur}>
            <LinearGradient
              colors={currentIndex === SLIDES.length - 1 ? ['#9B30FF', '#7B2CBF'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.buttonGradient}
            >
              {currentIndex === SLIDES.length - 1 ? (
                <Text style={styles.buttonText}>BAŞLA</Text>
              ) : (
                <Feather name="arrow-right" size={24} color="#FFF" />
              )}
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  slide: {
    width,
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCard: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 56,
    backgroundColor: 'rgba(20,20,30,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  iconGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Cinzel_600SemiBold',
    marginBottom: 12,
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Cinzel_700Bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  description: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond_500Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pagination: {
    flexDirection: 'row',
    height: 10,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  buttonWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonBlur: {
    borderRadius: 30,
  },
  buttonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 18,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontFamily: 'Cinzel_700Bold',
    fontSize: 16,
    letterSpacing: 2,
  },
});
