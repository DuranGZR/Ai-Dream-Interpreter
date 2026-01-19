import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../config/api';
// @ts-ignore
import Svg, { Rect, Text as SvgText, Line, G } from 'react-native-svg';
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

export default function StatsScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalDreams: 0,
    avgEnergy: 0,
    topSymbols: [] as any[],
    weeklyData: [] as number[],
  });
  const [loading, setLoading] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadStats();
      }
    }, [user])
  );

  const loadStats = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_ENDPOINTS.dreams}?userId=${user.id}`);
      const dreams = await response.json();

      if (!Array.isArray(dreams)) {
        console.log('Veri formatı hatalı');
        setLoading(false);
        return;
      }

      const total = dreams.length;
      const totalEnergy = dreams.reduce((sum: number, d: any) => sum + (d.energy || 0), 0);
      const avg = total > 0 ? Math.round(totalEnergy / total) : 0;

      // Symbols
      const symbolCounts: any = {};
      dreams.forEach((dream: any) => {
        if (dream.symbols) {
          dream.symbols.forEach((symbol: any) => {
            symbolCounts[symbol.name] = (symbolCounts[symbol.name] || 0) + 1;
          });
        }
      });

      const topSymbols = Object.entries(symbolCounts)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Weekly Data
      const weekly = Array(7).fill(0);
      const today = new Date();
      dreams.forEach((dream: any) => {
        const dreamDate = new Date(dream.date);
        const diffDays = Math.floor((today.getTime() - dreamDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          weekly[6 - diffDays]++;
        }
      });

      setStats({
        totalDreams: total,
        avgEnergy: avg,
        topSymbols,
        weeklyData: weekly,
      });

    } catch (error) {
      console.error('İstatistik hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBarChart = () => {
    const maxValue = Math.max(...stats.weeklyData, 3); // Min scale 3
    const chartHeight = 160;
    const barWidth = 24;
    const spacing = (width - 80 - (barWidth * 7)) / 6;

    return (
      <Svg width={width - 40} height={chartHeight + 40}>
        {/* Grid Lines */}
        <Line x1="0" y1="0" x2={width - 48} y2="0" stroke="rgba(255,255,255,0.1)" strokeDasharray="5, 5" />
        <Line x1="0" y1={chartHeight / 2} x2={width - 48} y2={chartHeight / 2} stroke="rgba(255,255,255,0.1)" strokeDasharray="5, 5" />
        <Line x1="0" y1={chartHeight} x2={width - 48} y2={chartHeight} stroke="rgba(255,255,255,0.1)" />

        {stats.weeklyData.map((value, index) => {
          const barHeight = (value / maxValue) * chartHeight;
          const x = index * (barWidth + spacing);
          const y = chartHeight - barHeight;

          return (
            <G key={index}>
              {/* Bar Glow */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={THEME.primary}
                rx={6}
                opacity={0.8}
              />

              {/* Bar Cap Gradient Illusion */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={4}
                fill="rgba(255,255,255,0.5)"
                rx={2}
              />

              <SvgText
                x={x + barWidth / 2}
                y={chartHeight + 24}
                fontSize="12"
                fill={THEME.textMuted}
                textAnchor="middle"
                fontWeight="500"
              >
                {t.stats.weekdays[index]}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      {/* Gradient removed for global background */}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>{t.stats.title}</Text>
          <Text style={styles.headerSubtitle}>{t.stats.subtitle}</Text>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(0,0,0,0)']}
              style={styles.cardGradient}
            >
              <View style={styles.iconCircle}>
                <Feather name="moon" size={20} color={THEME.accent} />
              </View>
              <Text style={styles.statValue}>{stats.totalDreams}</Text>
              <Text style={styles.statLabel}>{t.stats.totalDreams}</Text>
            </LinearGradient>
          </View>

          <View style={[styles.statCard]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(0,0,0,0)']}
              style={styles.cardGradient}
            >
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: 'rgba(245, 158, 11, 0.4)' }]}>
                <Feather name="zap" size={20} color={THEME.gold} />
              </View>
              <Text style={styles.statValue}>{stats.avgEnergy}%</Text>
              <Text style={styles.statLabel}>{t.stats.avgEnergy}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Weekly Chart */}
        <Animated.View style={[styles.chartCard, { opacity: fadeAnim }]}>
          <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.cardPadding}>
            <View style={styles.sectionHeader}>
              <Feather name="bar-chart-2" size={18} color={THEME.primary} />
              <Text style={styles.sectionTitle}>{t.stats.weeklyActivity}</Text>
            </View>
            {loading ? (
              <ActivityIndicator color={THEME.primary} style={{ marginVertical: 40 }} />
            ) : (
              renderBarChart()
            )}
          </View>
        </Animated.View>

        {/* Top Symbols */}
        <Animated.View style={[styles.chartCard, { opacity: fadeAnim }]}>
          <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.cardPadding}>
            <View style={styles.sectionHeader}>
              <Feather name="layers" size={18} color={THEME.success} />
              <Text style={[styles.sectionTitle, { color: THEME.success }]}>{t.stats.topSymbols}</Text>
            </View>

            {stats.topSymbols.map((symbol, index) => (
              <View key={index} style={styles.symbolRow}>
                <View style={styles.symbolInfo}>
                  <Text style={styles.symbolRank}>#{index + 1}</Text>
                  <Text style={styles.symbolName}>{symbol.name}</Text>
                </View>
                <View style={styles.symbolBadge}>
                  <Text style={styles.symbolCount}>{symbol.count} {t.stats.times}</Text>
                </View>
              </View>
            ))}

            {stats.topSymbols.length === 0 && !loading && (
              <Text style={styles.emptyText}>{t.stats.noData}</Text>
            )}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },

  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.textMuted,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(155, 48, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 48, 255, 0.3)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  chartCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginBottom: 20,
  },
  cardPadding: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.primary,
  },

  // Symbol List
  symbolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  symbolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  symbolRank: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 14,
    fontWeight: '700',
    width: 24,
  },
  symbolName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  symbolBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  symbolCount: {
    color: THEME.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: THEME.textMuted,
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  }
});
