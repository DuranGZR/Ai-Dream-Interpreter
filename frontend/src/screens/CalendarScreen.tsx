import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Locale configuration for Turkish
LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  today: 'Bugün'
};
LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today'
};
LocaleConfig.defaultLocale = 'tr';

const { width } = Dimensions.get('window');

// 🌌 COSMIC PURPLE THEME
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

export default function CalendarScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigation = useNavigation();
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [dreamsOnDate, setDreamsOnDate] = useState<any[]>([]);
  const [allDreamsDisplay, setAllDreamsDisplay] = useState<any[]>([]); // To manage loaded dreams

  // Switch calendar locale based on language
  useEffect(() => {
    LocaleConfig.defaultLocale = language;
  }, [language]);

  // İlk yükleme
  useEffect(() => {
    if (user) {
      loadDreamDates();
    }
  }, [user]);

  // Ekran her açıldığında yenile
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadDreamDates();
      }
    }, [user])
  );

  const loadDreamDates = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.dreams}?userId=${user.id}`);
      const dreams = await response.json();
      setAllDreamsDisplay(dreams); // Store all dreams

      const marked: any = {};
      dreams.forEach((dream: any) => {
        const date = new Date(dream.date).toISOString().split('T')[0];
        marked[date] = {
          customStyles: {
            container: {
              backgroundColor: 'rgba(155, 48, 255, 0.2)',
              borderWidth: 1,
              borderColor: 'rgba(155, 48, 255, 0.5)',
              borderRadius: 8,
            },
            text: {
              color: '#E0AAFF',
              fontWeight: 'bold',
            }
          }
        };
      });

      // If a date is already selected, keep it selected visually
      if (selectedDate) {
        marked[selectedDate] = {
          ...marked[selectedDate],
          customStyles: {
            container: {
              backgroundColor: THEME.primary,
              borderRadius: 50, // Circle for selected
              shadowColor: THEME.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              elevation: 10,
            },
            text: {
              color: '#fff',
              fontWeight: 'bold',
            }
          }
        };
      }

      setMarkedDates(marked);
    } catch (error) {
      console.error('Tarihler yüklenemedi:', error);
    }
  };

  const onDayPress = (day: any) => {
    const newDate = day.dateString;
    setSelectedDate(newDate);

    // Update marking for selection
    const newMarked = { ...markedDates };

    // Reset old selection style if it existed in original data, otherwise remove it
    // Only way to do this reliably without re-fetching is to re-apply the base logic or track state deeper.
    // For simplicity, we just reload the base styles and apply the new selection.
    // Re-calculating from allDreamsDisplay for efficiency

    const marked: any = {};
    allDreamsDisplay.forEach((dream: any) => {
      const dDate = new Date(dream.date).toISOString().split('T')[0];
      marked[dDate] = {
        customStyles: {
          container: {
            backgroundColor: 'rgba(155, 48, 255, 0.2)',
            borderWidth: 1,
            borderColor: 'rgba(155, 48, 255, 0.5)',
            borderRadius: 8,
          },
          text: {
            color: '#E0AAFF',
            fontWeight: 'bold',
          }
        }
      };
    });

    // Apply selection style
    marked[newDate] = {
      customStyles: {
        container: {
          backgroundColor: THEME.primary,
          borderRadius: 50, // Circle
          shadowColor: THEME.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 15,
          elevation: 10,
          borderWidth: 0,
        },
        text: {
          color: '#fff',
          fontWeight: 'bold',
        }
      }
    };

    setMarkedDates(marked);

    // Filter dreams
    const filtered = allDreamsDisplay.filter((dream: any) => {
      const dreamDate = new Date(dream.date).toISOString().split('T')[0];
      return dreamDate === newDate;
    });
    setDreamsOnDate(filtered);
  };

  return (
    <View style={styles.container}>
      {/* Gradient removed for global background */}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.calendar.title}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* CALENDAR */}
        <View style={styles.calendarContainer}>
          <Calendar
            markingType={'custom'}
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: '#6b7280',
              selectedDayBackgroundColor: THEME.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: THEME.accent,
              dayTextColor: '#ffffff',
              textDisabledColor: '#333',
              dotColor: THEME.primary,
              selectedDotColor: '#ffffff',
              arrowColor: '#fff',
              monthTextColor: '#fff',
              textMonthFontWeight: 'bold',
              textMonthFontSize: 18,
              textDayFontSize: 14,
              textDayHeaderFontSize: 12,
            }}
          />
        </View>

        {/* DREAMS LIST TITLE */}
        {selectedDate && (
          <Text style={styles.sectionTitle}>
            {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        )}

        {/* DREAM CARDS */}
        <View style={styles.listContainer}>
          {selectedDate && dreamsOnDate.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="moon" size={40} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyText}>{t.calendar.empty}</Text>
            </View>
          )}

          {dreamsOnDate.map((dream, index) => (
            <View key={index} style={styles.cardContainer}>
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={['rgba(91, 33, 182, 0.4)', 'rgba(255,255,255,0.02)']} // Purple to transparent
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.energyBadge}>
                    <Feather name="zap" size={12} color="#fff" />
                    <Text style={styles.energyText}>{dream.energy || 50}%</Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(dream.date).toLocaleDateString('tr-TR')}
                  </Text>
                </View>

                <Text style={styles.dreamText} numberOfLines={2}>
                  {dream.dreamText}
                </Text>

                <TouchableOpacity
                  style={styles.readMoreButton}
                  onPress={() => {
                    // @ts-ignore
                    navigation.navigate('Result', {
                      interpretation: dream.interpretation,
                      energy: dream.energy,
                      symbols: dream.symbols,
                      dreamText: dream.dreamText
                    });
                  }}
                >
                  <View style={styles.playIcon}>
                    <Feather name="chevron-right" size={14} color="#fff" />
                  </View>
                  <Text style={styles.readMoreText}>{t.calendar.readMore}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Spacer for bottom tabs */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    padding: 8,
  },

  calendarContainer: {
    marginBottom: 30,
    backgroundColor: 'transparent',
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 4,
  },

  listContainer: {
    marginBottom: 20,
  },

  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)', // Border glow
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6D28D9', // Deep Purple
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  energyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  dreamText: {
    color: '#E2E8F0',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readMoreText: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '500',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    opacity: 0.5,
    gap: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 14,
  }
});
