import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
  Linking,
  Pressable,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, Switch } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { NotificationService } from '../services/NotificationService';
import { Analytics } from '../services/AnalyticsService';
import { API_ENDPOINTS } from '../config/api';
// ImagePicker removed
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert, { AlertButton, AlertType } from '../components/CustomAlert';

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
  danger: '#ff5252',
  success: '#10B981',
};

export default function ProfileScreen() {
  const { user, logout, updateProfile, resetPassword } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Otomatik Avatar Gradient - isimden üretilir
  const getAvatarGradient = (name?: string, email?: string): string[] => {
    const text = name || email || 'DG';
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const gradients = [
      ['#9B30FF', '#7B2CBF'],  // Cosmic Purple
      ['#0EA5E9', '#1E40AF'],  // Ocean Blue
      ['#10B981', '#064E3B'],  // Forest Green
      ['#F59E0B', '#B91C1C'],  // Sunset Orange
      ['#312E81', '#1E1B4B'],  // Midnight Blue
      ['#EC4899', '#BE185D'],  // Pink Rose
      ['#8B5CF6', '#6D28D9'],  // Violet
      ['#14B8A6', '#0D9488'],  // Teal
    ];

    return gradients[hash % gradients.length];
  };

  const getInitials = (user: any): string => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.name) {
      const parts = user.name.split(' ').filter((p: string) => p.length > 0);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  const avatarGradient = getAvatarGradient(user?.name, user?.email);
  const userInitials = getInitials(user);

  const [stats, setStats] = useState({
    totalDreams: 0,
    avgEnergy: 0,
    weeklyDreams: 0,
  });

  // Modal states
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form states
  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');

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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const enabled = await NotificationService.areNotificationsEnabled();
      setNotificationsEnabled(enabled);

      await loadStats();
      Analytics.logProfileView(user?.id || 'guest');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_ENDPOINTS.dreams}?userId = ${user.id} `);
      const dreams = await response.json();
      if (!Array.isArray(dreams)) return;

      const total = dreams.length;
      const totalEnergy = dreams.reduce((sum: number, d: any) => sum + (d.energy || 0), 0);
      const avg = total > 0 ? Math.round(totalEnergy / total) : 0;

      const now = new Date();
      const weeklyCount = dreams.filter((dream: any) => {
        const dDate = new Date(dream.date);
        return (now.getTime() - dDate.getTime()) / (1000 * 3600 * 24) <= 7;
      }).length;

      setStats({ totalDreams: total, avgEnergy: avg, weeklyDreams: weeklyCount });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const toggleNotifications = async () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    if (newState) {
      await NotificationService.scheduleDailyReminder();
    } else {
      await NotificationService.cancelAllNotifications();
    }
  };

  const handleLanguageSelect = (lang: 'tr' | 'en') => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };

  const handleHelpSupport = () => {
    Linking.openURL('mailto:contact@durangezer.com?subject=Rüya Yorumlayıcı - Destek');
  };

  const handleLogout = () => {
    showAlert(
      t.profile.logout,
      t.profile.logoutConfirm || 'Emin misiniz?',
      [
        { text: t.profile.cancel || 'İptal', style: 'cancel' },
        { text: t.profile.logout, style: 'destructive', onPress: logout }
      ],
      'warning'
    );
  };

  const handleOpenEditModal = () => {
    // Parse name into firstName/lastName if not set separately
    let firstName = user?.firstName || '';
    let lastName = user?.lastName || '';

    if (!firstName && user?.name) {
      const nameParts = user.name.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    setEditFirstName(firstName);
    setEditLastName(lastName);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editFirstName.trim()) return;
    try {
      const fullName = `${editFirstName.trim()} ${editLastName.trim()} `.trim();
      await updateProfile({
        name: fullName,
        firstName: editFirstName.trim(),
        lastName: editLastName.trim()
      });
      setShowEditModal(false);
      showAlert(
        t.profile.profileUpdated || 'Profil güncellendi!',
        undefined,
        [{ text: t.profile.ok || 'Tamam' }],
        'success'
      );
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* PROFILE HEADER */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={avatarGradient as any}
              style={styles.avatarBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: 'transparent' }]}>
                <Text style={styles.avatarText}>
                  {userInitials}
                </Text>
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.userName}>{user?.name || 'Misafir Kullanıcı'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Giriş yapılmadı'}</Text>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editProfileBtn} onPress={handleOpenEditModal}>
            <Feather name="edit-2" size={14} color={THEME.primary} />
            <Text style={styles.editProfileText}>{t.profile.editProfile || 'Profili Düzenle'}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* STATS OVERVIEW */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: THEME.accent }]}>{stats.totalDreams}</Text>
            <Text style={styles.statLabel}>{t.profile.dreamCount}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: THEME.gold }]}>{stats.avgEnergy}%</Text>
            <Text style={styles.statLabel}>{t.profile.avgEnergy}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: THEME.primary }]}>{stats.weeklyDreams}</Text>
            <Text style={styles.statLabel}>{t.profile.thisWeek}</Text>
          </View>
        </Animated.View>

        {/* SETTINGS GROUP */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>{t.profile.settings.toUpperCase()}</Text>

          <View style={styles.card}>
            <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />

            {/* Notifications */}
            <View style={styles.settingRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(155,48,255,0.2)' }]}>
                  <Feather name="bell" size={18} color={THEME.primary} />
                </View>
                <Text style={styles.rowLabel}>{t.profile.notifications}</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                color={THEME.primary}
              />
            </View>

            <View style={styles.divider} />

            {/* Persona */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('OnboardingQuiz');
              }}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                  <Feather name="cpu" size={18} color="#EC4899" />
                </View>
                <View>
                  <Text style={styles.rowLabel}>{t.profile.persona || 'Rüya Kişiliği'}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.valueText}>{user?.persona || 'ANALYST'}</Text>
                <Feather name="chevron-right" size={16} color={THEME.textMuted} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Language */}
            <TouchableOpacity style={styles.settingRow} onPress={() => setShowLanguageModal(true)}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                  <Feather name="globe" size={18} color="#38BDF8" />
                </View>
                <Text style={styles.rowLabel}>{t.profile.language}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.valueText}>{language === 'tr' ? 'Türkçe' : 'English'}</Text>
                <Feather name="chevron-right" size={16} color={THEME.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* OTHERS GROUP */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>{t.profile.other?.toUpperCase() || 'DİĞER'}</Text>

          <View style={styles.card}>
            <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />

            {/* Privacy Policy */}
            <TouchableOpacity style={styles.settingRow} onPress={() => setShowPrivacyModal(true)}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <Feather name="shield" size={18} color={THEME.success} />
                </View>
                <Text style={styles.rowLabel}>{t.profile.privacy}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={THEME.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Help & Support */}
            <TouchableOpacity style={styles.settingRow} onPress={handleHelpSupport}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(244, 114, 182, 0.2)' }]}>
                  <Feather name="help-circle" size={18} color="#F472B6" />
                </View>
                <Text style={styles.rowLabel}>{t.profile.helpSupport || 'Yardım & Destek'}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={THEME.textMuted} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={THEME.danger} />
          <Text style={styles.logoutText}>{t.profile.logout}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>v1.0.0 Cosmic Edition</Text>
        <View style={{ height: 40 }} />

      </ScrollView>

      {/* LANGUAGE SELECTION MODAL */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowLanguageModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.profile.languageSelect || 'Dil Seçin'}</Text>

            <TouchableOpacity
              style={[styles.languageOption, language === 'tr' && styles.languageOptionActive]}
              onPress={() => handleLanguageSelect('tr')}
            >
              <Text style={styles.languageText}>🇹🇷 {t.profile.turkish || 'Türkçe'}</Text>
              {language === 'tr' && <Feather name="check" size={20} color={THEME.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, language === 'en' && styles.languageOptionActive]}
              onPress={() => handleLanguageSelect('en')}
            >
              <Text style={styles.languageText}>🇬🇧 {t.profile.english || 'English'}</Text>
              {language === 'en' && <Feather name="check" size={20} color={THEME.primary} />}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowEditModal(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{t.profile.editProfile || 'Profili Düzenle'}</Text>

            <Text style={styles.inputLabel}>{t.profile.firstName || 'Ad'}</Text>
            <TextInput
              style={styles.textInput}
              value={editFirstName}
              onChangeText={setEditFirstName}
              placeholder={t.profile.firstName || 'Ad'}
              placeholderTextColor="rgba(255,255,255,0.3)"
            />

            <Text style={styles.inputLabel}>{t.profile.lastName || 'Soyad'}</Text>
            <TextInput
              style={styles.textInput}
              value={editLastName}
              onChangeText={setEditLastName}
              placeholder={t.profile.lastName || 'Soyad'}
              placeholderTextColor="rgba(255,255,255,0.3)"
            />

            {/* Password Reset Button */}
            <TouchableOpacity
              style={styles.passwordResetBtn}
              onPress={() => {
                if (user?.email && !user.email.includes('guest')) {
                  resetPassword(user.email);
                  showAlert(
                    t.profile.passwordResetSent || 'Şifre Sıfırlama',
                    t.profile.passwordResetMessage || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
                    [{ text: t.profile.ok || 'Tamam' }],
                    'success'
                  );
                } else {
                  showAlert(
                    t.profile.error || 'Hata',
                    t.profile.noEmailForReset || 'Şifre sıfırlama için geçerli bir e-posta adresi gerekli.',
                    [{ text: t.profile.ok || 'Tamam' }],
                    'error'
                  );
                }
              }}
            >
              <Feather name="lock" size={16} color={THEME.accent} />
              <Text style={styles.passwordResetText}>{t.profile.changePassword || 'Şifre Değiştir'}</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelBtnText}>{t.profile.cancel || 'İptal'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveBtnText}>{t.profile.save || 'Kaydet'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* PRIVACY POLICY MODAL */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.privacyModalContainer}>
          <View style={styles.privacyModalContent}>
            <View style={styles.privacyHeader}>
              <Text style={styles.privacyTitle}>{t.profile.privacy}</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.privacyScroll}>
              <Text style={styles.privacyText}>{t.profile.privacyText || 'Gizlilik politikası yükleniyor...'}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowPrivacyModal(false)}>
              <Text style={styles.closeButtonText}>{t.profile.close || 'Kapat'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  scrollContent: { padding: 20, paddingTop: 60 },

  header: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { marginBottom: 16 },
  avatarBorder: {
    padding: 3,
    borderRadius: 60,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(155, 48, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(155, 48, 255, 0.3)',
    gap: 6,
  },
  editProfileText: {
    color: THEME.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: THEME.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 14, color: THEME.textMuted },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: THEME.textMuted, marginTop: 4 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    color: THEME.textMuted,
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 1,
    fontWeight: '600'
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 16, color: '#fff' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 64 },
  valueText: { color: THEME.textMuted, marginRight: 8 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.2)',
    gap: 8,
    marginBottom: 20,
  },
  logoutText: { color: THEME.danger, fontSize: 16, fontWeight: '600' },
  versionText: { textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1520',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 10,
  },
  languageOptionActive: {
    backgroundColor: 'rgba(155, 48, 255, 0.2)',
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  languageText: {
    fontSize: 16,
    color: '#fff',
  },

  // Privacy Modal
  privacyModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  privacyModalContent: {
    backgroundColor: '#1A1520',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 20,
  },
  privacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  privacyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  privacyScroll: {
    flex: 1,
  },
  privacyText: {
    fontSize: 14,
    color: THEME.textMuted,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: THEME.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalHeader: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 15,
  },

  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  themeOption: {
    width: '48%',
    marginBottom: 20,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  themeSelected: {
    borderColor: THEME.primary,
    backgroundColor: 'rgba(155, 48, 255, 0.1)',
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  themeName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  inputLabel: {
    color: THEME.textMuted,
    fontSize: 12,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  saveBtn: {
    backgroundColor: THEME.primary,
  },
  cancelBtnText: {
    color: THEME.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  passwordResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(224, 170, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(224, 170, 255, 0.3)',
    gap: 8,
  },
  passwordResetText: {
    color: THEME.accent,
    fontSize: 14,
    fontWeight: '500',
  },
});
