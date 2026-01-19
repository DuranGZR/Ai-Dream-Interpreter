import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import { Text, TextInput, ActivityIndicator, Divider, Portal, Modal, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import CustomAlert, { AlertType } from '../components/CustomAlert';

const { width } = Dimensions.get('window');

// 🌌 COSMIC PURPLE THEME (Shared)
const THEME = {
  primary: '#9B30FF',
  background: ['#050505', '#120E16', '#1A1520'] as const,
  card: 'rgba(30, 20, 50, 0.5)',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  glass: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(138, 43, 226, 0.3)',
  glow: 'rgba(155, 48, 255, 0.6)',
  placeholder: 'rgba(255,255,255,0.4)',
};

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, firstName: string, lastName: string, birthDate: string) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
  onAppleLogin: () => Promise<void>;
  onSkip: () => void;
}

export default function LoginScreen({ onLogin, onRegister, onGoogleLogin, onAppleLogin, onSkip }: LoginScreenProps) {
  const { resetPassword } = useAuth(); // Hook usage for reset password

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    type?: AlertType;
  }>({ visible: false, title: '' });

  const showErrorAlert = (message: string) => {
    setAlertConfig({
      visible: true,
      title: 'Hata',
      message,
      type: 'error'
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Reset Password States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const openResetModal = () => {
    setResetEmail(email); // Pre-fill if they typed it in main form
    setResetSuccess(false);
    setResetError('');
    setShowResetModal(true);
  };

  const performPasswordReset = async () => {
    if (!resetEmail.trim()) {
      setResetError('Lütfen e-posta adresinizi girin.');
      return;
    }

    setResetLoading(true);
    setResetError('');
    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        showErrorAlert('Lütfen e-posta ve şifrenizi girin.');
        return;
      }
    } else {
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
        showErrorAlert('Lütfen tüm alanları doldurun.');
        return;
      }
      if (password.length < 6) {
        showErrorAlert('Şifre en az 6 karakter olmalıdır.');
        return;
      }
    }

    // Network connectivity check
    console.log('🌐 Checking network connectivity...');
    const netState = await NetInfo.fetch();
    console.log('📡 Network State:', JSON.stringify(netState, null, 2));

    if (!netState.isConnected) {
      showErrorAlert('İnternet bağlantınız yok. Lütfen bağlantınızı kontrol edin.');
      return;
    }

    if (!netState.isInternetReachable) {
      showErrorAlert('İnternet bağlantınız var ancak internet erişimi yok. Lütfen tekrar deneyin.');
    }

    setLoading(true);
    console.log(`🔐 Attempting ${isLogin ? 'login' : 'register'} for: ${email}`);

    try {
      if (isLogin) {
        await onLogin(email, password);
        console.log('✅ Login successful');
      } else {
        await onRegister(email, password, firstName, lastName, birthDate || '01/01/2000');
        console.log('✅ Registration successful');
      }
    } catch (err: any) {
      console.error('❌ Auth Error:', err);
      console.error('  Message:', err.message);
      console.error('  Code:', err.code);
      showErrorAlert(err.message || (isLogin ? 'Giriş yapılamadı. Lütfen tekrar deneyin.' : 'Kayıt olunamadı. Lütfen tekrar deneyin.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient removed for global background */}

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* HEADER LOGO */}
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.moonGlow}>
            <Feather name="moon" size={60} color={THEME.primary} />
          </View>
          <Text style={styles.title}>Rüya Yorumlayıcı</Text>
          <Text style={styles.subtitle}>Bilinçaltının kapılarını arala</Text>
        </Animated.View>

        {/* GLASS FORM */}
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'rgba(0,0,0,0)']}
            style={styles.gradientBorder}
          >
            {/* SWITCH TABS */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.activeTab]}
                onPress={() => { setIsLogin(true); setError(''); }}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Giriş Yap</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.activeTab]}
                onPress={() => { setIsLogin(false); setError(''); }}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>

            {/* Removed inline error - now using CustomAlert */}

            {!isLogin && (
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Feather name="user" size={18} color={THEME.textMuted} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Ad"
                    placeholderTextColor={THEME.placeholder}
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.input}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    textColor="#fff"
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <TextInput
                    placeholder="Soyad"
                    placeholderTextColor={THEME.placeholder}
                    value={lastName}
                    onChangeText={setLastName}
                    style={[styles.input, { paddingLeft: 16 }]} // No icon adjustment
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    textColor="#fff"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Feather name="mail" size={18} color={THEME.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="E-posta Adresi"
                placeholderTextColor={THEME.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor="#fff"
              />
            </View>

            <View style={[styles.inputContainer, { marginBottom: isLogin ? 8 : 24 }]}>
              <Feather name="lock" size={18} color={THEME.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="Şifre"
                placeholderTextColor={THEME.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor="#fff"
              />
            </View>

            {isLogin && (
              <TouchableOpacity onPress={openResetModal} style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Şifremi Unuttum?</Text>
              </TouchableOpacity>
            )}

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={[THEME.primary, '#7B2CBF']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* DIVIDER */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* SOCIAL LOGIN */}
            <TouchableOpacity style={styles.socialBtn} onPress={onGoogleLogin}>
              <Feather name="globe" size={20} color="#fff" />
              <Text style={styles.socialBtnText}>Google ile Devam Et</Text>
            </TouchableOpacity>

          </LinearGradient>
        </Animated.View>

        {/* SKIP */}
        <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
          <Text style={styles.skipText}>Üye olmadan devam et</Text>
          <Feather name="arrow-right" size={16} color={THEME.textMuted} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 🔐 PASSWORD RESET MODAL */}
      <Portal>
        <Modal
          visible={showResetModal}
          onDismiss={() => setShowResetModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['#251A3A', '#151020']} // Solid Opaque Colors (Matte)
            style={styles.modalGradient}
          >
            <View style={styles.modalIconBg}>
              <Feather name="key" size={32} color={THEME.primary} />
            </View>

            <Text style={styles.modalTitle}>Şifre Sıfırlama</Text>

            {resetSuccess ? (
              <View style={styles.successContainer}>
                <Feather name="check-circle" size={48} color="#10B981" style={{ marginBottom: 16 }} />
                <Text style={styles.successText}>
                  Sıfırlama bağlantısı gönderildi! Lütfen e-posta kutunuzu kontrol edin.
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setShowResetModal(false)}
                  buttonColor={THEME.primary}
                  textColor="#fff"
                  style={{ marginTop: 16, width: '100%' }}
                >
                  Tamam
                </Button>
              </View>
            ) : (
              <>
                <Text style={styles.modalDesc}>
                  Hesabınıza ait e-posta adresini girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.
                </Text>

                <View style={[styles.inputContainer, { width: '100%', marginBottom: 16 }]}>
                  <Feather name="mail" size={18} color={THEME.textMuted} style={styles.inputIcon} />
                  <TextInput
                    placeholder="E-posta Adresiniz"
                    placeholderTextColor={THEME.placeholder}
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    textColor="#fff"
                  />
                </View>

                {resetError ? (
                  <Text style={[styles.errorText, { marginBottom: 16, textAlign: 'center' }]}>{resetError}</Text>
                ) : null}

                <View style={styles.modalBtnRow}>
                  <Button
                    mode="text"
                    onPress={() => setShowResetModal(false)}
                    textColor={THEME.textMuted}
                  >
                    İptal
                  </Button>
                  <Button
                    mode="contained"
                    onPress={performPasswordReset}
                    loading={resetLoading}
                    disabled={resetLoading}
                    buttonColor={THEME.primary}
                    textColor="#fff"
                    style={{ flex: 1, marginLeft: 16 }}
                  >
                    {resetLoading ? 'Gönderiliyor...' : 'Gönder'}
                  </Button>
                </View>
              </>
            )}
          </LinearGradient>
        </Modal>
      </Portal>

      {/* ERROR ALERT */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={[{ text: 'Tamam', style: 'default' }]}
        onClose={hideAlert}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    paddingTop: 60
  },

  logoContainer: { alignItems: 'center', marginBottom: 40 },
  moonGlow: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(155, 48, 255, 0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: THEME.glow,
    shadowColor: THEME.primary, shadowRadius: 20, shadowOpacity: 0.5,
    marginBottom: 16
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8, letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: THEME.textMuted },

  formContainer: {
    borderRadius: 24, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginBottom: 24
  },
  gradientBorder: { padding: 24 },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24
  },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10,
  },
  activeTab: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { color: THEME.textMuted, fontWeight: '500' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },

  inputContainer: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row', alignItems: 'center',
  },
  input: {
    flex: 1, backgroundColor: 'transparent',
    height: 50, fontSize: 16,
    paddingHorizontal: 0,
  },
  inputIcon: { marginLeft: 16, marginRight: 8 },

  row: { flexDirection: 'row' },

  errorContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    padding: 12, borderRadius: 12, marginBottom: 16
  },
  errorText: { color: '#FF5252', fontSize: 14, flex: 1 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: THEME.textMuted, fontSize: 13, textDecorationLine: 'underline' },

  submitButton: {
    height: 54, borderRadius: 16, overflow: 'hidden', marginTop: 8,
    shadowColor: THEME.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
  },
  btnGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  dividerContainer: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 16
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  orText: { color: THEME.textMuted, fontSize: 14 },

  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    height: 50, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.03)'
  },
  socialBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },

  skipBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 16,
  },
  skipText: { color: THEME.textMuted, fontSize: 15 },

  // MODAL STYLES
  modalContainer: {
    backgroundColor: 'transparent',
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalIconBg: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(155, 48, 255, 0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1, borderColor: THEME.glow,
  },
  modalTitle: {
    fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14, color: THEME.textMuted, textAlign: 'center', marginBottom: 24,
    lineHeight: 20
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center'
  },
  successContainer: {
    alignItems: 'center',
    padding: 8
  },
  successText: {
    fontSize: 16, color: '#fff', textAlign: 'center', lineHeight: 24
  }
});
