import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Analytics } from '../services/AnalyticsService';
import dreamService from '../services/dreamService';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import CustomAlert, { AlertButton, AlertType } from '../components/CustomAlert';

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
  danger: '#EF4444',
  gold: '#F59E0B'
};

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [dreams, setDreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [energyFilter, setEnergyFilter] = useState<'all' | 'high' | 'low'>('all');

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchDreams();
      } else {
        setLoading(false);
      }
    }, [user])
  );

  const fetchDreams = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await dreamService.getDreams(user.id);
      setDreams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Rüyalar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDream = async (id: string) => {
    showAlert(
      t.history.deleteTitle,
      t.history.deleteConfirm,
      [
        { text: t.history.cancel, style: 'cancel' },
        {
          text: t.history.delete,
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await dreamService.deleteDream(id, user.id);
              Analytics.logDreamDeleted(id);
              fetchDreams();
            } catch (error) {
              console.error('Silme hatası:', error);
            }
          }
        }
      ],
      'warning'
    );
  };

  const toggleFavorite = async (id: string, currentFavorite: boolean) => {
    if (!user) return;

    // Optimistic Update
    const updatedDreams = dreams.map(d => d.id === id ? { ...d, isFavorite: !currentFavorite } : d);
    setDreams(updatedDreams);

    try {
      const isGuest = user.id.startsWith('guest-');
      if (isGuest) {
        // Local handling for guests
        const localDreams = await dreamService.getLocalDreams();
        const newLocal = localDreams.map(d => d.id === id ? { ...d, isFavorite: !currentFavorite } : d);
        await dreamService['saveLocalDreams'](newLocal);
      } else {
        // TODO: Backend implementation
      }
      Analytics.logFavoriteToggled(id, !currentFavorite);
    } catch (error) {
      // Revert on error
      fetchDreams();
    }
  };

  // 🔍 Filter Logic
  const getFilteredDreams = () => {
    let filtered = [...dreams];

    if (activeTab === 'favorites') {
      filtered = filtered.filter(d => d.isFavorite);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.dreamText.toLowerCase().includes(q) || d.interpretation?.toLowerCase().includes(q)
      );
    }

    if (energyFilter === 'high') filtered = filtered.filter(d => (d.energy || 0) >= 70);
    if (energyFilter === 'low') filtered = filtered.filter(d => (d.energy || 0) < 40);

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredDreams = getFilteredDreams();

  return (
    <View style={styles.container}>
      {/* Gradient removed for global background */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.history.title}</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>{t.history.all}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>{t.history.favorites}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={THEME.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            placeholder={t.history.searchPlaceholder}
            placeholderTextColor={THEME.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            underlineColor="transparent"
            selectionColor={THEME.primary}
            theme={{ colors: { primary: 'transparent', text: '#fff' } }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color={THEME.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Feather name="sliders" size={18} color={showFilters ? '#fff' : THEME.textMuted} />
        </TouchableOpacity>
      </View>

      {
        showFilters && (
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.chip, energyFilter === 'all' && styles.chipActive]}
              onPress={() => setEnergyFilter('all')}
            >
              <Text style={[styles.chipText, energyFilter === 'all' && styles.chipTextActive]}>{t.history.allEnergy}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, energyFilter === 'high' && styles.chipActive]}
              onPress={() => setEnergyFilter('high')}
            >
              <Text style={[styles.chipText, energyFilter === 'high' && styles.chipTextActive]}>{t.history.highEnergy}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, energyFilter === 'low' && styles.chipActive]}
              onPress={() => setEnergyFilter('low')}
            >
              <Text style={[styles.chipText, energyFilter === 'low' && styles.chipTextActive]}>{t.history.lowEnergy}</Text>
            </TouchableOpacity>
          </View>
        )
      }

      {
        loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator color={THEME.primary} size="large" />
            <Text style={styles.loadingText}>{t.history.loading}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContent}>
            {filteredDreams.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Feather name="book-open" size={32} color={THEME.textMuted} />
                </View>
                <Text style={styles.emptyText}>
                  {searchQuery ? t.history.noResults : t.history.empty}
                </Text>
              </View>
            ) : (
              filteredDreams.map((dream, index) => (
                <Animated.View key={dream.id} style={{ opacity: fadeAnim }}>
                  <View style={styles.cardContainer}>
                    <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
                    <LinearGradient
                      colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.dateRow}>
                          <Feather name="calendar" size={12} color={THEME.textMuted} />
                          <Text style={styles.dateText}>
                            {new Date(dream.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                          </Text>
                        </View>
                        <View style={styles.actions}>
                          <TouchableOpacity onPress={() => toggleFavorite(dream.id, dream.isFavorite)} style={styles.actionBtn}>
                            <Feather name="star" size={16} color={dream.isFavorite ? THEME.gold : THEME.textMuted} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => deleteDream(dream.id)} style={styles.actionBtn}>
                            <Feather name="trash-2" size={16} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <Text style={styles.dreamText} numberOfLines={2}>
                        {dream.dreamText}
                      </Text>

                      <View style={styles.cardFooter}>
                        <View style={styles.energyBadge}>
                          <Feather name="zap" size={12} color={THEME.primary} />
                          <Text style={styles.energyText}>{dream.energy || 50}%</Text>
                        </View>

                        <TouchableOpacity
                          style={styles.detailsBtn}
                          onPress={() => {
                            // @ts-ignore
                            navigation.navigate('Result', {
                              interpretation: dream.interpretation,
                              energy: dream.energy,
                              symbols: dream.symbols,
                              dreamText: dream.dreamText,
                              date: dream.date,
                              fromHistory: true,
                              dreamId: dream.id
                            });
                          }}
                        >
                          <Text style={styles.detailsText}>İncele</Text>
                          <Feather name="chevron-right" size={14} color={THEME.accent} />
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>
                </Animated.View>
              ))
            )}
            <View style={{ height: 80 }} />
          </ScrollView>
        )
      }

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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', // Slight dark overlay for header
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: {
    color: THEME.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },

  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 14,
    height: 48,
  },
  filterBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(155, 48, 255, 0.2)',
    borderColor: THEME.primary,
  },

  filterOptions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: 'rgba(155, 48, 255, 0.15)',
    borderColor: THEME.primary,
  },
  chipText: {
    color: THEME.textMuted,
    fontSize: 12,
  },
  chipTextActive: {
    color: THEME.accent,
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: THEME.textMuted,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    padding: 4,
  },

  dreamText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(155, 48, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  energyText: {
    color: THEME.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsText: {
    color: THEME.accent,
    fontSize: 13,
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: THEME.textMuted,
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.6,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: THEME.textMuted,
    fontSize: 16,
  }
});
