import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, TouchableOpacity, Dimensions, Vibration } from 'react-native';
import { Text, Snackbar, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_ENDPOINTS } from '../config/api';
import { ShareService } from '../services/ShareService';
import { Analytics } from '../services/AnalyticsService';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// 🌌 COSMIC PURPLE THEME (Shared)
const THEME = {
  background: ['#050505', '#120E16', '#1A1520'] as const,
  primary: '#9B30FF',
  secondary: '#7B2CBF',
  accent: '#E0AAFF',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  cardBg: 'rgba(255, 255, 255, 0.05)',
  glow: 'rgba(155, 48, 255, 0.6)',
  gold: '#F59E0B',
  success: '#10B981',
};

// Typewriter Hook - daha hızlı!
function useTypewriter(text: string, speed: number = 8, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState(enabled ? '' : text);
  const [isComplete, setIsComplete] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        // 3 karakter birden ekle (daha hızlı!)
        const chunkSize = 3;
        setDisplayedText(text.slice(0, index + chunkSize));
        index += chunkSize;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  const skipAnimation = () => {
    setDisplayedText(text);
    setIsComplete(true);
  };

  return { displayedText, isComplete, skipAnimation };
}

// Parse interpretation sections
function parseInterpretation(text: string) {
  const sections = {
    main: '',
    innerJourney: '',
    spiritualPractice: '',
    awareness: ''
  };

  // Split by section dividers
  const innerJourneyMatch = text.match(/━+\n?✨ İçsel Yolculuğun\n?━+\n*([\s\S]*?)(?=━|💫|$)/);
  const innerJourneyMatchEN = text.match(/━+\n?✨ Your Inner Journey\n?━+\n*([\s\S]*?)(?=━|💫|$)/);
  const practiceMatch = text.match(/━+\n?🌟 Bugünkü Rehberliğin\n?━+\n*([\s\S]*?)(?=━|💫|$)/);
  const practiceMatchEN = text.match(/━+\n?🌟 Today's Guidance\n?━+\n*([\s\S]*?)(?=━|💫|$)/);
  const awarenessMatch = text.match(/💫\s*"?([^"]*)"?\s*$/);

  // Extract main interpretation (before first divider)
  const mainMatch = text.match(/^([\s\S]*?)(?=━|$)/);
  sections.main = mainMatch ? mainMatch[1].trim() : text;

  if (innerJourneyMatch) {
    sections.innerJourney = innerJourneyMatch[1].trim();
  } else if (innerJourneyMatchEN) {
    sections.innerJourney = innerJourneyMatchEN[1].trim();
  }

  if (practiceMatch) {
    sections.spiritualPractice = practiceMatch[1].trim();
  } else if (practiceMatchEN) {
    sections.spiritualPractice = practiceMatchEN[1].trim();
  }

  if (awarenessMatch) {
    sections.awareness = awarenessMatch[1].trim();
  }

  return sections;
}

export default function ResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { interpretation, energy, symbols, dreamText, fromHistory, dreamId } = route.params as any;
  const { user } = useAuth();

  // fromHistory = true ise geçmişten geliyoruz, kaydet butonu gözükmesin
  const isFromHistory = fromHistory === true;

  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Parse sections
  const sections = parseInterpretation(interpretation || '');

  // Typewriter - geçmişten geliyorsa animasyon yok, hızı artırıldı (8ms, 3 karakter)
  const { displayedText, isComplete, skipAnimation } = useTypewriter(sections.main, 8, !isFromHistory);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const sectionFade = useRef(new Animated.Value(isFromHistory ? 1 : 0)).current;

  useEffect(() => {
    // Haptic feedback when result appears (sadece yeni yorumda)
    if (!isFromHistory) {
      Vibration.vibrate(100);
      Analytics.logDreamCreated(dreamText?.length || 0, energy);
    }

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: (energy || 50) / 100,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }, 500);
  }, []);

  // Fade in sections when typewriter completes
  useEffect(() => {
    if (isComplete) {
      Animated.timing(sectionFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isComplete]);

  const handleSave = async () => {
    if (!user) {
      setSnackbarMessage('Kaydetmek için giriş yapmalısınız');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.dreams, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          dreamText,
          interpretation,
          energy,
          symbols,
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Vibration.vibrate(50);
        Analytics.logDreamSaved(data.id, energy);
        setSnackbarMessage('Rüya günlüğüne kaydedildi');
        setSnackbarVisible(true);
        setTimeout(() => {
          // @ts-ignore
          navigation.navigate('History');
        }, 1500);
      } else {
        throw new Error('Kaydetme başarısız');
      }
    } catch (error) {
      setSnackbarMessage('Bir hata oluştu');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const success = await ShareService.shareDreamInterpretation(dreamText, interpretation, energy);
    Analytics.logShare('general', success);
  };

  return (
    <View style={styles.container}>
      {/* GERİ BUTONU - Sol Üst */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <BlurView intensity={30} tint="dark" style={styles.backButtonBlur}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </BlurView>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* HEADER - Floating Icon */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.successIconContainer}>
            <View style={styles.glowCircle}>
              <Feather name="moon" size={40} color={THEME.gold} />
            </View>
          </View>
          <Text style={styles.title}>
            {isFromHistory ? 'Rüya Yorumu' : 'Rüya Yorumunuz Hazır'}
          </Text>
          <Text style={styles.subtitle}>
            {isFromHistory ? 'Kayıtlı rüya' : 'Yapay zeka tarafından analiz edildi'}
          </Text>
        </Animated.View>

        {/* MAIN INTERPRETATION CARD - Typewriter Effect */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => !isComplete && skipAnimation()}
          style={styles.cardContainer}
          disabled={isFromHistory}
        >
          <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(0,0,0,0)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Feather name="book-open" size={20} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Yorumunuz</Text>
              {!isComplete && !isFromHistory && (
                <Text style={styles.skipHint}>Atla →</Text>
              )}
            </View>
            <Text style={styles.interpretationText}>{displayedText}</Text>
            {!isComplete && !isFromHistory && <Text style={styles.typingCursor}>▮</Text>}
          </LinearGradient>
        </TouchableOpacity>

        {/* ADDITIONAL SECTIONS - Fade in after typewriter */}
        <Animated.View style={{ opacity: sectionFade }}>

          {/* Inner Journey Section */}
          {sections.innerJourney && (
            <View style={styles.cardContainer}>
              <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.3)' }]}>
                    <Feather name="compass" size={20} color={THEME.accent} />
                  </View>
                  <Text style={[styles.cardTitle, { color: THEME.accent }]}>İçsel Yolculuğun</Text>
                </View>
                <Text style={styles.sectionText}>{sections.innerJourney}</Text>
              </View>
            </View>
          )}

          {/* Spiritual Practice Section */}
          {sections.spiritualPractice && (
            <View style={styles.cardContainer}>
              <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <Feather name="star" size={20} color={THEME.success} />
                  </View>
                  <Text style={[styles.cardTitle, { color: THEME.success }]}>Bugünkü Rehberliğin</Text>
                </View>
                <Text style={styles.sectionText}>{sections.spiritualPractice}</Text>
              </View>
            </View>
          )}

          {/* Awareness Message */}
          {sections.awareness && (
            <View style={styles.awarenessContainer}>
              <Text style={styles.awarenessText}>💫 "{sections.awareness}"</Text>
            </View>
          )}

          {/* ENERGY METER */}
          <View style={styles.cardContainer}>
            <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.cardGradient}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                  <Feather name="zap" size={20} color={THEME.gold} />
                </View>
                <Text style={[styles.cardTitle, { color: THEME.gold }]}>Rüya Enerjisi</Text>
                <Text style={styles.energyValue}>{energy}%</Text>
              </View>

              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]}
                >
                  <LinearGradient
                    colors={[THEME.gold, '#FCD34D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                  />
                </Animated.View>
              </View>

              <Text style={styles.energyDesc}>
                {energy > 75 ? 'Bu rüya çok yoğun bir duygusal enerji taşıyor.' :
                  energy > 40 ? 'Dengeli ve sakin bir rüya enerjisi.' :
                    'Düşük enerjili, dingin bir rüya.'}
              </Text>
            </View>
          </View>

          {/* SYMBOLS */}
          {symbols && symbols.length > 0 && (
            <View style={styles.cardContainer}>
              <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(155, 48, 255, 0.2)' }]}>
                    <Feather name="layers" size={20} color={THEME.primary} />
                  </View>
                  <Text style={[styles.cardTitle, { color: THEME.primary }]}>Semboller</Text>
                </View>

                <View style={styles.symbolsGrid}>
                  {symbols.map((symbol: any, index: number) => (
                    <View key={index} style={styles.symbolChip}>
                      <Text style={styles.symbolName}>
                        {typeof symbol === 'string' ? symbol : symbol.name}
                      </Text>
                      {typeof symbol === 'object' && symbol.meaning && (
                        <Text style={styles.symbolMeaning}>{symbol.meaning}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ACTIONS - Farklı modlara göre */}
          <View style={styles.actionsContainer}>

            {/* Geçmişten gelmiyorsa: Kaydet + Paylaş + Yeni */}
            {!isFromHistory && (
              <>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <LinearGradient
                      colors={[THEME.primary, THEME.secondary]}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Feather name="save" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>Günlüğe Kaydet</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>

                <View style={styles.secondaryRow}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
                    <Feather name="share-2" size={20} color="#fff" />
                    <Text style={styles.secondaryText}>Paylaş</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Feather name="rotate-ccw" size={20} color={THEME.textMuted} />
                    <Text style={[styles.secondaryText, { color: THEME.textMuted }]}>Yeni Analiz</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Geçmişten geliyorsa: Sadece Paylaş + Geri */}
            {isFromHistory && (
              <View style={styles.secondaryRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
                  <Feather name="share-2" size={20} color="#fff" />
                  <Text style={styles.secondaryText}>Paylaş</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => navigation.goBack()}
                >
                  <Feather name="arrow-left" size={20} color={THEME.textMuted} />
                  <Text style={[styles.secondaryText, { color: THEME.textMuted }]}>Geri Dön</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: '#1E1E1E' }}
      >
        <Text style={{ color: '#fff' }}>{snackbarMessage}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505', // ← Solid arka plan
  },
  scrollContent: { padding: 20, paddingTop: 80 },

  // Geri Butonu
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  header: { alignItems: 'center', marginBottom: 30 },
  successIconContainer: { marginBottom: 20 },
  glowCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    shadowColor: '#F59E0B',
    shadowRadius: 20,
    shadowOpacity: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Cinzel_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textMuted,
    textAlign: 'center',
    fontFamily: 'CormorantGaramond_400Regular',
  },

  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    fontFamily: 'Cinzel_600SemiBold',
  },
  skipHint: {
    fontSize: 12,
    color: THEME.textMuted,
    fontStyle: 'italic',
  },
  interpretationText: {
    color: '#E2E8F0',
    fontSize: 17,
    lineHeight: 28,
    fontFamily: 'CormorantGaramond_400Regular',
  },
  typingCursor: {
    color: THEME.accent,
    fontSize: 20,
    marginTop: 4,
  },
  sectionText: {
    color: '#E2E8F0',
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'CormorantGaramond_400Regular',
  },

  // Awareness
  awarenessContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: 'rgba(155, 48, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(155, 48, 255, 0.3)',
  },
  awarenessText: {
    color: THEME.accent,
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: 'CormorantGaramond_500Medium',
  },

  // Energy
  energyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  energyDesc: {
    color: THEME.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: 'CormorantGaramond_400Regular',
  },

  // Symbols
  symbolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  symbolChip: {
    backgroundColor: 'rgba(155, 48, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 48, 255, 0.3)',
  },
  symbolName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Cinzel_600SemiBold',
  },
  symbolMeaning: {
    color: THEME.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'CormorantGaramond_400Regular',
  },

  actionsContainer: {
    marginTop: 20,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 56,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: 'Cinzel_700Bold',
  },

  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  secondaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  }
});
