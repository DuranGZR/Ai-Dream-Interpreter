import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Text, TextInput, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { API_ENDPOINTS } from '../config/api';
import { OfflineService } from '../services/OfflineService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BlurView } from 'expo-blur';
import BreathingBackground from '../components/BreathingBackground';
import MysticLoader from '../components/MysticLoader';
import CustomAlert, { AlertButton, AlertType } from '../components/CustomAlert';
import { getMoonPhase } from '../utils/moonPhase';

const { width } = Dimensions.get('window');

// 🌌 COSMIC PURPLE THEME (Shared with Calendar)
const THEME = {
  background: ['#050505', '#120E16', '#1A1520'] as const,
  primary: '#9B30FF',
  secondary: '#7B2CBF',
  accent: '#E0AAFF',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  cardBg: 'rgba(255, 255, 255, 0.05)',
  glow: 'rgba(155, 48, 255, 0.6)',
};

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [dreamText, setDreamText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [moonPhase] = useState(getMoonPhase());
  const navigation = useNavigation();

  // 🌙 Rüya ile ilgili ünlü kişilerin sözleri (TR & EN)
  const DREAM_QUOTES = [
    {
      tr: "Rüyalar, bilinçaltının açığa çıkan düşünceleridir.",
      en: "Dreams are the royal road to the unconscious.",
      author: "Sigmund Freud"
    },
    {
      tr: "Kim içine bakmaya cesaret ederse, kendini bulur.",
      en: "Who looks outside, dreams; who looks inside, awakes.",
      author: "Carl Jung"
    },
    {
      tr: "Rüyalar, ruhun dışarı açılan penceresidir.",
      en: "Dreams are the guiding words of the soul.",
      author: "Carl Jung"
    },
    {
      tr: "Rüyalar, gerçekliğin dokunduğu hayal dünyasıdır.",
      en: "All that we see or seem is but a dream within a dream.",
      author: "Edgar Allan Poe"
    },
    {
      tr: "Hayal kurmak, deneyin başlangıcıdır.",
      en: "Imagination is more important than knowledge.",
      author: "Albert Einstein"
    },
    {
      tr: "İnsan rüya görürken ruhun doğasına en yakındır.",
      en: "In dreams, the soul approaches its true nature.",
      author: "Aristoteles"
    },
    {
      tr: "Rüyalar, uyanıklığın gölgeleridir.",
      en: "Dreams are the shadows of waking reality.",
      author: "Platon"
    },
    {
      tr: "Rüyalar küçüktür, ama bunları yapan şey büyüktür.",
      en: "Dreams are small, but the thing that makes them is great.",
      author: "Marie Curie"
    },
    {
      tr: "Rüyalar, gerçekleşmemiş arzuların tezahürüdür.",
      en: "Dreams are wish fulfillments.",
      author: "Sigmund Freud"
    },
    {
      tr: "Bilinçaltı asla yalan söylemez.",
      en: "The unconscious never lies.",
      author: "Carl Jung"
    },
    {
      tr: "Rüyalar geleceğin anahtarlarıdır.",
      en: "Dreams are the keys to the future.",
      author: "Paulo Coelho"
    },
    {
      tr: "Gece rüyalarınız, gündüz gerçeklerinizi şekillendirir.",
      en: "We are such stuff as dreams are made on.",
      author: "William Shakespeare"
    },
    {
      tr: "Rüya görmek, yaşamın en büyük özgürlüğüdür.",
      en: "The dream is the small hidden door in the deepest shrine of the soul.",
      author: "Rumi"
    },
    {
      tr: "Rüyalarınızı takip edin, sizi götürecekleri yere güvenin.",
      en: "Trust your dreams, they know where they're taking you.",
      author: "Ralph Waldo Emerson"
    },
    {
      tr: "Rüyalar, ruhun konuşma biçimidir.",
      en: "Dreams are the language of the soul.",
      author: "Friedrich Nietzsche"
    },
    {
      tr: "İmkansızı hayal etmek, mümkünün kapısını aralar.",
      en: "If you can dream it, you can do it.",
      author: "Walt Disney"
    },
    {
      tr: "Rüyalar olmadan gelecek yoktur.",
      en: "I have a dream.",
      author: "Martin Luther King Jr."
    },
    {
      tr: "Rüyalar, gerçeğin en derin yansımasıdır.",
      en: "Dreams are the deepest reflection of reality.",
      author: "Victor Hugo"
    },
    {
      tr: "Bilinçaltı, rüyalarda özgürce konuşur.",
      en: "The unconscious speaks freely in dreams.",
      author: "Alfred Adler"
    },
    {
      tr: "Rüyalar, içimizdeki seslerin yankısıdır.",
      en: "Dreams are the echoes of our inner voices.",
      author: "Emily Dickinson"
    },
    {
      tr: "Uykuda gördüğümüz rüyalar, uyanıkken yaşadığımız gerçeklerdir.",
      en: "Dreams are true while they last, and do we not live in dreams?",
      author: "Khalil Gibran"
    },
    {
      tr: "Rüyalar, ruhumuzun gizli bahçesidir.",
      en: "Dreams are the secret garden of the soul.",
      author: "Hermann Hesse"
    },
    {
      tr: "Her rüya bir mesaj, her sembol bir rehberdir.",
      en: "Every dream is a message, every symbol a guide.",
      author: "Joseph Campbell"
    },
    {
      tr: "Rüyalar yaşamın anlamını aramaktır.",
      en: "Dreams are the search for life's meaning.",
      author: "Søren Kierkegaard"
    },
    {
      tr: "Bilinçaltı, rüyalarda gerçek yüzünü gösterir.",
      en: "The unconscious reveals its true face in dreams.",
      author: "Jacques Lacan"
    }
  ];

  const [dailyQuote, setDailyQuote] = useState(() => {
    // Her uygulama açılışında random quote seç
    const quote = DREAM_QUOTES[Math.floor(Math.random() * DREAM_QUOTES.length)];
    return {
      text: language === 'tr' ? quote.tr : quote.en,
      author: quote.author,
      originalQuote: quote
    };
  });

  // Dil değiştiğinde quote'u güncelle
  useEffect(() => {
    if (dailyQuote.originalQuote) {
      setDailyQuote({
        text: language === 'tr' ? dailyQuote.originalQuote.tr : dailyQuote.originalQuote.en,
        author: dailyQuote.originalQuote.author,
        originalQuote: dailyQuote.originalQuote
      });
    }
  }, [language]);

  // Custom Alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    type?: AlertType;
    buttons?: AlertButton[];
  }>({ visible: false, title: '' });

  const showAlert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    type: AlertType = 'default'
  ) => {
    setAlertConfig({ visible: true, title, message, buttons, type });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Animations - Smooth Fade
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }).start();
    checkConnectionStatus();
    OfflineService.startAutoSync();
  }, []);

  const checkConnectionStatus = async () => {
    const online = await OfflineService.checkConnection();
    setIsOnline(online);
    const count = await OfflineService.getQueueCount();
    setQueueCount(count);
  };

  const handleInterpret = async () => {
    if (!dreamText.trim()) {
      return showAlert(t.home.missingInfo, t.home.emptyError, [{ text: t.home.ok || 'Tamam' }], 'warning');
    }
    if (authLoading) return;
    if (!user) {
      return showAlert(t.home.notLoggedIn, t.home.loginRequired, [{ text: t.home.ok || 'Tamam' }], 'info');
    }

    const online = await OfflineService.checkConnection();
    setIsOnline(online);

    if (!online) {
      showAlert(t.home.offline, t.home.offlineMessage, [
        {
          text: t.home.ok, onPress: async () => {
            await OfflineService.queueDream(dreamText);
            setDreamText('');
            setSnackbarMessage(t.home.savedToJournal);
            setSnackbarVisible(true);
            checkConnectionStatus();
          }
        }
      ], 'warning');
      return;
    }

    setLoading(true);
    // Mistik yükleme deneyimi için yapay bekleme
    await new Promise(resolve => setTimeout(resolve, 2500));
    try {
      const response = await fetch(API_ENDPOINTS.interpret, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamText,
          userId: user.id,
          persona: user.persona,
          userName: user.firstName || user.name?.split(' ')[0] || undefined
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();

      // @ts-ignore
      navigation.navigate('Result', { ...result, dreamText });
      setDreamText('');
    } catch (error: any) {
      if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        await OfflineService.queueDream(dreamText);
        setSnackbarMessage(t.home.connectionError);
        setSnackbarVisible(true);
        checkConnectionStatus();
      } else {
        showAlert(t.home.error, t.home.serviceError, [{ text: t.home.ok || 'Tamam' }], 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* HEADER */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{today}</Text>
              <View style={styles.separator} />
              <Feather name={moonPhase.icon as any} size={14} color={THEME.accent} style={{ marginRight: 6 }} />
              <Text style={styles.dateText}>{moonPhase.phase}</Text>
            </View>
            <Text style={styles.title}>{t.home.title}</Text>
            <Text style={styles.subtitle}>
              {user ? `${t.home.welcomeUser}, ${user.name || 'Gezgin'}` : t.home.subtitle}
            </Text>
          </Animated.View>

          {/* INPUT AREA - Glowing Glass */}
          <Animated.View style={[styles.inputContainer, { opacity: fadeAnim }]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
              style={StyleSheet.absoluteFill}
            />

            <TextInput
              mode="flat"
              placeholder={t.home.placeholder}
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={dreamText}
              onChangeText={setDreamText}
              multiline

              style={styles.input}
              underlineColor="transparent"
              selectionColor={THEME.primary}
              theme={{ colors: { primary: 'transparent', text: THEME.text } }}
              onFocus={() => {
                Animated.spring(inputScale, { toValue: 1.02, useNativeDriver: true }).start();
              }}
              onBlur={() => {
                Animated.spring(inputScale, { toValue: 1, useNativeDriver: true }).start();
              }}
            />

            {/* Input Footer Icon */}
            <View style={styles.inputFooter}>
              <Feather name="edit-3" size={16} color="rgba(255,255,255,0.2)" />
            </View>
          </Animated.View>

          {/* ACTION BUTTON - Glowing Primary */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              onPress={handleInterpret}
              disabled={loading || authLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#333', '#444'] : [THEME.primary, THEME.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>{!user ? t.home.loginButton : t.home.interpretButton}</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* 🌟 DAILY WISDOM - Minimal & Mystic */}
          <View style={styles.quoteContainer}>
            <View style={styles.quoteIconBg}>
              <Feather name="compass" size={20} color={THEME.accent} />
            </View>
            <Text style={styles.quoteText}>
              {dailyQuote.text}
            </Text>
            <Text style={styles.quoteAuthor}>{dailyQuote.author}</Text>
          </View>

          {/* OFFLINE STATUS */}
          {(!isOnline || queueCount > 0) && (
            <View style={styles.offlineBanner}>
              <Feather name="cloud-off" size={14} color={THEME.textMuted} style={{ marginRight: 8 }} />
              <Text style={{ color: THEME.textMuted, fontSize: 12 }}>
                {!isOnline ? t.home.offlineMode : `${t.home.pendingSync}: ${queueCount}`}
              </Text>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* 🔮 MISTIK YÜKLEME EKRANI */}
      <MysticLoader visible={loading} />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: '#1E1E1E', borderTopWidth: 1, borderTopColor: THEME.primary }}
      >
        <Text style={{ color: '#fff' }}>{snackbarMessage}</Text>
      </Snackbar>

      {/* CUSTOM ALERT */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 80, paddingBottom: 40 },

  header: { marginBottom: 40, alignItems: 'center' },
  dateBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(155, 48, 255, 0.1)',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(155, 48, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  dateText: {
    color: THEME.accent,
    fontSize: 12,
    fontFamily: 'CormorantGaramond_600SemiBold',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Cinzel_400Regular', // Thin elegant look
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1, // REDUCED FROM 4
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textMuted,
    textAlign: 'center',
    fontFamily: 'CormorantGaramond_400Regular',
    letterSpacing: 0.5,
  },
  // ...


  inputContainer: {
    marginBottom: 32,
    minHeight: 220,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 20,
    lineHeight: 30,
    padding: 24,
    minHeight: 220,
    textAlignVertical: 'top',
    fontFamily: 'CormorantGaramond_400Regular',
  },
  inputFooter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },

  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 2,
  },

  quoteContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  quoteIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(224, 170, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(224, 170, 255, 0.1)',
  },
  quoteText: {
    color: '#E0AAFF',
    fontSize: 18,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
    opacity: 0.9,
    lineHeight: 26,
    fontFamily: 'CormorantGaramond_500Medium',
  },
  quoteAuthor: {
    color: '#9B30FF',
    fontSize: 12,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 2,
  },

  offlineBanner: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 8,
    borderRadius: 50,
  }
});
